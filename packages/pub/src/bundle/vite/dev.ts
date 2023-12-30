import fs from 'fs'
import { relative, resolve } from 'path'
import type { PluginOption } from 'vite'
import { VIRTUAL_HMR_PREFIX, log, normalizePath, sendHMRInfo } from 'dubhe'
import type { PubConfig } from 'dubhe'
import type { ResolvedId } from 'rollup'
import debug from 'debug'
import sirv from 'sirv'
import { isExternal } from './vite'
const Debug = debug('dubhe:pub')
const root = process.cwd()
export function DevPlugin(conf: PubConfig): PluginOption {
  const externals = new Set<string>()
  const outDir = conf.outDir || '.dubhe'
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
    async handleHotUpdate(ctx) {
      if (!conf.types)
        return
      const { file } = ctx
      if (file.endsWith('.d.ts') || (!(file.endsWith('.ts')) && !file.endsWith('.vue')))
        return

      log('send HMR info')
      for (const home of (conf.HMR || [])) {
        sendHMRInfo({
          url: `${home.port}/${VIRTUAL_HMR_PREFIX}`,
          types: conf.types || false,
          project: conf.project as string,
          module: [],
          dir: outDir,
          file: normalizePath(
            relative(
              root, file,
            ),
          ),

        })
      }
    },

    configureServer(server) {
      server.middlewares.use(
        `/${outDir}`,
        sirv(resolve(root, outDir), {
          single: true,
          dev: true,
        }) as any,
      )
      server.middlewares.use((req, res, next) => {
        if (req?.url === '/dubhe')
          res.end(JSON.stringify({ entry: conf.entry, externals: [...externals], isDubhe: true }))

        else next()
      })
    },
  }
}

