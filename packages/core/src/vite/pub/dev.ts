import type { PluginOption } from 'vite'
import { DevExternal } from '../devExternal'
import { OptimizeImportmap } from '../optimizeImportmap'
import type { PubDevConfig, PubOptions } from './types'
import { createDubhePkgJson, zipDubheDir } from './share'

export function PubDev(options: PubOptions): PluginOption {
  const { version, external, entries, dir } = options
  const pkgJson = createDubhePkgJson(options)
  return [
    DevExternal(external),
    OptimizeImportmap(),
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
