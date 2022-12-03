/* eslint-disable no-console */
import { dirname, extname, resolve } from 'path'
// eslint-disable-next-line  n/no-deprecated-api
import { fileURLToPath, resolve as urlResolve } from 'url'
import type { IncomingMessage } from 'http'
import colors from 'colors'
import sirv from 'sirv'
import { init } from 'es-module-lexer'
import type { ModuleNode, Update, ViteDevServer } from 'vite'
import type {
  OutputChunk,
} from 'rollup'
import fse from 'fs-extra'
import type { UnpluginOptions } from 'unplugin'
import { createUnplugin } from 'unplugin'
import type { aliasType, externals, homeConfig, remoteListType } from '../types/index'

import {
  HMRModuleHandler,
  HMRTypesHandler,
  analyseTSEntry,
  downloadTSFiles,
  getHMRFilePath,
  getRemoteContent,
  getVirtualContent,
  log,
  replaceBundleImportDeclarations,
  replaceHotImportDeclarations,
  replaceImportDeclarations,
  resolveExtension,
  resolveModuleAlias,
  resolvePathToModule,
  updateTSconfig,
} from '../utils/index'
import {
  FEDERATION_RE,
  VIRTUAL_EMPTY,
  VIRTUAL_PREFIX,
} from '../common/common'
import { Graph } from '../helper/graph'
let server: ViteDevServer
let command = 'build'
const _dirname
  = typeof __dirname !== 'undefined'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url))

const HMRMap: Map<string, number> = new Map()
const remoteCache: any = {}
const aliasMap: { [key: string]: aliasType[] } = {}
let extensionKey: string[] = []

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
        if (extensionKey.includes(extname(i.file as string))) {
          // vue hmr logic
          for (const j of (i as ModuleNode).importers) {
            moduleGraph.invalidateModule(j)
            const parentPath = getHMRFilePath(j)
            ret.push({
              type: 'js-update',
              path: parentPath,
              acceptedPath: parentPath,
              timestamp: time,
            })
            HMRMap.set(id.split('.')[0] + extname(i.file as string), time)
          }
        }
      }
      log(`reload module ${id} --[js]`, 'yellow')

      HMRMap.set(id, time)
      return ret
    }
  }
}

async function getTypes(url: string, project: string, fileMap: { [key: string]: string }) {
  try {
    if (fse.existsSync(resolve(process.cwd(), '.dubhe', 'types', project)))
      return
    downloadTSFiles(url, project)
    updateTSconfig(project, fileMap)
  }
  catch (e) {
    console.log(e)
    log(
      `can't find remote module (${project}) type declaration (it should be at "/types/types.json")`,
      'red',
    )
  }
}

export const HomePlugin = createUnplugin((config: homeConfig): UnpluginOptions => {
  if (config.cache)
    log('--Use Local Cache--')
  if (config.prefetch)
    log('--Use Prefetch Mode--')
  if (config.extensions)
    extensionKey = config.extensions.map(item => item.key)
  const graph = new Graph(Object.keys(config.remote), config.extensions || [])

  // 返回的是插件对象
  return {
    name: 'dubhe::consumer',
    async resolveId(id, i) {
      if (i?.startsWith(VIRTUAL_PREFIX)) {
        id = urlResolve(i, id)
        graph.addModule(resolvePathToModule(id), resolvePathToModule(i))
        const [project, moduleName] = resolveModuleAlias(id, aliasMap)

        const module = `!${project}/${moduleName}`

        const query = HMRMap.has(module) ? `?t=${HMRMap.get(module)}` : ''
        return id + query
      }

      if (FEDERATION_RE.test(id) && !id.startsWith(VIRTUAL_PREFIX)) {
        const [project, moduleName] = resolveModuleAlias(id, aliasMap)
        const module = `!${project}/${moduleName}`
        const query = HMRMap.has(module) ? `?t=${HMRMap.get(module)}` : ''
        graph.addModule(module, resolvePathToModule(i))
        return `${VIRTUAL_PREFIX}${module}${query}`
      }
    },
    async load(id: string) {
      if (id === VIRTUAL_EMPTY)
        return ''

      if (id.startsWith(VIRTUAL_PREFIX)) {
        const [project, moduleName, baseName] = resolveModuleAlias(id, aliasMap)

        const ret = resolveExtension(
          config.extensions || [],
          moduleName,
          baseName,
        )
        if (typeof ret === 'string')
          return ret

        const module = `!${project}/${moduleName}`
        try {
          if (remoteCache[project][moduleName] && !HMRMap.has(module))
            return remoteCache[project][moduleName]

          const { data } = await getVirtualContent(
            `${config.remote[project]}/core/${moduleName}`,
            project,
            moduleName,
            config.cache && !HMRMap.has(module),
          )
          return data
        }
        catch (e) {
          log(
            `Request module was not found, returns an empty module--${config.remote[project]}/${moduleName}`,
            'grey',
          )

          return ''
        }
      }
    },

    transform(code: any, id: string) {
      if (
        id.startsWith(VIRTUAL_PREFIX)
        && !id.endsWith('.css')
        && !config.importMap
        && command !== 'build'
      ) {
        code = replaceImportDeclarations(code, config.externals as externals)
        return code
      }
      if (
        /src(.*)\.(vue|js|ts|jsx|tsx)$/.test(id)
        && !/node_modules\//.test(id)
      ) {
        if (config.mode === 'hot' && command === 'build')
          code = replaceHotImportDeclarations(code, config, aliasMap)

        return code
      }
    },
    vite: {
      async configResolved(resolvedConfig) {
        command = resolvedConfig.command
        let ext: externals = {}

        await init
        for (const i in config.remote) {
          try {
            // 向远程请求清单
            remoteCache[i] = {}

            // eslint-disable-next-line prefer-const
            let { data, isCache } = await getVirtualContent(
              `${config.remote[i]}/core/remoteList.json`,
              i,
              'remoteList.json',
              config.cache,
            )
            let remoteInfo: remoteListType = JSON.parse(data)
            if (config.types)
              getTypes(`${config.remote[i]}/types/types.json`, i, remoteInfo.entryFileMap)
            if (config.cache) {
              if (isCache) {
                const localInfo: remoteListType = remoteInfo
                remoteInfo = await getRemoteContent(
                  `${config.remote[i]}/core/remoteList.json`,
                )

                if (localInfo.timestamp !== remoteInfo.timestamp) {
                  log(
                    `[project ${i}]: local and remote may be different,you may need to remove the cache dir to update the version`,
                    'red',
                  )
                }
              }
              else {
                log('--Create Local Cache--')
              }
            }

            ext = { ...ext, ...remoteInfo.config.externals }

            aliasMap[i] = remoteInfo.alias

            if (command !== 'build') {
              log(`Remote Module [${i}] Map:`)
              console.table(remoteInfo.alias)

              log(`Remote Module [${i}] Asset List:`)
              console.table(remoteInfo.files)

              if (config.info) {
                log(`Remote Module [${i}] config`)
                console.log(remoteInfo)
              }

              if (config.prefetch) {
                for (const j of aliasMap[i]) {
                  // cache
                  const url = `${config.remote[i]}/${j.url}.js`
                  remoteCache[i][`${j.url}.js`] = { data }
                    = await getVirtualContent(url, i, `${j.url}.js`, config.cache)
                }
              }
            }
          }
          catch (e) {
            console.log(e)
            log(`can't find remote module (${i}) -- ${config.remote[i]}`, 'red')
          }
        }

        if (!config.externals) {
          // auto import remote config
          config.externals = ext
          log('Final Externals :')
          console.table(config.externals)
        }
      },

      async options(opts) {
        // 补充external,也可以在rollupOption中弄
        if (!opts.external)
          opts.external = []
        for (const i in config.externals) {
          if (!(opts.external as string[]).includes(i))
            (opts.external as string[]).push(i)
        }
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
            || `${https ? 'https' : 'http'}://localhost:${port || '5143'}`

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
          }),
        )
        server.middlewares.use('/__dubhe_api', (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.write(JSON.stringify(graph.generate(), null, 2))
          res.end()
        })

        server.middlewares.use((req: IncomingMessage, res, next) => {
          const url = req.url || ''
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
      generateBundle(p, data) {
        if (config.importMap)
          return
        for (const i in data) {
          if (/\.js$/.test(i)) {
            (data[i] as OutputChunk).code = replaceBundleImportDeclarations(
              (data[i] as OutputChunk).code,
              config.externals as externals,
            )
          }
        }
      },
      transformIndexHtml(html: string) {
        if (config.importMap && command === 'build') {
          return {
            html,
            tags: [
              {
                // polyfill
                tag: 'script',
                attrs: {
                  async: true,
                  src: 'https://ga.jspm.io/npm:es-module-shims@1.6.2/dist/es-module-shims.js',
                },
                injectTo: 'head-prepend',
              },
              {
                tag: 'script',
                attrs: {
                  type: 'importmap', // systemjs-importmap
                },
                children: `{"imports":${JSON.stringify(config.externals)}}`,
                injectTo: 'head-prepend',
              },
            ],
          }
        }
      },
    },

  }
},
)
