/* eslint-disable no-console */
import { dirname, extname, resolve } from 'path'
// eslint-disable-next-line  n/no-deprecated-api
import { fileURLToPath, resolve as urlResolve } from 'url'

import {
  DEFAULT_POLYFILL,
  FEDERATION_RE,
  HMRModuleHandler,
  HMRTypesHandler,
  VIRTUAL_EMPTY,
  VIRTUAL_PREFIX,
  getHMRFilePath,
  getRemoteContent,
  getTypes,
  getVirtualContent,
  log,
  patchVersion,
  replaceBundleImportDeclarations,
  replaceImportDeclarations,
  resolveExtension,
  resolveModuleAlias, resolvePathToModule,
  toReg,
  updateLocalRecord,
} from 'dubhe-lib'
import type { HtmlTagDescriptor, ModuleNode, PluginOption, Update, ViteDevServer } from 'vite'
import colors from 'colors'
import sirv from 'sirv'
import { init } from 'es-module-lexer'
import type {
  OutputChunk,
} from 'rollup'

import type {
  PubConfig, SubConfig, SubViteDevConfig, aliasType,
  remoteListType,
} from 'dubhe-share'

import { Graph } from '../helper/node/graph'

let server: ViteDevServer
let command = 'build'

const _dirname
  = typeof __dirname !== 'undefined'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url))

const HMRMap: Map<string, number> = new Map()
const remoteCache: any = {}
const aliasMap: { [key: string]: aliasType[] } = {}
const systemjsImportMap = {} as Record<string, string>
const esmImportMap = {} as Record<string, string>
const externalSet = new Set<string>()
function reloadModule(id: string, time: number) {
  const { moduleGraph } = server
  const module = moduleGraph.getModuleById(VIRTUAL_PREFIX + id)

  if (module) {
    if (id.endsWith('.css')) {
      log(`reload module ${id} --[css]`, 'yellow')
      moduleGraph.invalidateModule(module)
      HMRMap.set(id, time)
      return [
        {
          type: 'js-update',
          path: VIRTUAL_PREFIX + id,
          acceptedPath: VIRTUAL_PREFIX + id,
          timestamp: time,
        },
      ]
    }
    else {
      const ret: any = []
      for (const i of (module as ModuleNode).importers) {
        moduleGraph.invalidateModule(i)
        moduleGraph.invalidateModule(module)
        const path = getHMRFilePath(i)
        ret.push({
          type: 'js-update',
          path,
          acceptedPath: path,
          timestamp: time,
        })
        // if (extensionKey.includes(extname(i.file as string))) {
        //   // vue hmr logic
        //   for (const j of (i as ModuleNode).importers) {
        //     moduleGraph.invalidateModule(j)
        //     const parentPath = getHMRFilePath(j)
        //     ret.push({
        //       type: 'js-update',
        //       path: parentPath,
        //       acceptedPath: parentPath,
        //       timestamp: time,
        //     })
        //     HMRMap.set(id.split('.')[0] + extname(i.file as string), time)
        //   }
        // }
      }
      log(`reload module ${id} --[js]`, 'yellow')

      HMRMap.set(id, time)
      return ret
    }
  }
}

export const HomePlugin = (config: SubConfig): PluginOption => {
  if (config.cache)
    log('--Use Local Cache--')

  const { externals } = config

  const graph = new Graph(Object.keys(config.remote), config.extensions || [])
  updateLocalRecord(config)


  // 返回的是插件对象
  return {
    name: 'dubhe::subscribe',
    async resolveId(id, i) {
      // for dep like vue
      if (command === 'build') {
        const { systemjs, esm } = externals(id) || {}
        if (systemjs || esm) {
          if (esm) esmImportMap[id] = esm
          if (systemjs) systemjsImportMap[id] = systemjs
          return { id, external: true }

        }
      }

      const [project, moduleName] = resolveModuleAlias(id, aliasMap)
      const module = `dubhe-${project}/${moduleName}`
      // for dubhe remote module which is in hot mode
      if (command === 'build' && this.config.remote[project]?.mode === 'hot') {
        return {
          id: module,
          external: true,
        }
      }


      if (i?.startsWith(VIRTUAL_PREFIX) && id.startsWith('.')) {
        id = urlResolve(i, id)

        graph.addModule(resolvePathToModule(id), resolvePathToModule(i))
        const [project, moduleName] = resolveModuleAlias(id, aliasMap)

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
        const [project, moduleName] = resolveModuleAlias(id.slice(VIRTUAL_PREFIX.length), aliasMap)




        const module = `dubhe-${project}/${moduleName}`
        const url = `${config.remote[project].url}/core/${moduleName}`
        try {
          // if (remoteCache[project][moduleName] && !HMRMap.has(module))
          //   return remoteCache[project][moduleName]
          // const [project, moduleName] = resolveModuleAlias(id.slice(VIRTUAL_PREFIX.length), aliasMap)
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

      await init

      for (const i in config.remote) {
        try {
          // 向远程请求清单
          remoteCache[i] = {}
          const { url, mode } = config.remote[i]
          // eslint-disable-next-line prefer-const
          let { data, isCache } = await getVirtualContent(
            `${url}/core/remoteList.json`,
            i,
            'remoteList.json',
            config.cache,
          )
          if (mode === 'hot' && command === 'build') {
            esmImportMap[`dubhe-${i}`] = urlResolve(url, 'core')
            systemjsImportMap[`dubhe-${i}`] = urlResolve(url, 'systemjs')

          }

          const dubheConfig: remoteListType = JSON.parse(data)

          dubheConfig.externals.forEach((item) => externalSet.add(item))


          if (config.types)
            getTypes(`${url}/types/types.json`, i, dubheConfig.entryFileMap)
          if (config.cache) {
            if (isCache) {
              // const localInfo: remoteListType = remoteInfo
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
            else {
              log('--Create Local Cache--')
            }
          }


          aliasMap[i] = dubheConfig.alias

          if (command === 'serve') {
            log(`Remote Module [${i}] Map:`)
            console.table(dubheConfig.alias)

            log(`Remote Module [${i}] Asset List:`)
            console.table(dubheConfig.files)


            log(`All externals`)
            console.table([...externalSet])


          }
        }
        catch (e) {
          console.log(e)
          log(`can't find remote module (${i}) -- ${config.remote[i]}`, 'red')
        }
      }

      // if (!config.externals) {
      //   // auto import remote config
      //   // config.externals = ext
      //   log('Final Externals :')
      //   console.table(config.externals)
      // }
      console.table([...externalSet])
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
          console.error(e)
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



      tags.push({
        tag: 'script',
        attrs: {
          type: 'importmap',
        },
        children: `{"imports":${JSON.stringify(esmImportMap)}}`,
        injectTo: 'head',
      })

      if (config.systemjs) {

        tags.push({
          tag: 'script',
          attrs: {
            type: 'systemjs-importmap',
            nomodule: undefined,
          },
          children: `{"imports":${JSON.stringify(systemjsImportMap)}}`,
          injectTo: 'head',
        })
      }

      if (config.injectHtml) {
        if (config.injectHtml.systemjs) {
          tags.push({
            // importmap polyfill
            tag: 'script',
            attrs: {
              nomodule: true,
              src: config.injectHtml.systemjs ?? DEFAULT_POLYFILL.systemjs,
            },
            injectTo: 'head-prepend',
          })
        }

      }

      // work in both modes
      if (config.importMap) {

        if (config.injectHtml.importMap) {
          tags.push({
            // importmap polyfill
            tag: 'script',
            attrs: {
              src: config.injectHtml.importMap ?? DEFAULT_POLYFILL.importMap,
            },
            injectTo: 'head-prepend',
          })
        }
      }
      return {
        html,
        tags,

        // <script src="https://unpkg.com/systemjs@6.13.0/dist/s.js"></script>
        // <script src="https://unpkg.com/systemjs-babel@0.3.1/dist/systemjs-babel.js"></script>
        /**    <script type="systemjs-importmap">
    {
      "imports": {
        "neptune": "./neptune.js"
      }
    }
  </script> */

      }
    },

  }
}

export function DevPlugin(conf: SubViteDevConfig): PluginOption {
  const entryMap: Record<string, string> = {}
  return {
    name: 'dubhe::dev',
    apply: 'serve',
    enforce: 'pre',

    async config(cf) {

    },
    resolveId(id) {
      if (id in entryMap)
        return { id: entryMap[id] }
    },
  }
}
