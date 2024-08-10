import { join } from 'path'
import fs from 'fs'
import type { PluginOption, UserConfig, ViteDevServer } from 'vite'
import type { Plugin } from 'esbuild'
import { createFilter } from './share'
export function DevImportmap(external: Set<string>): PluginOption {
  const metaDataPath = join('node_modules/.vite/deps', '_metadata.json')
  const resolvedExternal = new Set<string>()
  let server: ViteDevServer
  const esbuildPlugin: Plugin = {
    name: 'vite-plugin-dev-importmap',
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.importer.includes('/node_modules/') && external.has(args.path))
          return { path: args.path, external: true }
      })
      build.onEnd(({ metafile }) => {
        if (metafile && server) {
          setTimeout(() => {
            server.ws.send({ type: 'full-reload' })
          }, 1000)
        }
      })
    },
  }
  const filter = createFilter(external)
  return {
    name: 'vite-plugin-dev-importmap',
    enforce: 'pre',
    apply: 'serve',
    config(): UserConfig {
      return {
        optimizeDeps: {
          // include: [...external],
          esbuildOptions: {
            // @ts-expect-error esbuild version
            plugins: [esbuildPlugin],
          },
        },
      }
    },

    resolveId(id, importer) {
      if (importer !== '@dubhe' && filter(id)) {
        this.resolve(id, '@dubhe')
        resolvedExternal.add(id)
        return { id, external: true }
      }
    },

    load: (id) => {
      if (filter(id))
        return { code: 'export default {};' }
    },
    transform: {
      order: 'post',
      handler: (code: string) => {
        if (resolvedExternal.size === 0)
          return code
        const viteImportAnalysisModulePrefix = '/@id/'

        const prefixedImportRegex = new RegExp(
          `${viteImportAnalysisModulePrefix}(${[...resolvedExternal].join('|')})`,
          'g',
        )

        if (prefixedImportRegex.test(code)) {
          return code.replace(
            prefixedImportRegex,
            (_: string, externalName: string) => externalName,
          )
        }
        return code
      },
    },

    configureServer(s) {
      server = s
    },
    async transformIndexHtml(html) {
      if (!fs.existsSync(metaDataPath))

        return

      const imports: Record<string, string> = {}
      const metaData = JSON.parse(fs.readFileSync(metaDataPath, 'utf-8'))
      for (const key in metaData.optimized)
        imports[key] = `./node_modules/.vite/deps/${metaData.optimized[key].file}?${metaData.browserHash}`

      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'importmap',
            },
            injectTo: 'head-prepend',
            children: JSON.stringify({
              imports,
            }),
          },
        ],
      }
    },
  }
}
