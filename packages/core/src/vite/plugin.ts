import { relative, resolve } from 'path'

import { type PluginOption, normalizePath } from 'vite'
import fse from 'fs-extra'
// import contentHash from 'content-hash'
import type {
  OutputChunk,
} from 'rollup'

import debug, { log } from 'debug'
import { Dubhe } from '../dubhe'
import { DUBHE_PATH_SYMBOL, VIRTUAL_HMR_PREFIX } from '../common'
import { getExposeFromBundle } from '../core'
import { sendHMRInfo } from '../hmr'
import { copySourceFile, isSourceFile } from '../pub'
import { injectScriptToPub } from '../style'
import type { PubOptions } from '../types'
import { getFormatDate, getRelatedPath } from '../utils'
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

export function BundlePlugin(config: PubOptions): PluginOption {
  // metaData = config.meta || {};

  const core = new Dubhe()

  return {
    name: 'dubhe:bundle',
    apply: 'build',
    enforce: 'pre',

    // init config
    async config() {
      return {
        base: DUBHE_PATH_SYMBOL,
        build: {
          outDir: `${core.outputDir}/esm`,
          lib: config.app
            ? undefined
            : {
                entry: config.entry,
                name: 'remoteEntry',
                formats: ['es'],
                fileName: () => {
                  return 'remoteEntry.js'
                },
              },

        },
      }
    },

    async buildStart() {
      if (isWatch)
        return
      if (config.app) {
        for (const i in config.entry) {
          this.emitFile({
            type: 'chunk',
            id: config.entry[i],
            name: i,
            preserveSignature: 'allow-extension',

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

      // alias.forEach(item => item.url = this.getFileName(item.url))
      importsGraph = getExposeFromBundle(data)
      Debug('generate bundleGraph/sourceGraph')
      for (const i in data) {
        if (!i.endsWith('.js'))
          continue
        const { isEntry, name, fileName, imports } = data[i] as any
        if (isEntry && name !== 'index') {
          alias.push({ name, url: fileName })
          if (alias.some(item => item.name === name)) {
            bundleGraph[name] = []
            imports.forEach((item: string) => {
              if (item.includes(`.dubhe-${config.project}`))
                bundleGraph[name].push(item)
            })
          }
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
        externals: [...externalSet],
        alias,
        entryFileMap,
        sourceGraph: outputSourceGraph,
        importsGraph,
        bundleGraph,
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
      if (isExternal(id, config.externals)) {
        externalSet.add(id)

        return {
          id, external: true,
        }
      }
    },

  }
}
