import { basename, relative, resolve } from 'path'
import fs from 'fs'
import type { PluginOption, UserConfig } from 'vite'
import { init } from 'es-module-lexer'
import fse from 'fs-extra'
import contentHash from 'content-hash'
import { normalizePath } from 'vite'
import type {
  GetManualChunkApi,

  OutputChunk,
  OutputOptions,
} from 'rollup'

import type { remoteConfig } from '../types'
import { VIRTUAL_HMR_PREFIX } from '../common/common'
import {
  ImportExpression,
  copySourceFile,
  getAlias,
  getRelatedPath,
  isSourceFile,
  log,
  replaceEntryFile,
  sendHMRInfo,
} from '../utils'
import { getSplitChunk } from '../utils/splitPkg'
interface HMRInfo {
  changeFile: string
  cssFiles: { [key in string]: number }
}
const HMRconfig: HMRInfo = {
  changeFile: '',
  cssFiles: {},
}
const initEntryFiles: string[] = []
const entryFileMap: { [key: string]: string } = {}
let metaData: any
let alias: { name: string; url: string }[]
const sourceGraph: { [key: string]: Set<string> } = {}
const importsGraph: { [key: string]: Set<string> } = {}
// let dependenceGraph: { [key: string]: Set<string> } = {};
const entryDepMap: { [key: string]: number } = {}
const chunkSet: Set<string> = new Set()
function resolveImport(id: string) {
  if (fse.existsSync(id) && initEntryFiles.includes(id)) {
    if (!entryDepMap[id])
      entryDepMap[id] = 0
    if (entryDepMap[id] > 0)
      chunkSet.add(id)
    entryDepMap[id]++
  }
}

export function BundlePlugin(config: remoteConfig): PluginOption {
  // metaData = config.meta || {};
  const entryFile = config.entry || 'src/dubhe.ts'
  const outDir = config.outDir || '.dubhe'

  // 返回的是插件对象
  return {
    name: 'dubhe::bundle',
    apply: 'build',
    enforce: 'pre',

    // init config
    async config(opts: UserConfig) {
      await init
      const vendor = config.vendor || []
      if (!opts.build)
        opts.build = {}
      if (!opts.build.outDir)
        opts.build.outDir = `${outDir}/core`

      if (config.cssSplit)
        opts.build.cssCodeSplit = true

      if (!opts.build.lib) {
        opts.build.lib = {
          entry: entryFile,
          name: 'remoteEntry',
          formats: ['es'],
          fileName: () => {
            return 'remoteEntry.js'
          },
        }
      }

      if (opts.build.emptyOutDir === undefined)
        opts.build.emptyOutDir = false
      if (!opts.build.rollupOptions)
        opts.build.rollupOptions = {}

      if (!opts.build.rollupOptions.output)
        opts.build.rollupOptions.output = {}

      const output = opts.build.rollupOptions.output as OutputOptions
      output.chunkFileNames
        = (ChunkInfo) => {
          if (ChunkInfo.facadeModuleId)
            return '[name].js'
          return '[name]-[hash].js'
        }
      output.assetFileNames
        = '[name][extname]'

      let userManualChunks = output.manualChunks
      const dubheManualChunks = (id: string) => {
        if (vendor.includes(id))
          return 'vendor'

        if (chunkSet.has(id))
          return basename(id).split('.')[0]
      }

      output.manualChunks = (id: string, api: GetManualChunkApi) => {
        if (typeof userManualChunks !== 'function')
          userManualChunks = () => null
        return userManualChunks(id, api) ?? dubheManualChunks(id)
      }
    },

    watchChange(id: string, change: any) {
      if (change.event === 'update')
        HMRconfig.changeFile = id.replace(/\\/g, '/')
    },

    async writeBundle(_: any, module: any) {
      const updateList: string[] = []
      if (HMRconfig.changeFile && config.HMR) {
        for (const i in module) {
          if (i.endsWith('.css')) {
            const cssHash = contentHash.encode('onion', module[i].source)
            if (cssHash !== HMRconfig.cssFiles[i]) {
              updateList.push(i)
              HMRconfig.cssFiles[i] = cssHash
            }
          }
        }
        for (const i of module['remoteEntry.js'].dynamicImports) {
          if (HMRconfig.changeFile in module[i].modules)
            updateList.push(i)
        }
        try {
          const ret = await sendHMRInfo({
            url: `${config.HMR?.homePort}/${VIRTUAL_HMR_PREFIX}`,
            types: config.types || false,
            project: config.HMR.projectName,
            module: updateList,
            file: normalizePath(
              relative(
                resolve(process.cwd(), entryFile, '../'),
                HMRconfig.changeFile,
              ),
            ),
          })

          if (ret)
            log('Send HMR information to home ')

          else
            log('Fail to send HMR information\n', 'red')
        }
        catch (e) {
          log(`Fail to collect HMR information\n${e}`, 'red')
        }
      }
      else {
        for (const i in module) {
          if (i.endsWith('.css')) {
            const cssHash = contentHash.encode('onion', module[i].source)
            HMRconfig.cssFiles[i] = cssHash
          }
        }
      }
    },
    generateBundle(_, data) {
      const code = ((data['remoteEntry.js'] as OutputChunk).code
        = replaceEntryFile(
          (data['remoteEntry.js'] as OutputChunk).code,
          fs.readFileSync(resolve(process.cwd(), entryFile)).toString(),
        ))
      alias = ImportExpression(code)

      for (const i in data) {
        for (const entry of initEntryFiles) {
          if (`${basename(entry).split('.')[0]}.js` === i) {
            const entryFilePath = (entryFileMap[getAlias(i, alias) as string]
              = getRelatedPath(
                (data[i] as OutputChunk).facadeModuleId as string,

              ))
            if (!sourceGraph[entryFilePath])
              sourceGraph[entryFilePath] = new Set()
            Object.keys((data[i] as OutputChunk).modules).forEach((fp) => {
              if (isSourceFile(fp))
                sourceGraph[entryFilePath].add(getRelatedPath(fp))
            });
            (data[i] as OutputChunk).imports.forEach((item) => {
              if (item in data) {
                Object.keys((data[item] as OutputChunk).modules).forEach((fp) => {
                  if (isSourceFile(fp))
                    sourceGraph[entryFilePath].add(getRelatedPath(fp))
                })
              }
            })
            Object.entries((data[i] as OutputChunk).importedBindings).forEach(
              (item) => {
                const packageName = item[0]
                if (!(packageName in data)) {
                  if (!importsGraph[packageName])
                    importsGraph[packageName] = new Set()

                  item[1].forEach(f => importsGraph[packageName].add(f))
                }
              },
            )
          }
        }
      }

      const outputSourceGraph: { [key: string]: string[] } = {}
      const outputimportsGraph: { [key: string]: string[] } = {}
      for (const i in sourceGraph)
        outputSourceGraph[i] = [...sourceGraph[i]]

      for (const i in importsGraph)
        outputimportsGraph[i] = [...importsGraph[i]]

      metaData = {
        meta: config.meta || null,
        version: config.version || '0.0.0',
        timestamp: Date.now(),
        files: Object.keys(data),
        externals: Object.keys(config.externals),
        config,
        alias,
        initEntryFiles,
        entryFileMap,
        sourceGraph: outputSourceGraph,
        importsGraph: outputimportsGraph,
      };

      (this as any).emitFile({
        type: 'asset',
        name: 'remoteList',
        fileName: 'remoteList.json',
        source: JSON.stringify(metaData),
      })

      if (config.source) {
        fse.ensureDirSync(resolve(process.cwd(), outDir, 'source'));
        [...new Set(Object.values(outputSourceGraph).flat())].forEach((item) => {
          copySourceFile(item, outDir)
        })
      }
    },

    resolveId(id, importer) {
      if (importer === normalizePath(resolve(process.cwd(), entryFile))) {
        log(`Find entry file --${id}`)
        const fileName = normalizePath(
          relative(process.cwd(), resolve(importer, '../', id)),
        )
        if (!initEntryFiles.includes(fileName))
          initEntryFiles.push(fileName)
      }
      if (importer)
        resolveImport(resolve(importer, id))
      if (config.importMap) {
        if (id in config.externals)
          return { id, external: true }
      }
      else {
        if (id in config.externals)
          return { id: config.externals[id], external: true }
      }
    },

  }
}
