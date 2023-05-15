import { basename, relative, resolve } from 'path'
import { INJECT_STYLE_SCRIPT, VIRTUAL_HMR_PREFIX, analyseImport, getFormatDate, log, mountStyle, sendHMRInfo, virtualCssHelper } from 'dubhe'
import type { ProPlugin } from 'esbuild-plugin-merge'

import type { Metafile, OutputFile } from 'esbuild'
import fse from 'fs-extra'
import type { PubConfig } from 'dubhe'
import debug from 'debug'
import { isExternal } from './vite/vite'
const Debug = debug('dubhe:pub')
const root = process.cwd()
const externalSet = new Set<string>()
export function CSSPlugin(): ProPlugin {
  return {
    name: 'dubhe::css',
    enforce: 'post',
    setup(build) {
      const cssReg = new RegExp(virtualCssHelper)
      build.onTransform({ filter: /\.css$/ }, (ret, params) => {
        if (params.path.includes('main.css'))
          return
        if (ret.loader !== 'js') {
          Debug(`transform css file --${params.path}`)
          ret.contents = mountStyle(ret.contents as string, params.path)
          ret.loader = 'js'
        }
      })

      build.onResolve({ filter: cssReg }, (args) => {
        Debug(`resolve css file path --${args.path}`)

        return {
          path: resolve(args.resolveDir, args.path),
        }
      })

      build.onLoad({ filter: cssReg }, () => {
        return { contents: INJECT_STYLE_SCRIPT, loader: 'js' }
      })
    },
  }
}

export function BundlePlugin(config: PubConfig): ProPlugin {
  const outdir = config.outDir || '.dubhe'
  return {
    name: 'dubhe::bundle',
    async setup(build) {
      let changeFile = ''
      const alias: any = []
      const entryFileMap = config.entry
      const importsGraph = {} as Record<string, Set<string>>
      build.onUpdate((id) => {
        changeFile = id
      })
      build.initialOptions = Object.assign(build.initialOptions, {
        entryPoints: Object.values(config.entry),
        outdir: `${outdir}/core`,
        splitting: true,
        format: 'esm',
        bundle: true,
        write: false,
        metafile: true,
        entryNames: `[name].dubhe-${config.project}.[hash]`,
        chunkNames: `[name].dubhe-${config.project}.[hash]`,
      })

      build.onResolve({ filter: /\.*/ }, (args) => {
        if (isExternal(args.path, config.externals)) {
          Debug(`find external--${args.path} `)

          externalSet.add(args.path)
          return { path: args.path, external: true }
        }
      })
      build.onEnd(async (ret) => {
        const outputs = (ret.outputFiles as OutputFile[])
        const meta = (ret.metafile as Metafile)
        const sourceGraph = {} as Record<string, Set<string> | string[]>

        Debug('generate sourceGraph')

        Object.entries(meta.outputs).forEach(([filename, item]) => {
          Object.entries(entryFileMap).forEach(([name, entry]) => {
            if (resolve(root, item.entryPoint || '') === resolve(root, entry)) {
              alias.push({ name, url: basename(filename) })
              sourceGraph[entry] = new Set()
              Object.keys(item.inputs).forEach((input) => {
                if (fse.existsSync(resolve(root, input)))
                  (sourceGraph[entry] as Set<string>).add(input)
              })
            }
          })
        })

        const bundleGraph = {} as Record<string, string[]>

        Debug('generate bundleGraph')

        for (const i in meta.outputs) {
          if (!i.includes(`.dubhe-${config.project}.`))
            continue
          const name = basename(i).split('.')[0]
          bundleGraph[name] = []
          meta.outputs[i].imports.forEach((item) => {
            if (item.path.includes(`.dubhe-${config.project}`))
              bundleGraph[name].push(basename(item.path))
          })
        }

        for (const i in sourceGraph)
          sourceGraph[i] = [...sourceGraph[i]]

        if (outputs.length === 0)
          return

        Debug('output bundle')

        for (const i of outputs)
          await fse.outputFile(i.path, i.text, 'utf-8')
        if (changeFile) {
          Debug('send HMR info')

          for (const home of (config.HMR || [])) {
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
          Debug('generate importsGraph')

          for (const i of outputs) {
            if (i.path.endsWith('.js')) {
              Object.entries(analyseImport(i.text)).forEach(([k, v]) => {
                if (!importsGraph[k])
                  importsGraph[k] = new Set()
                v.forEach((imported) => {
                  importsGraph[k].add(imported)
                })
              })
            }
          }

          for (const importer in importsGraph)
            (importsGraph as any)[importer] = [...importsGraph[importer]]

          if (config.source) {
            Debug('output sourcefile')

            for (const i in (ret.metafile as Metafile).inputs) {
              const sourcePath = resolve(root, i)
              if (fse.existsSync(sourcePath)) {
                await fse.ensureFile(resolve(root, outdir, 'source', i))
                fse.copyFile(sourcePath, resolve(root, outdir, 'source', i))
              }
            }
          }
        }

        const metaData = {
          type: 'publish',
          from: 'esbuild',
          meta: config.meta,
          version: config.version || '0.0.0',
          timestamp: getFormatDate(),
          files: Object.keys(meta.outputs).map(item => item.slice(outdir.length + 6)),
          alias,
          externals: [...externalSet],
          importsGraph,
          entryFileMap,
          sourceGraph,
          bundleGraph,
        } as any
        if (config.beforeEmit)
          await config.beforeEmit(metaData)
        Debug('output dubheList.json')

        fse.outputJSON(resolve(root, outdir, 'core', 'dubheList.json'), metaData)
      })
    },
  }
}
