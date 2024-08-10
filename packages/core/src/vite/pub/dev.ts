import type { PluginOption } from 'vite'
import { DevImportmap } from '../devImportmap'
import { createDubhePkgJson, zipDubheDir } from '../share'
import type { PubDevConfig, PubOptions } from './types'

export function PubDev(options: PubOptions): PluginOption {
  const { version, external, entries, dir, name } = options
  const pkgJson = createDubhePkgJson(options)
  return [
    DevImportmap(new Set(external)),
    {

      name: 'vite-plugin-dubhe-pub-dev',
      apply: 'serve',

      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'GET') {
            if (req.url === '/dubhe.json') {
              res.end(JSON.stringify({
                dev: true,
                version,
                external,
                entries,
                name: `@dubhe/${name}`,
              } as PubDevConfig))
              return
            }
            if (req.url === '/dubhe.zip') {
              res.write(await zipDubheDir(dir, pkgJson))
              res.end()
              return
            }
          }
          next()
        })
      },
    },
  ]
}
