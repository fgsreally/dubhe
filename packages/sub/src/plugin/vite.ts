/* eslint-disable no-console */
import { dirname, resolve } from 'path'
import fs from 'fs'
// eslint-disable-next-line  n/no-deprecated-api
import { fileURLToPath, resolve as urlResolve } from 'url'
import {
  DEFAULT_POLYFILL,
  FEDERATION_RE,
  HMRModuleHandler,
  HMRTypesHandler,
  VIRTUAL_EMPTY,
  VIRTUAL_PREFIX,
  getRemoteContent,
  getTypes,
  getVirtualContent,
  log,
  patchVersion,
  resolveModuleAlias, resolvePathToModule,
  updateLocalRecord,
} from 'dubhe'
import type { HtmlTagDescriptor, ModuleNode, PluginOption, Update, ViteDevServer } from 'vite'
import colors from 'colors'
import sirv from 'sirv'

import type {
  RemoteListType,
  SubConfig,
} from 'dubhe'
import { state } from '../state'

import { Graph } from '../helper/node/graph'

let server: ViteDevServer
let command = 'build'

const _dirname
  = typeof __dirname !== 'undefined'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url))

const HMRMap: Map<string, number> = new Map()
// const state.aliasMap: { [key: string]: AliasType[] } = {}
// const state.systemjsImportMap = {} as Record<string, string>
// const state.esmImportMap = {} as Record<string, string>

function reloadModule(id: string, time: number) {
  const { moduleGraph } = server
  const module = moduleGraph.getModuleById(VIRTUAL_PREFIX + id)
  if (module) {
    const ret = [] as any
    moduleGraph.invalidateModule(module)

    traverseModule(module)

    function traverseModule(module: ModuleNode) {
      if (module.url.startsWith(VIRTUAL_PREFIX))
        HMRMap.set(module.url.slice(VIRTUAL_PREFIX.length), time)

      for (const i of (module as ModuleNode).importers) {
        moduleGraph.invalidateModule(i)
        if (i.acceptedHmrDeps.has(module)) {
          ret.push({
            type: 'js-update',
            path: i.url,
            acceptedPath: i.url,
            timestamp: time,
          })
          continue
        }
        if (i.isSelfAccepting || i.acceptedHmrExports) {
          ret.push({
            type: 'js-update',
            path: i.url,
            acceptedPath: i.url,
            timestamp: time,
          })
          if (i.isSelfAccepting)
            return
        }
        traverseModule(i)
      }
    }

    log('reload module ', 'yellow')

    HMRMap.set(id, time)
    return ret
  }
}

export const HomePlugin = (config: SubConfig): PluginOption => {
  if (config.cache)
    log('--Use Local Cache--')

  const { externals } = config

  const graph = new Graph(Object.keys(config.remote), [])
  updateLocalRecord(config.remote)
  const projectSet = new Set<string>()
  const devHelper = DevPlugin(config, projectSet)

  // 返回的是插件对象
  return [devHelper, {
    name: 'dubhe::subscribe',
    enforce: 'pre',
    async resolveId(id, i) {
      // for dep like vue
      if (command === 'build') {
        const { systemjs, esm } = externals(id) || {}

        if (systemjs || esm) {
          if (esm)
            state.esmImportMap[id] = esm
          if (systemjs)
            state.systemjsImportMap[id] = systemjs
          return { id, external: true }
        }
      }

      const [project, moduleName] = resolveModuleAlias(id, state.aliasMap)
      const module = `dubhe-${project}/${moduleName}`
      // for dubhe remote module which is in hot mode
      if (command === 'build' && config.remote[project]?.mode === 'hot') {
        return {
          id: module,
          external: true,
        }
      }

      if (i?.startsWith(VIRTUAL_PREFIX) && id.startsWith('.')) {
        id = urlResolve(i, id)

        graph.addModule(resolvePathToModule(id), resolvePathToModule(i))
        const [project, moduleName] = resolveModuleAlias(id.slice(VIRTUAL_PREFIX.length), state.aliasMap)

        const module = `dubhe-${project}/${moduleName}`

        const query = HMRMap.has(module) ? `?t=${HMRMap.get(module)}` : ''

        return { id: id + query }
      }

      if (FEDERATION_RE.test(id) && !id.startsWith(VIRTUAL_PREFIX)) {
        const query = HMRMap.has(module) ? `?t=${HMRMap.get(module)}` : ''
        graph.addModule(module, resolvePathToModule(i))

        return `${VIRTUAL_PREFIX}${module}${query}`
      }
    },
    async load(id: string) {
      if (id === VIRTUAL_EMPTY)
        return ''

      if (id.startsWith(VIRTUAL_PREFIX)) {
        const [project, moduleName] = resolveModuleAlias(id.slice(VIRTUAL_PREFIX.length), state.aliasMap)

        const module = `dubhe-${project}/${moduleName}`
        const url = `${config.remote[project].url}/core/${moduleName}`
        try {
          const { data } = await getVirtualContent(
            url,
            project,
            moduleName,
            config.cache && !HMRMap.has(module),
            config.cache,
          )
          return data
        }
        catch (e) {
          log(
            `Request module was not found, returns an empty module--${url}`,
            'grey',
          )

          return ''
        }
      }
    },

    config(viteConfig) {
      if (!viteConfig.define)
        viteConfig.define = {}
      for (const i in config.remote) {
        const url = config.remote[i].url
        viteConfig.define[`__DUBHE_${i}_`] = `"${url}/core"`
      }
    },
    async configResolved(resolvedConfig) {
      command = resolvedConfig.command
      // let ext: externals = {}

      for (const i in config.remote) {
        try {
          if (projectSet.has(i)) {
            log(`${i} has mount`)
            continue
          } // 向远程请求清单

          const { url, mode } = config.remote[i]
          // eslint-disable-next-line prefer-const
          let { data, isCache } = await getVirtualContent(
            `${url}/core/remoteList.json`,
            i,
            'remoteList.json',
            config.cache,
          )
          if (mode === 'hot' && command === 'build') {
            state.esmImportMap[`dubhe-${i}`] = urlResolve(url, 'core')
            state.systemjsImportMap[`dubhe-${i}`] = urlResolve(url, 'systemjs')
          }

          const dubheConfig: RemoteListType = JSON.parse(data)
          state.remoteListMap[i] = dubheConfig
          dubheConfig.externals.forEach(item => state.externalSet.add(item))

          if (config.types)
            getTypes(`${url}/types/types.json`, i, dubheConfig.entryFileMap)
          if (config.cache) {
            if (isCache) {
              try {
                const remoteInfo = await getRemoteContent(
                  `${url}/core/remoteList.json`,
                )

                if (!patchVersion(remoteInfo.version, dubheConfig.version)) {
                  log(
                    `[versions-diff] project:${i}  (local:${dubheConfig.version}|remote:${remoteInfo.version})`,
                    'yellow',
                  )
                }
              }
              catch (e) {
                log(`--Project [${i}] Use Offline Mode--`)
              }
              // const localInfo: RemoteListType = remoteInfo
            }
            else {
              log(`--Project [${i}] Create Local Cache--`)
            }
          }

          state.aliasMap[i] = dubheConfig.alias

          if (command === 'serve') {
            log(`Remote Module [${i}] Map:`)
            console.table(dubheConfig.alias)

            log(`Remote Module [${i}] Asset List:`)
            console.table(dubheConfig.files)
          }
        }
        catch (e) {
          log(`can't find remote module [${i}] -- ${config.remote[i]}`, 'red')
        }
      }

      log('All externals')
      console.table([...state.externalSet])
    },

    configureServer(_server) {
      server = _server as any
      const {
        ws,
        printUrls,
        config: {
          server: { https, port },
        },
      } = _server

      server.printUrls = () => {
        const colorUrl = (url: string) =>
          colors.green(
            url.replace(/:(\d+)\//, (_, port) => `:${colors.bold(port)}/`),
          )
        const host
          = server.resolvedUrls?.local[0].replace(/\/$/, '')
          || `${https ? 'https' : 'http'}://localhost:${port || '5173'}`

        printUrls()
        console.log(
          `  ${colors.green('➜')}  ${colors.bold('Dubhe')}: ${colorUrl(
            `${host}/__dubhe/`,
          )}`,
        )
      }

      server.middlewares.use(
        '/__dubhe',
        sirv(resolve(_dirname, './client'), {
          single: true,
          dev: true,
        }) as any,
      )
      server.middlewares.use('/__dubhe_api', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.write(JSON.stringify(graph.generate(), null, 2))
        res.end()
      })

      server.middlewares.use((req, res, next) => {
        const url = (req as any).url || ''
        try {
          const ret = HMRModuleHandler(url)

          if (ret) {
            HMRTypesHandler(url, config.remote)
            const time = Date.now()
            const allUpdateModule = (ret as string[])
              .map(item => reloadModule(item, time))
              .flat()
              .filter(i => i) as unknown
            ws.send({ type: 'update', updates: allUpdateModule as Update[] })
            res.end('1')
          }
          else {
            next()
          }
        }
        catch (e) {
          // console.error(e)
        }
      })
    },
    // generateBundle(p, data) {
    //   if (config.importMap)
    //     return
    //   for (const i in data) {
    //     if (/\.js$/.test(i)) {
    //       (data[i] as OutputChunk).code = replaceBundleImportDeclarations(
    //         (data[i] as OutputChunk).code,
    //         externalsMap,
    //       )
    //     }
    //   }
    // },
    transformIndexHtml(html: string) {
      if (command !== 'build')
        return
      const tags = [] as HtmlTagDescriptor[]

      if (config.injectHtml !== false) {
        tags.push({
          tag: 'script',
          attrs: {
            type: 'importmap',
          },
          children: `{"imports":${JSON.stringify(state.esmImportMap)}}`,
          injectTo: 'head',
        })

        if (config.systemjs) {
          tags.push({
            tag: 'script',
            attrs: {
              type: 'systemjs-importmap',
              nomodule: true,
            },
            children: `{"imports":${JSON.stringify(state.systemjsImportMap)}}`,
            injectTo: 'head',
          })
        }
      }

      if (config.polyfill) {
        if (config.polyfill.systemjs) {
          tags.push({
            // importmap polyfill
            tag: 'script',
            attrs: {
              nomodule: true,
              src: config.polyfill.systemjs === true ? DEFAULT_POLYFILL.systemjs : config.polyfill.systemjs,
            },
            injectTo: 'head-prepend',
          })
        }
        if (config.polyfill.importMap) {
          tags.push({
            // importmap polyfill
            tag: 'script',
            attrs: {
              src: config.polyfill.importMap === true ? DEFAULT_POLYFILL.importMap : config.polyfill.importMap,
            },
            injectTo: 'head-prepend',
          })
        }
      }

      // work in both modes

      return {
        html,
        tags,
      }
    },

  }]
}

export function DevPlugin(config: SubConfig, projectSet: Set<string>): PluginOption {
  // const externalSet = new Set<string>()

  const resolvedDepMap = {} as Record<string, string>
  const entryMap = {} as Record<string, string>
  const tags = [] as HtmlTagDescriptor[]
  let isFirstTime = true
  return {
    name: 'dubhe::dev',
    apply: 'serve',
    enforce: 'pre',

    async config() {
      for (const project in config.remote) {
        // 向远程请求清单
        const { url } = config.remote[project]

        try {
          const { externals, entry, isDubhe } = await getRemoteContent(
            urlResolve(url, 'dubhe'),
          ) as { externals: string[]; entry: Record<string, string>; isDubhe: boolean }
          if (!isDubhe)
            throw new Error('it\'s not a valid pub server')
          for (const key in entry)
            entryMap[`dubhe-${project}/${key}`] = urlResolve(url, entry[key])

          externals.forEach((item) => {
            state.externalSet.add(item)
            resolvedDepMap[urlResolve(url, `/@id/${item}`)] = `/@id/${item}`
          })
          tags.push({
            tag: 'script',
            attrs: {
              type: 'module',
              src: urlResolve(url, '/@vite/client'),
            },
            injectTo: 'head',
          })
          projectSet.add(project)
          log(`${project} use Dev Mode`)
        }
        catch (e) {
        }
      }
    },
    async resolveId(id, i) {
      if (id in entryMap)
        return entryMap[id]

      if (state.externalSet.has(id) && i !== 'dubhe')

        return id

      if (state.externalSet.has(i!)) {
        const { id: resolveImporter } = await this.resolve(i!, 'dubhe') as any
        const { id: resolveID } = await this.resolve(id, resolveImporter) as any
        return resolveID
      }
    },

    async load(id) {
      if (state.externalSet.has(id)) {
        const { id: resolveID } = await this.resolve(id, 'dubhe') as any
        return fs.promises.readFile(resolveID.split('?')[0], 'utf-8')
      }
    },

    transformIndexHtml(html) {
      if (isFirstTime) {
        tags.push({
          tag: 'script',
          attrs: {
            type: 'importmap',
          },
          children: `{"imports":${JSON.stringify(resolvedDepMap)}}`,
          injectTo: 'head',
        })
      }
      isFirstTime = false

      return { html, tags }
    },
  }
}
