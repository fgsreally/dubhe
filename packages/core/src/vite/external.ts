import { type PluginOption, type UserConfig, createFilter } from 'vite'
import type { Plugin } from 'esbuild'

export interface ExternalOpts {
  externals?: Record<string, string | null>
  optimize?: boolean
}

export function External(externals: string[]) {
  const resolvedExternals = new Set<string>()
  const filter = createFilter(externals)

  const esbuildPlugin: Plugin = {
    name: 'External',
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

  let isDev: boolean
  return <PluginOption>{
    name: 'vite-plugin-externalize',
    enforce: 'pre',
    config: (_, { command }): UserConfig | undefined => {
      isDev = command === 'serve'
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
        return { id, external: true }

      if (filter(id)) {
        resolvedExternals.add(id)
        return { id, external: true }
      }

      return null
    },

    load: (id) => {
      if (!isDev)
        return

      if (resolvedExternals.has(id))
        return { code: 'export default {};' }

      return null
    },
    transform: {
      order: 'post',
      handler: (code: string) => {
        if (!isDev)
          return
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
