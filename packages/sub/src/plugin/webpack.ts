/* eslint-disable n/no-deprecated-api */
/* eslint-disable no-console */
/* eslint-disable no-async-promise-executor */
import { resolve } from 'path'
import { resolve as urlResolve } from 'url'
import { DEFAULT_POLYFILL, HMRTypesHandler, VIRTUAL_RE, getFormatDate, getHmrModules, getLocalPath, getProjectAndModule, getRemoteContent, getTypes, getVirtualContent, isLocalPath, log, patchVersion, removeHash, resolveModuleAlias, updateLocalRecord } from 'dubhe'
import { DefinePlugin } from 'webpack'
import type { Compiler, ResolvePluginInstance } from 'webpack'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import type { PubListType, SubConfig, SubListType } from 'dubhe'
import debug from 'debug'
import type HtmlWebpackPlugin from 'html-webpack-plugin'

import { state } from '../state'
const Debug = debug('dubhe:sub')

let htmlPlugin: typeof HtmlWebpackPlugin

export class WebpackPlugin {
  vfs: VirtualModulesPlugin
  dp: DefinePlugin
  constructor(public config: SubConfig) {

  }

  middleware(req: any, res: any, next: any) {
    const url = req?.url || ''
    try {
      const modules = getHmrModules(url) as string[]

      if (modules) {
        HMRTypesHandler(url, this.config.remote)
        modules.forEach(async (id) => {
          const [project, moduleName] = resolveModuleAlias(id, state.aliasMap)
          Debug(`refresh remote file --${project}/${moduleName}`)

          const { data } = await getVirtualContent(
            `${this.config.remote[project].url}/core/${moduleName}`,
            project,
            moduleName,
            false,
            this.config.cache,
          )

          this.vfs.writeModule(
            getLocalPath(project, removeHash(moduleName))
            ,
            data,
          )
        })
        res.end('1')
      }
      else {
        next()
      }
    }
    catch (e) {
      console.error(e)
    }
  }

  // use virtual-module in development
  // use local-cache in production with parallel
  apply(compiler: Compiler) {
    for (const plugin of compiler.options.plugins) {
      if (plugin.constructor.name === 'HtmlWebpackPlugin')
        htmlPlugin = plugin.constructor as any
    }

    const { mode: command, devServer } = compiler.options
    const { injectHtml, externals, polyfill, version, meta, remote, cache, project } = this.config
    cache && updateLocalRecord(remote)

    const originRemote = Object.entries(remote)

    function getExternal(id: string) {
      if (state.externalSet.has(id))
        return true
      const { systemjs, esm } = externals(id) || {}
      if (systemjs || esm) {
        if (esm)
          state.esmImportMap[id] = esm
        if (systemjs)
          state.systemjsImportMap[id] = systemjs;
        (compiler as any).options.externals.push(id)
        state.externalSet.add(id)
        return true
      }
      return false
    }
    // virtualmodule does't work when using multiprocess bundle
    const useVirtualModule = !cache
    compiler.options.externals = []
    // get remote config
    const initlize = new Promise<void>(async (resolve, _reject) => {
      for (const i in this.config.remote) {
        const { mode, url } = remote[i]

        try {
          Debug(`get remote info --${i}`)
          // eslint-disable-next-line prefer-const
          let { data, isCache } = await getVirtualContent(
            `${url}/core/dubheList.json`,
            i,
            'dubheList.json',
            cache,
          )
          const dubheConfig: PubListType = JSON.parse(data)
          state.pubListMap[i] = dubheConfig

          const { data: SubData } = await getVirtualContent(
            `${url}/core/dubheList.sub.json`,
            i,
            'dubheList.sub.json',
            cache,
          ).catch(() => ({ data: null }))
          if (SubData) {
            const { chains, dependences, externals } = JSON.parse(SubData)
            externals.forEach(getExternal);

            (chains as typeof state['chains']).forEach((item) => {
              const {
                project, url, alias,
              } = item
              if (project in remote)
                return
              remote[project] = {
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
          this.dp.definitions[`globalThis.__DP_${i}_`] = `"${url}/core"`
          if (command !== 'development') {
            if (mode === 'hot') {
              state.publicPath[i] = url
              dubheConfig.externals.forEach(getExternal)

              for (const item of dubheConfig.alias) {
                (compiler as any).options.externals.push(`dubhe-${i}/${item.name}`)

                state.esmImportMap[`dubhe-${i}/${item.name}`] = urlResolve(url, `./core/${item.url}`)
                state.systemjsImportMap[`dubhe-${i}/${item.name}`] = urlResolve(url, `./systemjs/${item.url}`)
              }
            }
          }

          if (this.config.types) {
            Debug(`get remote dts --${i}`)

            getTypes(`${url}/types/types.json`, i, dubheConfig.entryFileMap)
          }
          if (cache) {
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
              // const localInfo: PubListType = remoteInfo
            }
            else {
              log(`--Project [${i}] Create Local Cache--`)
            }
          }

          state.aliasMap[i] = dubheConfig.alias
          log(`Remote Module [${i}] Map:`)
          console.table(dubheConfig.alias)

          log(`Remote Module [${i}] Asset List:`)
          console.table(dubheConfig.files)
        }
        catch (e) {
          Debug(`fail to get remote info --${i} `)
          log(`can't find remote module [${i}] -- ${url}`, 'red')
        }
      }
      if (command !== 'development') {
        log('All externals')
        console.table([...state.externalSet])
      }

      resolve()
    })
    // inject plugins
    this.dp = compiler.options.plugins.find(i => i instanceof DefinePlugin) as DefinePlugin
    if (!this.dp) {
      this.dp = new DefinePlugin({})
      compiler.options.plugins.push(this.dp)
    }
    this.vfs = compiler.options.plugins.find(i => i instanceof VirtualModulesPlugin) as VirtualModulesPlugin
    if (!this.vfs) {
      this.vfs = new VirtualModulesPlugin()
      compiler.options.plugins.push(this.vfs)
    }

    if (command === 'development') {
      // work for hmr
      // it won't work in vue-cli because  vuecli deconstructs the configuration
      if (devServer) {
        const originSetupHook = devServer.setupMiddlewares
        devServer.setupMiddlewares = (middlewares: any, devServer: any) => {
          originSetupHook?.(middlewares, devServer)

          middlewares.push(this.middleware.bind(this))
          return middlewares
        }
      }
    }
    else {
      htmlPlugin && compiler.hooks.compilation.tap('dubhe::subscribe', (compilation) => {
        htmlPlugin.getHooks(compilation).alterAssetTags.tap(
          'dubhe::subscribe',

          (data) => {
            Debug('inject importmap and polyfill to html')

            const tags = data.assetTags.scripts

            if (polyfill) {
              if (polyfill.systemjs) {
                tags.unshift({
                  // importmap polyfill
                  tagName: 'script',
                  voidTag: false,
                  meta: { plugin: 'dubhe::subscribe' },
                  attributes: {
                    src: polyfill.systemjs === true ? DEFAULT_POLYFILL.systemjs : polyfill.systemjs,
                    nomodule: true,
                  },
                })
              }
              if (polyfill.importMap) {
                tags.unshift({
                  // importmap polyfill
                  tagName: 'script',
                  voidTag: false,
                  meta: { plugin: 'dubhe::subscribe' },
                  attributes: {
                    src: polyfill.importMap === true ? DEFAULT_POLYFILL.importMap : polyfill.importMap,
                  },
                })
              }
            }
            if (injectHtml !== false) {
              if (this.config.systemjs) {
                tags.unshift({
                  tagName: 'script',
                  voidTag: false,
                  meta: { plugin: 'dubhe::subscribe' },
                  attributes: { type: 'systemjs-importmap' },
                  innerHTML: `{"imports":${JSON.stringify(state.systemjsImportMap)}}`,
                })
              }
              tags.unshift({
                tagName: 'script',
                voidTag: false,
                meta: { plugin: 'dubhe::subscribe' },
                attributes: { type: 'importmap' },
                innerHTML: `{"imports":${JSON.stringify(state.esmImportMap)}}`,
              })
              tags.unshift({
                tagName: 'script',
                voidTag: false,
                meta: { plugin: 'dubhe::subscribe' },
                attributes: { },
                innerHTML: Object.entries(state.publicPath).map(([k, v]) => {
                  return `globalThis.__DP_${k}_="${v}/core"`
                }).join(';'),
              })
            }

            return data
          },
        )
      })
    }
    const importsGraph = {} as Record<string, Set<string>>

    compiler.hooks.normalModuleFactory.tap('dubhe::subscribe', (factory) => {
      factory.hooks.parser
        .for('javascript/auto')
        .tap('dubhe::subscribe', (parser) => {
          parser.hooks.importSpecifier.tap(
            'dubhe::subscribe',
            // @ts-expect-error miss types
            (_state, source, exportName) => {
              if (externals(source)) {
                if (!importsGraph[source])
                  importsGraph[source] = new Set()
                importsGraph[source].add(exportName)
              }
            },
          )
        })
    })
    compiler.hooks.emit.tapAsync('dubhe::subscibe', (compilation, callback) => {
      const ret = {} as Record<string, string>
      for (const i in importsGraph)
        ret[i] = [...importsGraph[i]] as any
      const metaData = {
        type: 'subscribe',
        version,
        timestamp: getFormatDate(),
        externals: [...state.externalSet],
        chains: originRemote.filter(item => item[1].mode === 'hot').map(([k, v]) => {
          return { project: k, alias: state.aliasMap[k], from: project, url: v.url, importsGraph: state.pubListMap[k].importsGraph }
        }).concat(state.chains),
        dependences: originRemote.filter(item => item[1].mode !== 'hot').map(([k]) => {
          return { from: project, project: k }
        }),
        meta,

        importsGraph: ret,
      } as unknown as SubListType
      Debug('generate dubheList.sub.json')

      const content = JSON.stringify(metaData)
      compilation.assets['dubheList.sub.json'] = {
        source: () => content,
        size: () => content.length,
      } as any

      callback()
    })
    compiler.hooks.environment.tap('dubhe::subscibe', async () => {
      await initlize
    })
    const resolverPlugin = {
      apply: (resolver) => {
        const target = resolver.ensureHook('resolve')
        resolver
          .getHook('resolve')
          .tapAsync(
            'dubhe::subscribe',
            async (request, resolveContext, callback) => {
              await initlize
              let id = request.request

              if (!id)
                return callback()

              const importer = (request as any).context.issuer
              if (VIRTUAL_RE.test(id)) {
                const [project, moduleName] = resolveModuleAlias(
                  id,
                  state.aliasMap,
                )
                Debug(`get remote entry --${project}/${moduleName}`)
                const { url } = remote[project]
                const { data } = await getVirtualContent(
                  `${url}/core/${moduleName}`,
                  project,
                  moduleName,
                  cache,
                  cache,
                )
                Debug(`get sourcemap --${project}/${moduleName}`)

                const { data: map } = await getVirtualContent(
                  `${url}.map`,
                  project,
                  `${moduleName}.map`,
                  cache,
                  cache,
                ).catch(() => ({} as any))

                const modulePath = getLocalPath(project, moduleName)
                request.request = modulePath
                if (useVirtualModule) {
                  this.vfs.writeModule(modulePath, data)
                  map && this.vfs.writeModule(`${modulePath}.map`, map)
                }

                return resolver.doResolve(
                  target,
                  request,
                  null,
                  resolveContext,
                  callback,
                )
              }

              if (
                importer
                && isLocalPath(importer)
                && id.startsWith('.')
              ) {
                id = resolve(importer, '../', id)
                const [, project, moduleName] = getProjectAndModule(id) as any
                Debug(`get remote file --${project}/${moduleName} --${id}`)

                const { url } = this.config.remote[project]
                const { data } = await getVirtualContent(
                  `${url}/core/${moduleName}`,
                  project,
                  moduleName,
                  cache,
                  cache,
                )
                Debug(`get sourcemap --${project}/${moduleName}`)

                const { data: map } = await getVirtualContent(
                  `${url}.map`,
                  project,
                  `${moduleName}.map`,
                  cache,
                  cache,
                ).catch(() => ({} as any))

                if (useVirtualModule) {
                  this.vfs.writeModule(id, data)
                  map && this.vfs.writeModule(`${id}.map`, map)
                }
              }

              return callback()
            },
          )
      },
    } as ResolvePluginInstance
    compiler.options.resolve.plugins = compiler.options.resolve.plugins || []
    compiler.options.resolve.plugins.push(resolverPlugin)
  }
}
