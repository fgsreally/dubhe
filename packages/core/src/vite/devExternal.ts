import { type PluginOption, type UserConfig, createFilter } from 'vite'
import type { Plugin } from 'esbuild'

export interface ExternalOpts {
  externals?: Record<string, string | null>
  optimize?: boolean
}

export function DevExternal(externals: string[]) {
  const resolvedExternals = new Set<string>()
  const filter = createFilter(externals)

  const esbuildPlugin: Plugin = {
    name: 'vite-plugin-dev-external',
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.importer && filter(args.path)) {
          resolvedExternals.add(args.path)

          return { path: args.path, external: true }
        }

        return null
      })
      build.onLoad({ filter: /.*/ }, (args) => {
        if (filter(args.path))
          return { contents: '' }

        return null
      })
    },
  }

  return <PluginOption>{
    name: 'vite-plugin-dev-external',
    enforce: 'pre',
    apply: 'serve',
    config: (): UserConfig | undefined => {
      return {
        optimizeDeps: {
          //   include: optimize ? importmap : undefined,
          esbuildOptions: {
            // @ts-expect-error esbuild version
            plugins: [esbuildPlugin],
          },
        },
      }
    },

    resolveId: (id) => {
      if (resolvedExternals.has(id))
        return id

      if (filter(id)) {
        resolvedExternals.add(id)
        return id
      }

      return null
    },

    load: (id) => {
      if (resolvedExternals.has(id))
        return { code: 'export default {};' }
    },
    transform: {
      order: 'post',
      handler: (code: string) => {
        if (resolvedExternals.size === 0)
          return code

        const viteImportAnalysisModulePrefix = '/@id/'
        const prefixedImportRegex = new RegExp(
                    `${viteImportAnalysisModulePrefix}(${[...resolvedExternals].join('|')})`,
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
  }
}
