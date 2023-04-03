/* eslint-disable n/no-deprecated-api */
/* eslint-disable no-console */
/* eslint-disable no-async-promise-executor */
import { resolve } from 'path'
import { resolve as urlResolve } from 'url'
import { DEFAULT_POLYFILL, FEDERATION_RE, HMRModuleHandler, HMRTypesHandler, getLocalPath, getRemoteContent, getTypes, getVirtualContent, log, patchVersion, resolveModuleAlias, updateLocalRecord, getProjectAndModule, isLocalPath } from 'dubhe'
import { DefinePlugin } from 'webpack'
import type { Compiler, ResolvePluginInstance } from 'webpack'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import type { RemoteListType, SubConfig } from 'dubhe'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { state } from '../state'

function getVirtualFilePath(id: string) {
  return `_VIRTUAL_DUBHE_/${id}`
}
export class WebpackPlugin {
  vfs: VirtualModulesPlugin
  dp: DefinePlugin
  constructor(public config: SubConfig) {

  }

  middleware(req: any, res: any, next: any) {
    const url = req?.url || ''
    try {
      const ret = HMRModuleHandler(url) as string[]

      if (ret) {
        HMRTypesHandler(url, this.config.remote)
        ret.forEach(async (id) => {
          const [project, moduleName] = resolveModuleAlias(id, state.aliasMap)
          const { data } = await getVirtualContent(
            `${this.config.remote[project].url}/core/${moduleName}`,
            project,
            moduleName,
            false,
            this.config.cache,
          )

          this.vfs.writeModule(
            getVirtualFilePath(`dubhe-${project}/${moduleName}`),
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
    updateLocalRecord(this.config.remote)
    const { mode, devServer } = compiler.options
    const { injectHtml, externals, polyfill } = this.config
    // virtualmodule does't work when using multiprocess bundle
    const useVirtualModule =!this.config.cache
    compiler.options.externals = []
    // get remote config
    const initlize = new Promise<void>(async (resolve, _reject) => {
      for (const i in this.config.remote) {
        try {
          // eslint-disable-next-line prefer-const
          let { data, isCache } = await getVirtualContent(
            `${this.config.remote[i].url}/core/remoteList.json`,
            i,
            'remoteList.json',
            this.config.cache,
          )
          const dubheConfig: RemoteListType = JSON.parse(data)
          state.remoteListMap[i] = dubheConfig
          dubheConfig.externals.forEach(item => state.externalSet.add(item))
          // if (dubheConfig.config.importMap)
          //   isImportMap = true
          if (this.config.remote[i].mode === 'hot' && mode !== 'development') {
            state.esmImportMap[`dubhe-${i}`] = urlResolve(this.config.remote[i].url, 'core')
            state.systemjsImportMap[`dubhe-${i}`] = urlResolve(this.config.remote[i].url, 'systemjs')

            for (const external of dubheConfig.externals) {
              const { esm, systemjs } = externals(external) || {}
              if (!state.esmImportMap[external] && (esm || systemjs)) {
                (compiler as any).options.externals.push({ [external]: external })
                if (esm)
                  state.esmImportMap[external] = esm
                if (systemjs)
                  state.systemjsImportMap[external] = systemjs
              }
            }
            for (const item of dubheConfig.alias)
              (compiler as any).options.externals.push({ [`dubhe-${i}/${item.name}`]: `dubhe-${i}/${item.url}.js` })
          }

          if (this.config.types)
            getTypes(`${this.config.remote[i].url}/types/types.json`, i, dubheConfig.entryFileMap)
          if (this.config.cache) {
            if (isCache) {
              try {
                const remoteInfo = await getRemoteContent(
                  `${this.config.remote[i].url}/core/remoteList.json`,
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
          log(`Remote Module [${i}] Map:`)
          console.table(dubheConfig.alias)

          log(`Remote Module [${i}] Asset List:`)
          console.table(dubheConfig.files)
        }
        catch (e) {
          console.log(e)
          log(`can't find remote module [${i}] -- ${this.config.remote[i].url}`, 'red')
        }
      }
      log('All externals')
      console.table([...state.externalSet])
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

    if (mode === 'development') {
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
      compiler.hooks.compilation.tap('dubhe::subscribe', (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap(
          'dubhe::subscribe',

          (data) => {
            const tags = data.assetTags.scripts
            if (polyfill) {
              [...state.externalSet].forEach((dep) => {
                const { esm, systemjs } = externals(dep) || {}
                if (esm)
                  state.esmImportMap[dep] = esm
                if (systemjs)
                  state.systemjsImportMap[dep] = systemjs
              })

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
            }

            return data
          },
        )
      })
    }
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
              if (FEDERATION_RE.test(id)) {
                const [project, moduleName] = resolveModuleAlias(
                  id,
                  state.aliasMap,
                )
                this.dp.definitions[`__DUBHE_${project}_`] = `"${this.config.remote[project].url}/core"`
                const { data } = await getVirtualContent(
                  `${this.config.remote[project].url}/core/${moduleName}`,
                  project,
                  moduleName,
                  this.config.cache,
                  this.config.cache,
                )
                const modulePath = getLocalPath(project, moduleName)
                request.request = modulePath
                if (useVirtualModule) {
                  this.vfs.writeModule(modulePath, data)

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



                const [_, project, moduleName] = getProjectAndModule(id)
          
       
                const { data } = await getVirtualContent(
                  `${this.config.remote[project].url}/core/${moduleName}`,
                  project,
                  moduleName,
                  this.config.cache,
                  this.config.cache,
                )

                useVirtualModule && this.vfs.writeModule(getVirtualFilePath(id), data)
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
