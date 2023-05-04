import { resolve } from 'path'
import { Pub } from 'dubhe-pub/vite'
import type { HtmlTagDescriptor, PluginOption } from 'vite'
import type { PubConfig } from 'dubhe-pub'

import { DEFAULT_POLYFILL } from 'dubhe-pub'
import { state } from './state'
export { state }

export type FederationType = PubConfig & {
  polyfill?: {
    importMap?: string | boolean
    systemjs?: string | boolean
  }
}
/**
 * more like federation
 * @experiment
 * it only work when following rules
 */
export function Federation(options: FederationType): PluginOption {
  const entries: Record<string, string> = {}
  let cwd: string
  if (process.pid !== process.ppid) {
    options.outDir = 'dist/.dubhe'

    return [{
      name: 'dubhe-bundle',
      apply: 'build',
      async config() {
        const { execa } = await import('execa')
        execa('vite', process.argv.slice(2)).then(({ stderr }) => {
          console.error(stderr)
        })
      },
    }, Pub(options)]
  }
  const { externals } = options
  return {
    name: 'dubhe-app',
    apply: 'build',

    config() {
      return {
        build: {
          emptyOutDir: false,
        },
      }
    },
    configResolved(config) {
      cwd = config.root
      for (const i in options.entry)
        entries[resolve(cwd, options.entry[i])] = i
    },
    resolveId(id, importer) {
      if (externals(id)) {
        state.externalSet.add(id)
        const ret = externals(id)
        if (typeof ret === 'object') {
          const { systemjs, esm } = ret

          if (systemjs || esm) {
            if (esm)
              state.esmImportMap[id] = esm
            if (systemjs)
              state.systemjsImportMap[id] = systemjs
          }
        }
        return { external: true, id }
      }
      const filePath = (resolve(cwd, importer || '', id))
      if (filePath in entries)
        return { id: `/.dubhe/core/${entries[filePath]}.dubhe-${options.project}.js`, external: true }
    },
    transformIndexHtml(html: string) {
      const tags = [] as HtmlTagDescriptor[]
      tags.push({
        tag: 'script',
        attrs: {
          type: 'importmap',
        },
        children: `{"imports":${JSON.stringify(state.esmImportMap)}}`,
        injectTo: 'head',
      })
      tags.push({
        tag: 'script',
        attrs: {
          type: 'systemjs-importmap',
          nomodule: true,
        },
        children: `{"imports":${JSON.stringify(state.systemjsImportMap)}}`,
        injectTo: 'head',
      })

      if (options.polyfill?.importMap) {
        tags.push({
        // importmap polyfill
          tag: 'script',
          attrs: {
            src: options.polyfill.importMap === true ? DEFAULT_POLYFILL.importMap : options.polyfill.importMap,
          },
          injectTo: 'head-prepend',
        })
      }
      if (options.polyfill?.systemjs) {
        tags.push({
        // systemjs polyfill
          tag: 'script',
          attrs: {
            nomodule: true,
            src: options.polyfill.systemjs === true ? DEFAULT_POLYFILL.systemjs : options.polyfill.systemjs,
          },
          injectTo: 'head-prepend',
        })
      }

      return {
        html,
        tags,
      }
    },
  }
}
