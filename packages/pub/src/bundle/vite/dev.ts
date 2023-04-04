import fs from 'fs'
import type { PluginOption } from 'vite'
import type { PubConfig } from 'dubhe'
import type { ResolvedId } from 'rollup'
import { isExternal } from './vite'
import { normalize, relative } from 'path'
export function DevPlugin(conf: PubConfig): PluginOption {
  const externals = new Set<string>()
  const resolvedDepMap={} as Record<string,string>
  return {
    name: 'dubhe::dev',
    apply: 'serve',
    enforce: 'pre',

    async resolveId(id, i) {
      if (isExternal(id, conf.externals) && i !== 'dubhe') {
        if(!externals.has(id)){
          const { id: depPath } = await this.resolve(id, 'dubhe') as ResolvedId
          externals.add(id)
          resolvedDepMap[`https://dubhe/${id}`]='/'+normalize(relative(process.cwd(),depPath))
        }

     
        return `https://dubhe/${id}`
      }
      if (externals.has(i!)) {
        const { id: resolveImporter } = await this.resolve(i!, 'dubhe') as ResolvedId
        const { id: resolveID } = await this.resolve(id, resolveImporter) as ResolvedId
        return resolveID
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

