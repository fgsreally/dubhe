import { basename, extname, relative, resolve } from 'path'
import fs from 'fs'
import { normalizePath } from 'vite'
import type { PluginOption, UserConfig } from 'vite'
import { init } from 'es-module-lexer'
import fse from 'fs-extra'
// import contentHash from 'content-hash'
import type {
  GetManualChunkApi,
  OutputChunk,
  OutputOptions,
} from 'rollup'

import type { PubConfig } from 'dubhe-lib'
import {
  ImportExpression,
  VIRTUAL_HMR_PREFIX,
  addExtension,
  copySourceFile,
  createEntryFile,
  getAlias,
  getFormatDate,
  getLocalPkgVersion,
  getRelatedPath,
  isSourceFile,
  log,
  replaceEntryFile,
  sendHMRInfo,
} from 'dubhe-lib'
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
// const entryDepMap: { [key: string]: number } = {}
const chunkSet: Set<string> = new Set()
const externalSet = new Set<string>()
const pkgVersionMap = {} as Record<string, string>

// let vendor: string[]
const root = process.cwd()

export function isExternal(id: string, handler: (param: string) => boolean | void) {
  return handler(id)
}

// function resolveImport(id: string) {
//   if (fse.existsSync(id) && initEntryFiles.includes(id)) {
//     if (!entryDepMap[id])
//       entryDepMap[id] = 0
//     if (entryDepMap[id] > 0)
//       chunkSet.add(id)
//     entryDepMap[id]++
//   }
// }

let isWatch = false

export function BundlePlugin(config: PubConfig): PluginOption {
  // metaData = config.meta || {};
  const entryFile = 'dubhe.ts'
  const outDir = config.outDir || '.dubhe'

  return {
    name: 'dubhe::bundle',
    apply: 'build',
    enforce: 'pre',

    // init config
    async config(opts: UserConfig) {
      await init
      await createEntryFile(config.entry)
      // vendor = config.vendor || []
      if (!opts.build)
        opts.build = {}
      if (!opts.build.outDir)
        opts.build.outDir = `${outDir}/core`

      // if (config.cssSplit)
      //   opts.build.cssCodeSplit = true

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

      // if (opts.build.emptyOutDir === undefined)
      //   opts.build.emptyOutDir = false
      if (!opts.build.rollupOptions)
        opts.build.rollupOptions = {}

      if (!opts.build.rollupOptions.output)
        opts.build.rollupOptions.output = {}

      const output = opts.build.rollupOptions.output as OutputOptions
      output.chunkFileNames
        = () => {
          return `[name].dubhe-${config.project}.js`// experiment
        }
      output.assetFileNames
        = '[name][extname]'

      let userManualChunks = output.manualChunks
      const dubheManualChunks = (id: string) => {
        // if (vendor.includes(id))
        //   return 'vendor'

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
          if (module[i].modules && HMRconfig.changeFile in module[i].modules)
            updateList.push(i)
        }

        for (const home of config.HMR) {
          setTimeout (async () => {
            try {
              log('Send HMR information to home ')
              await sendHMRInfo({
                url: `${home.port}/${VIRTUAL_HMR_PREFIX}`,
                types: config.types || false,
                project: config.project as string,
                module: updateList,
                file: normalizePath(
                  relative(
                    resolve(root, entryFile, '../'),
                    HMRconfig.changeFile,
                  ),
                ),
              })
            }
            catch (e) {
              log(`Fail to send HMR information---${home.port}`, 'red')
            }
          }, 1000)
        }

        // try {

        //   //   log('Send HMR information to home ')

        //   // else
        //   //   log('Fail to send HMR information\n', 'red')
        // }
        // catch (e) {
        //   log(`Fail to collect HMR information\n${e}`, 'red')
        // }
      }
      else {
        // for (const i in module) {
        //   if (i.endsWith('.css')) {
        //     const cssHash = contentHash.encode('onion', module[i].source)
        //     HMRconfig.cssFiles[i] = cssHash

        //   }
        // }
      }
    },
    async generateBundle(_, data) {
      const code = ((data['remoteEntry.js'] as OutputChunk).code
        = replaceEntryFile(
          (data['remoteEntry.js'] as OutputChunk).code,
          fs.readFileSync(resolve(root, entryFile)).toString(),
        ))
      alias = ImportExpression(code)

      for (const i in data) {
        const name = i.split('.dubhe')[0]
        for (const entry of initEntryFiles) {
          if (name === basename(entry, extname(entry))) {
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

      // if (!HMRconfig.changeFile) {
      //   for (const i in outputimportsGraph) {
      //     const { name, version } = await getLocalPkgVersion(i)
      //     if (!(name in pkgVersionMap))
      //       pkgVersionMap[name] = version as any
      //   }
      // }

      metaData = {
        from: 'vite',
        meta: config.meta || null,
        version: config.version || '0.0.0',
        timestamp: getFormatDate(),
        files: Object.keys(data),
        externals: [...externalSet],
        alias,
        // initEntryFiles,
        entryFileMap,
        sourceGraph: outputSourceGraph,
        importsGraph: outputimportsGraph,
        // pkgVersionMap,
      }

      if (config.beforeEmit) {
        await config.beforeEmit(metaData);

        (this as any).emitFile({
          type: 'asset',
          name: 'remoteList',
          fileName: 'remoteList.json',
          source: JSON.stringify(metaData, (k, v) => {
            if (typeof v === 'function')
              return v.toString()

            return v
          }),
        })
      }

      if (config.source && !isWatch) {
        log('Copy source file to source dir')
        isWatch = true
        fse.ensureDirSync(resolve(root, outDir, 'source'));
        [...new Set(Object.values(outputSourceGraph).flat())].forEach((item) => {
          copySourceFile(item, outDir)
        })
      }
    },

    resolveId(id, importer) {
      if (importer === normalizePath(resolve(root, entryFile))) {
        log(`Find entry file --${id}`)

        const filePath = id.startsWith('.') ? normalizePath(resolve(importer, '../', addExtension(id))) : id
        if (!initEntryFiles.includes(filePath))
          initEntryFiles.push(filePath)
      }
      // if (importer)
      //   resolveImport(resolve(importer, id))
      if (isExternal(id, config.externals)) {
        externalSet.add(id)

        return {
          id, external: true,
        }
        // if (config.importMap) {
        //   externalsMap[id] = id

        //   return {
        //     id, external: true,
        //   }
        // }
        // else {
        //   externalsMap[externalID] = id
        //   return { id: externalID, external: true }
        // }
      }
    },
    // transform(code, id) {
    //   if (config.limit && !initEntryFiles.includes(id) && fse.existsSync(resolve(root, id)) && normalizePath(resolve(root, entryFile)) !== id && code.length < config.limit)
    //     vendor.push(id)
    // },

  }
}
