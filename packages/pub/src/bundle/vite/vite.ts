import { basename, extname, relative, resolve } from 'path'
import fs from 'fs'
import { normalizePath } from 'vite'
import type { PluginOption, UserConfig } from 'vite'
import { init } from 'es-module-lexer'
import fse from 'fs-extra'
// import contentHash from 'content-hash'
import type {
  OutputChunk,
  OutputOptions,
} from 'rollup'

import type { PubConfig } from 'dubhe'
import {
  ImportExpression,
  VIRTUAL_HMR_PREFIX,
  addExtension,
  copySourceFile,
  createEntryFile,
  getAlias,
  getFormatDate,
  getRelatedPath,
  isSourceFile,
  log,
  replaceEntryFile,
  sendHMRInfo,
} from 'dubhe'
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
const externalSet = new Set<string>()

// let vendor: string[]
const root = process.cwd()

export function isExternal(id: string, handler: (param: string) => boolean | void) {
  return handler(id)
}

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
      if (!opts.base)
        opts.base = '/__dubhe/'

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

      // let userManualChunks = output.manualChunks
      // const dubheManualChunks = (id: string, { getModuleInfo }: any) => {
      //   // if (chunkSet.has(id))
      //   //   return basename(id).split('.')[0]
      // }

      // output.manualChunks = (id: string, api: GetManualChunkApi) => {
      //   if (typeof userManualChunks !== 'function')
      //     userManualChunks = () => null
      //   return userManualChunks(id, api) ?? dubheManualChunks(id, api)
      // }
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

      const bundleGraph: { [key: string]: string[] } = {}
      const outputSourceGraph: { [key: string]: string[] } = {}
      const outputimportsGraph: { [key: string]: string[] } = {}

      for (const i in data) {
        if (!i.includes(`.dubhe-${config.project}.js`))
          continue

        const name = i.split('.')[0] // filename

        bundleGraph[name] = [];
        (data[i] as any).imports.forEach((item: string) => {
          if (item.includes(`.dubhe-${config.project}.js`))
            bundleGraph[name].push(item)
        })
      }
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
        bundleGraph,
        // pkgVersionMap,
      }

      if (config.beforeEmit)
        await config.beforeEmit(metaData);

      (this as any).emitFile({
        type: 'asset',
        name: 'remoteList',
        fileName: 'remoteList.json',
        source: JSON.stringify(metaData),
      })
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
