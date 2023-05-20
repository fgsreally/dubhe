import { relative, resolve } from 'path'
import { normalizePath } from 'vite'
import type { PluginOption } from 'vite'
import fse from 'fs-extra'
// import contentHash from 'content-hash'
import type {
  OutputChunk,
} from 'rollup'

import type { PubConfig } from 'dubhe'
import {
  DUBHE_PATH_SYMBOL,
  VIRTUAL_HMR_PREFIX,
  copySourceFile,
  createEntryFile,
  getExposeFromBundle,
  getFormatDate,
  getRelatedPath,
  injectScriptToPub,
  isSourceFile,
  log,
  removeEntryFile,
  sendHMRInfo,
} from 'dubhe'
import debug from 'debug'
interface HMRInfo {
  changeFile: string
  cssFiles: { [key in string]: number }
}
const HMRconfig: HMRInfo = {
  changeFile: '',
  cssFiles: {},
}
const entryFileMap: { [key: string]: string } = {}
let metaData: any
const alias: { name: string; url: string }[] = []
const sourceGraph: { [key: string]: Set<string> } = {}
let importsGraph: { [key: string]: string[] }
const externalSet = new Set<string>()
const Debug = debug('dubhe:pub')
// let vendor: string[]
const root = process.cwd()

export function isExternal(id: string, handler: (param: string) => any) {
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
    async config() {
      return {
        base: DUBHE_PATH_SYMBOL,
        build: {
          outDir: `${outDir}/core`,
          lib: config.app
            ? undefined
            : {
                entry: entryFile,
                name: 'remoteEntry',
                formats: ['es'],
                fileName: () => {
                  return 'remoteEntry.js'
                },
              },
          cssCodeSplit: true,

          rollupOptions: {
            output: {
              entryFileNames: `[name].dubhe-${config.project}.[hash].js`,
              chunkFileNames: `[name].dubhe-${config.project}.[hash].js`,
            },
          },
        },
      }
    },
    buildEnd() {
      removeEntryFile()
    },
    async buildStart() {
      if (!config.app)
        await createEntryFile()
      for (const i in config.entry) {
        const id = this.emitFile({
          type: 'chunk',
          id: config.entry[i],
          name: i,
          preserveSignature: 'allow-extension',

        })
        alias.push({ name: i, url: id })
      }
    },

    watchChange(id: string, change: any) {
      if (change.event === 'update')
        HMRconfig.changeFile = id.replace(/\\/g, '/')
    },
    // // for outline css

    async writeBundle(_: any, module: any) {
      const updateList: string[] = []

      if (HMRconfig.changeFile && config.HMR) {
        for (const i in module) {
          if (module[i].modules && HMRconfig.changeFile in module[i].modules)
            updateList.push(i)
        }
        log('send HMR info')

        for (const home of config.HMR) {
          sendHMRInfo({
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
      }
    },
    transformIndexHtml(html) {
      return {
        html: html.replaceAll(DUBHE_PATH_SYMBOL, './'),
        tags: [
          {
            tag: 'script',

            children: injectScriptToPub(config.project),
            injectTo: 'head-prepend',
          },
        ],
      }
    },

    async generateBundle(_, data) {
      const bundleGraph: { [key: string]: string[] } = {}
      const outputSourceGraph: { [key: string]: string[] } = {}
      alias.forEach(item => item.url = this.getFileName(item.url))
      importsGraph = getExposeFromBundle(data)
      Debug('generate bundleGraph/sourceGraph')
      for (const i in data) {
        if (!i.endsWith('.js'))
          continue
        const name = i.split('.dubhe')[0]
        if (alias.some(item => item.name === name)) {
          bundleGraph[name] = [];
          (data[i] as any).imports.forEach((item: string) => {
            if (item.includes(`.dubhe-${config.project}`))
              bundleGraph[name].push(item)
          })
        }
        for (const entry of alias.map(({ name }) => name)) {
          if (name === entry) {
            const entryFilePath = (entryFileMap[name]
              = getRelatedPath(
                (data[i] as OutputChunk).facadeModuleId as string,
              ))
            if (!sourceGraph[entryFilePath])
              sourceGraph[entryFilePath] = new Set()
            Object.keys((data[i] as OutputChunk).modules).forEach((fp) => {
              if (isSourceFile(fp))
                sourceGraph[entryFilePath].add(getRelatedPath(fp))
            })

            if ((data[i] as OutputChunk).imports) {
              (data[i] as OutputChunk).imports.forEach((item) => {
                if (item in data) {
                  Object.keys((data[item] as OutputChunk).modules || {}).forEach((fp) => {
                    if (isSourceFile(fp))
                      sourceGraph[entryFilePath].add(getRelatedPath(fp))
                  })
                }
              })
            }
          }
        }
      }

      for (const i in sourceGraph)
        outputSourceGraph[i] = [...sourceGraph[i]]

      metaData = {
        type: 'publish',
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
        importsGraph,
        bundleGraph,
        // pkgVersionMap,
      }

      if (config.beforeEmit)
        await config.beforeEmit(metaData)

      Debug('output dubheList.json');

      (this as any).emitFile({
        type: 'asset',
        name: 'dubheList',
        fileName: 'dubheList.json',
        source: JSON.stringify(metaData),
      })
      if (config.source && !isWatch) {
        log('Copy source file to source dir')
        Debug('output source files')

        isWatch = true
        fse.ensureDirSync(resolve(root, outDir, 'source'));
        [...new Set(Object.values(outputSourceGraph).flat())].forEach((item) => {
          copySourceFile(item, outDir)
        })
      }
    },

    resolveId(id) {
      // if (importer === 'dubhe') {
      //   log(`Find entry file --${id}`)

      //   const filePath = normalizePath(resolve(root, id))
      //   if (!initEntryFiles.includes(filePath))
      //     initEntryFiles.push(filePath)
      // }
      // if (importer)
      //   resolveImport(resolve(importer, id))
      if (isExternal(id, config.externals)) {
        externalSet.add(id)

        return {
          id, external: true,
        }
      }
    },

  }
}
