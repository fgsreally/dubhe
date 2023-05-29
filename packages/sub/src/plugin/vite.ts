/* eslint-disable no-console */
import { dirname, resolve } from 'path'
import fs from 'fs'
// eslint-disable-next-line  n/no-deprecated-api
import { fileURLToPath, resolve as urlResolve } from 'url'
import {
  DEFAULT_POLYFILL,
  HMRTypesHandler,
  VIRTUAL_EMPTY,
  VIRTUAL_PREFIX,
  VIRTUAL_RE,
  getExposeFromBundle,
  getFormatDate,
  getHmrModules,
  getRemoteContent,
  getTypes,
  getVirtualContent, log,
  patchVersion,
  resolveModuleAlias,
  resolvePathToModule,
  updateLocalRecord,
} from 'dubhe'
import type { HtmlTagDescriptor, ModuleNode, PluginOption, Update, ViteDevServer } from 'vite'
import colors from 'colors'
import sirv from 'sirv'

import type {
  PubListType,
  SubConfig,

  SubListType,
} from 'dubhe'
import debug from 'debug'
import { state } from '../state'
import { Graph } from '../helper/node/graph'

let server: ViteDevServer
let command = 'build'
const Debug = debug('dubhe:sub')
const _dirname
  = typeof __dirname !== 'undefined'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url))

const HMRMap: Map<string, number> = new Map()

function reloadModule(id: string, time: number) {
  const { moduleGraph } = server
  const module = moduleGraph.getModuleById(VIRTUAL_PREFIX + id)
  if (module) {
    const ret = [] as any
    moduleGraph.invalidateModule(module)
    Debug(`refrash module --${module}`)

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

  function getExternal(id: string) {
    if (state.externalSet.has(id))
      return true
    const { systemjs, esm } = externals(id) || {}
    if (systemjs || esm) {
      if (esm)
        state.esmImportMap[id] = esm
      if (systemjs)
        state.systemjsImportMap[id] = systemjs

      return true
    }
    return false
  }

  const graph = new Graph(Object.keys(config.remote), [])
  config.cache && updateLocalRecord(config.remote)
  const projectSet = new Set<string>()
  const devHelper = DevPlugin(config, projectSet)
  // 返回的是插件对象
  return [devHelper, {
    name: 'dubhe::subscribe',
    enforce: 'pre',
    async resolveId(id, i) {
      // for dep like vue
      if (command === 'build') {
        if (getExternal(id)) {
          Debug(`find external --${id}`)
          return { id, external: true }
        }
      }

      const [project, moduleName] = resolveModuleAlias(id, state.aliasMap)
      const module = `dubhe-${project}/${moduleName}`
      // for dubhe remote module which is in hot mode
      if (command === 'build' && config.remote[project]?.mode === 'hot') {
        Debug(`find remote entry in hot mode --${id}`)

        return {
          id,
          external: true,
        }
      }

      if (i?.startsWith(VIRTUAL_PREFIX) && id.startsWith('.')) {
        Debug(`Looking for remote file --${id}`)

        id = urlResolve(i, id)

        graph.addModule(resolvePathToModule(id), resolvePathToModule(i))
        const [project, moduleName] = resolveModuleAlias(id.slice(VIRTUAL_PREFIX.length), state.aliasMap)

        const module = `dubhe-${project}/${moduleName}`

        const query = HMRMap.has(module) ? `?t=${HMRMap.get(module)}` : ''

        Debug(`Find  remote file --${id + query}`)

        return { id: id + query }
      }

      if (VIRTUAL_RE.test(id) && !id.startsWith(VIRTUAL_PREFIX)) {
        Debug(`Looking for remote entry --${module}`)

        const query = HMRMap.has(module) ? `?t=${HMRMap.get(module)}` : ''
        graph.addModule(module, resolvePathToModule(i))

        Debug(`Find remote entry --${VIRTUAL_PREFIX}${module}${query}`)

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
          Debug(`load remote module --${module}`)

          const { data } = await getVirtualContent(
            url,
            project,
            moduleName,
            config.cache && !HMRMap.has(module),
            config.cache,
          )

          Debug(`load remote sourcemap --${module}`)

          const { data: map } = await getVirtualContent(
            `${url}.map`,
            project,
            `${moduleName}.map`,
            config.cache && !HMRMap.has(module),
            config.cache,
          ).catch(() => ({ } as any))

          return { code: data, map: map && JSON.parse(map) }
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

    async config(_conf, opts) {
      command = opts.command
      // let ext: externals = {}

      for (const i in config.remote) {
        try {
          if (projectSet.has(i)) {
            log(`${i} has been mounted`, 'yellow')
            continue
          } // 向远程请求清单

          Debug(`get remote info --${i}`)

          const { url, mode } = config.remote[i]
          // eslint-disable-next-line prefer-const
          let { data, isCache } = await getVirtualContent(
            `${url}/core/dubheList.json`,
            i,
            'dubheList.json',
            config.cache,
          )
          const { data: SubData } = await getVirtualContent(
            `${url}/core/dubheList.sub.json`,
            i,
            'dubheList.sub.json',
            config.cache,
          ).catch(() => ({ data: null }))
          if (SubData) {
            const { chains, dependences, externals } = JSON.parse(SubData)
            externals.forEach(getExternal);

            (chains as typeof state['chains']).forEach((item) => {
              const {
                project, url, alias,
              } = item
              if (project in config.remote)
                return
              config.remote[project] = {
                url, mode: 'hot',
              }
              state.chains.push(item)
              state.publicPath[project] = url
              state.aliasMap[project] = alias
              for (const { name, url: aliasUrl } of alias) {
                state.esmImportMap[`dubhe-${project}/${name}`] = urlResolve(url, `./core/${aliasUrl}`)
                state.systemjsImportMap[`dubhe-${project}/${name}`] = urlResolve(url, `./systemjs/${aliasUrl}`)
              }
            });
            (dependences as { project: string;from: string }[]).forEach((item) => {
              state.dependences.push(item)
            })
          }

          const dubheConfig: PubListType = JSON.parse(data)
          if (mode === 'hot') {
            state.publicPath[i] = url

            dubheConfig.externals.forEach(getExternal)
            for (const { name, url: aliasUrl } of dubheConfig.alias) {
              state.esmImportMap[`dubhe-${i}/${name}`] = urlResolve(url, `./core/${aliasUrl}`)
              state.systemjsImportMap[`dubhe-${i}/${name}`] = urlResolve(url, `./systemjs/${aliasUrl}`)
            }
          }

          state.pubListMap[i] = dubheConfig

          if (config.types) {
            Debug(`get remote dts --${i}`)

            getTypes(`${url}/types/types.json`, i, dubheConfig.entryFileMap)
          }
          if (config.cache) {
            Debug('compare version between local and remote')

            if (isCache) {
              try {
                const remoteInfo = await getRemoteContent(
                  `${url}/core/dubheList.json`,
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
          Debug(`fail to get remote info --${i}`)
          log(`can't find remote module [${i}] -- ${config.remote[i].url}`, 'red')
        }
      }
      const define = {} as Record<string, string>
      for (const i in config.remote) {
        const url = config.remote[i].url
        define[`globalThis.__DP_${i}_`] = `"${url}/core"`
      }
      log('All externals')
      console.table([...state.externalSet])

      return { define }
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
          const modules = getHmrModules(url)

          if (modules) {
            HMRTypesHandler(url, config.remote)
            const time = Date.now()
            const allUpdateModule = (modules as string[])
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
    generateBundle(_, bundle) {
      const importsGraph = getExposeFromBundle(bundle)

      const metaData = {
        type: 'subscribe',
        version: config.version,
        timestamp: getFormatDate(),
        externals: [...state.externalSet],
        project: config.project,
        meta: config.meta,
        importsGraph,
        dependences: Object.entries(config.remote).filter(item => item[1].mode !== 'hot').map(([k]) => {
          return { from: config.project, project: k }
        }),
        chains: Object.entries(config.remote).filter(item => item[1].mode === 'hot').map(([k, v]) => {
          return { project: k, alias: state.aliasMap[k], from: config.project, url: v.url, importsGraph: state.pubListMap[k].importsGraph }
        }).concat(state.chains),
      } as unknown as SubListType
      Debug('output dubheList.json')

      this.emitFile({
        type: 'asset',
        name: 'dubheList',
        fileName: 'dubheList.sub.json',
        source: JSON.stringify(metaData),
      })
    },
    transformIndexHtml(html: string) {
      if (command !== 'build')
        return
      const tags = [] as HtmlTagDescriptor[]

      if (config.injectHtml !== false) {
        Debug('inject publicpath for hot mode project')

        tags.push({
          tag: 'script',
          children: Object.entries(state.publicPath).map(([k, v]) => {
            return `globalThis.__DP_${k}_="${v}/core"`
          }).join(';'),
          injectTo: 'head-prepend',
        })

        Debug('inject importmap and polyfill to html')

        tags.push({
          tag: 'script',
          attrs: {
            type: 'importmap',
          },
          children: `{"imports":${JSON.stringify(state.esmImportMap)}}`,
          injectTo: 'head-prepend',
        })

        if (config.systemjs) {
          tags.push({
            tag: 'script',
            attrs: {
              type: 'systemjs-importmap',
              nomodule: true,
            },
            children: `{"imports":${JSON.stringify(state.systemjsImportMap)}}`,
            injectTo: 'head-prepend',
          })
        }
      }

      if (config.polyfill) {
        if (config.polyfill.systemjs) {
          tags.push({
            // systemjs polyfill
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
  let useDevMode = false
  return {
    name: 'dubhe::dev',
    apply: 'serve',
    enforce: 'pre',

    async config() {
      for (const project in config.remote) {
        // 向远程请求清单
        const { url } = config.remote[project]

        Debug(`get dev info --${project}`)

        try {
          const { externals, entry, isDubhe } = await getRemoteContent(
            urlResolve(url, '/dubhe'),
          ) as { externals: string[]; entry: Record<string, string>; isDubhe: boolean }
          if (!isDubhe)
            throw new Error('it\'s not a valid pub server')
          for (const key in entry)
            entryMap[`dubhe-${project}/${key}`] = urlResolve(url, entry[key])

          externals.forEach((item) => {
            state.externalSet.add(item)
            resolvedDepMap[urlResolve(url, `./@id/${item}`)] = `./@id/${item}`
          })
          tags.push({
            tag: 'script',
            attrs: {
              type: 'module',
              src: urlResolve(url, './@vite/client'),
            },
            injectTo: 'head',
          })
          projectSet.add(project)
          useDevMode = true
          log(`${project} use Dev Mode`)
        }
        catch (e) {
          Debug(`fail to get dev info --${project}`)
        }
      }
    },
    async resolveId(id, i) {
      if (!useDevMode)
        return

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

    /**
     * useless?
     */
    async load(id) {
      if (state.externalSet.has(id)) {
        const { id: resolveID } = await this.resolve(id, 'dubhe') as any
        Debug(`load external module --${resolveID}`)
        return fs.promises.readFile(resolveID.split('?')[0], 'utf-8')
      }
    },

    transformIndexHtml(html) {
      if (isFirstTime) {
        Debug('inject importmap to html')

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

