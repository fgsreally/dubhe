import fs from 'fs'
import type { PluginOption } from 'vite'
import { createFilter } from 'vite'
import { InjectStyle } from '../injectStyle'
import type { PubOptions, PubProdConfig } from './types'
import { createDubhePkgJson, zipDubheDir } from './share'
export function PubBundle(options: PubOptions) {
  const { version, external, entries, dir, name } = options
  const filter = createFilter(external)
  const pkgJson = createDubhePkgJson(options)
  const depSet = new Set<string>()
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
        depSet.add(source)
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
            entriesMap[key] = data[key].fileName
        }

        this.emitFile({
          type: 'asset',
          name: 'dubhe.json',
          fileName: 'dubhe.json',

          source: JSON.stringify({
            name,
            version,
            timestamp: new Date().toLocaleString(),
            dependences: [...depSet],
            entries: entriesMap,
          } as PubProdConfig),
        })
      },
    },
  }]
}
