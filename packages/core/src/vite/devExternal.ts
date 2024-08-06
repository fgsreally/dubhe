import { type PluginOption, type UserConfig } from 'vite'
import type { Plugin } from 'esbuild'

export function DevExternal(external: Set<string>): PluginOption {
  const esbuildPlugin: Plugin = {
    name: 'vite-plugin-dev-external',
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.importer.includes('/node_modules/') && external.has(args.path))
          return { path: args.path, external: true }
      })
      // build.onLoad({ filter: /.*/ }, (args) => {
      //   if (filter(args.path))
      //     return { contents: '' }
      // })
    },
  }

  return {
    name: 'vite-plugin-dev-external',
    enforce: 'pre',
    apply: 'serve',
    config(): UserConfig {
      return {
        optimizeDeps: {
          include: [...external],
          esbuildOptions: {
            // @ts-expect-error esbuild version
            plugins: [esbuildPlugin],
          },
        },
      }
    },

    resolveId: (id) => {
      if (external.has(id))
        return { id, external: true }

      return null
    },

    load: (id) => {
      if (external.has(id))
        return { code: 'export default {};' }
    },
    transform: {
      order: 'post',
      handler: (code: string) => {
        if (external.size === 0)
          return code

        const viteImportAnalysisModulePrefix = '/@id/'
        const prefixedImportRegex = new RegExp(
          `${viteImportAnalysisModulePrefix}(${[...external].join('|')})`,
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
