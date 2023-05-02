import fs from 'fs'
import type { PluginOption } from 'vite'
import type { PubConfig } from 'dubhe'
import type { ResolvedId } from 'rollup'
import debug from 'debug'
import { isExternal } from './vite'
const Debug = debug('dubhe:pub')
export function DevPlugin(conf: PubConfig): PluginOption {
  const externals = new Set<string>()
  return {
    name: 'dubhe::dev',
    apply: 'serve',
    enforce: 'pre',

    async resolveId(id, i) {
      if (isExternal(id, conf.externals) && i !== 'dubhe') {
        externals.add(id)
        Debug(`find external dependence --${id}`)
        return id
      }
      if (externals.has(i!)) {
        const { id: resolveImporter } = await this.resolve(i!, 'dubhe') as ResolvedId
        const { id: resolveID } = await this.resolve(id, resolveImporter) as ResolvedId
        return resolveID
      }
    },
    async  load(id) {
      if (externals.has(id)) {
        const { id: resolveID } = await this.resolve(id, 'dubhe') as any
        Debug(`load external dependence--${resolveID}`)

        return fs.promises.readFile(resolveID.split('?')[0], 'utf-8')
      }
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req?.url === '/dubhe')
          res.end(JSON.stringify({ entry: conf.entry, externals: [...externals], isDubhe: true }))

        else next()
      })
    },
  }
}

