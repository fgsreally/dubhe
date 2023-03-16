import { basename, relative, resolve } from 'path'
import { INJECT_STYLE, ImportExpression, VIRTUAL_HMR_PREFIX, analyseImport, createEntryFile, getFormatDate, log, mountStyle, sendHMRInfo, virtualCssHelper } from 'dubhe-lib'
import type { ProPlugin } from 'esbuild-plugin-merge'

import type { Metafile, OutputFile } from 'esbuild'
import fse from 'fs-extra'
import { init } from 'es-module-lexer'
import type { PubConfig } from 'dubhe-lib'
import { isExternal } from './vite/vite'
const root = process.cwd()
const externalSet = new Set<string>()
export function CSSPlugin(): ProPlugin {
  return {
    name: 'dubhe::css',
    enforce: 'post',
    setup(build) {
      const cssReg = new RegExp(virtualCssHelper)
      build.onTransform({ filter: /\.css$/ }, (ret, params) => {
        if (ret.loader !== 'js') {
          ret.contents = mountStyle(ret.contents as string, params.path)
          ret.loader = 'js'
        }
      })

      build.onResolve({ filter: cssReg }, (args) => {
        return {
          path: resolve(args.resolveDir, args.path),
        }
      })

      build.onLoad({ filter: cssReg }, () => {
        return { contents: INJECT_STYLE, loader: 'js' }
      })
    },
  }
}

export function BundlePlugin(config: Required<PubConfig>): ProPlugin {
  const outdir = config.outDir
  return {
    name: 'dubhe::bundle',
    async setup(build) {
      await init
      await createEntryFile(config.entry)
      let changeFile = ''
      let alias: any
      const importsGraph = {} as Record<string, Set<string>>
      build.onUpdate((id) => {
        changeFile = id
      })
      build.initialOptions = Object.assign(build.initialOptions, {
        entryPoints: ['dubhe.ts'],
        entryNames: 'remoteEntry',
        outdir: `${outdir}/core`,
        splitting: true,
        format: 'esm',
        bundle: true,
        write: false,
        metafile: true,
        chunkNames: `[name].dubhe-${config.project}`,
      })

      build.onResolve({ filter: /\.*/ }, (args) => {
        if (isExternal(args.path, config.externals)) {
          externalSet.add(args.path)
          return { path: args.path, external: true }
        }
      })
      build.onEnd(async (ret) => {
        const outputs = (ret.outputFiles as OutputFile[])
        const meta = (ret.metafile as Metafile)
        if (outputs.length === 0)
          return

        for (const i of outputs)
          await fse.outputFile(i.path, i.text, 'utf-8')
        if (changeFile) {
          for (const home of config.HMR) {
            setTimeout(async () => {
              try {
                log('Send HMR information to home ')
                await sendHMRInfo({
                  url: `${home.port}/${VIRTUAL_HMR_PREFIX}`,
                  types: config.types || false,
                  project: config.project as string,
                  module: [`${basename(changeFile).split('.')[0]}.dubhe-${config.project}.js`],
                  file: relative(
                    root,
                    changeFile,
                  ),
                })
              }
              catch (e) {
                log(`Fail to send HMR information---${home.port}`, 'red')
              }
            }, 1000)
          }
        }
        else {
          for (const i of outputs) {
            Object.entries(analyseImport(i.text)).forEach(([k, v]) => {
              if (!importsGraph[k])
                importsGraph[k] = new Set()
              v.forEach((imported) => {
                importsGraph[k].add(imported)
              })
            })
          }

          for (const importer in importsGraph)
            (importsGraph as any)[importer] = [...importsGraph[importer]]

          if (config.source) {
            for (const i in (ret.metafile as Metafile).inputs) {
              const sourcePath = resolve(root, i)
              if (fse.existsSync(sourcePath)) {
                await fse.ensureFile(resolve(root, outdir, 'source', i))
                fse.copyFile(sourcePath, resolve(root, outdir, 'source', i))
              }
            }
          }
          alias = ImportExpression(outputs[0].text)
        }

        const remoteList = {
          from: 'esbuild',
          meta: config.meta,
          version: config.version || '0.0.0',
          timestamp: getFormatDate(),
          files: Object.keys(meta.outputs).map(item => item.slice(outdir.length + 6)),
          alias,
          externals: [...externalSet],
          importsGraph,
        }
        fse.outputJSON(resolve(root, outdir, 'core', 'remoteList.json'), remoteList)
      })
    },
  }
}
