import fs from 'fs'
import type { PluginOption } from 'vite'
import { InjectStyle } from '../injectStyle'
import { createDubhePkgJson, createFilter, zipDubheDir } from '../share'
import type { PubOptions, PubProdConfig } from './types'
export function PubBundle(options: PubOptions) {
  const { version = '0.0.0', external, entries, dir, name } = options
  const pkgJson = createDubhePkgJson(options)
  const usedExternal = new Set<string>()

  const filter = createFilter(external)
  return [InjectStyle(), <PluginOption>{
    name: 'vite-plugin-dubhe-pub-bundle',
    enforce: 'pre',
    apply: 'build',

    config() {
      return {
        build: {
          lib: {
            entry: entries,
            formats: ['es'],
          },

          cssCodeSplit: true,
        },
      }
    },

    resolveId(source) {
      if (filter(source)) {
        usedExternal.add(source)
        return { id: source, external: true }
      }
    },

    generateBundle: {
      order: 'post',
      async handler(_, data) {
        if (!fs.existsSync(dir))
          fs.mkdirSync(dir)

        // detect dts

        this.emitFile({
          type: 'asset',
          name: 'dubhe.zip',
          fileName: 'dubhe.zip',

          source: await zipDubheDir(dir, pkgJson),
        })
        const entriesMap = {} as Record<string, string>
        for (const key in data) {
          if (data[key].type === 'chunk' && entries[data[key].name])
            entriesMap[data[key].name] = data[key].fileName
        }

        this.emitFile({
          type: 'asset',
          name: 'dubhe.json',
          fileName: 'dubhe.json',

          source: JSON.stringify({
            name: `@dubhe/${name}`,
            version,
            timestamp: new Date().toLocaleString(),
            external: [...usedExternal],
            entries: entriesMap,
          } as PubProdConfig),
        })
      },
    },
  }]
}
