/* eslint-disable no-console */
/* eslint-disable no-async-promise-executor */
import { resolve } from 'path'
import { resolve as urlResolve } from 'url'
import { DEFAULT_POLYFILL, FEDERATION_RE, HMRModuleHandler, HMRTypesHandler, getLocalPath, getRemoteContent, getTypes, getVirtualContent, log, patchVersion, resolveModuleAlias, updateLocalRecord } from 'dubhe-lib'
import { DefinePlugin } from 'webpack'
import type { Compiler, ResolvePluginInstance } from 'webpack'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import type { SubConfig, aliasType, remoteListType } from 'dubhe-lib'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const importMap: Record<string, string> = {}

const externalSet = new Set<string>()
function getVirtualFilePath(id: string) {
  return `_VIRTUAL_DUBHE_/${id}`
}
export class WebpackPlugin {
  aliasMap: { [key: string]: aliasType[] } = {
  }

  vfs: VirtualModulesPlugin
  dp: DefinePlugin
  remoteCache: Record<string, Record<string, string>> = {}
  externalsMap: Record<string, string> = {}
  constructor(public config: SubConfig) {

  }

  middleware(req: any, res: any, next: any) {
    const url = req?.url || ''
    try {
      const ret = HMRModuleHandler(url) as string[]

      if (ret) {
        HMRTypesHandler(url, this.config.remote)
        ret.forEach(async (id) => {
          const [project, moduleName] = resolveModuleAlias(id, this.aliasMap)
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
    const { injectHtml, externals } = this.config
    // virtualmodule does't work when using multiprocess bundle
    const useVirtualModule = mode === 'development' && !this.config.cache
    // get remote config
    const initlize = new Promise<void>(async (resolve, _reject) => {
      for (const i in this.config.remote) {
        try {
          //

          // eslint-disable-next-line prefer-const
          let { data, isCache } = await getVirtualContent(
            `${this.config.remote[i].url}/core/remoteList.json`,
            i,
            'remoteList.json',
            this.config.cache,
          )
          const dubheConfig: remoteListType = JSON.parse(data)

          dubheConfig.externals.forEach(item => externalSet.add(item))
          // if (dubheConfig.config.importMap)
          //   isImportMap = true
          if (this.config.remote[i].mode === 'hot' && mode !== 'development') {
            importMap[`dubhe-${i}`] = urlResolve(this.config.remote[i].url, 'core')
            if (!compiler.options.externals)
              compiler.options.externals = {}
            for (const external of dubheConfig.externals) {
              if (externals(external))
                (compiler as any).options.externals[external] = external
            }
            for (const item of dubheConfig.alias)
              (compiler as any).options.externals[`dubhe-${i}/${item.name}`] = `dubhe-${i}/${item.url}.js`
          }

          if (this.config.types)
            getTypes(`${this.config.remote[i].url}/types/types.json`, i, dubheConfig.entryFileMap)
          if (this.config.cache) {
            if (isCache) {
              // const localInfo: remoteListType = remoteInfo
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
            else {
              log('--Create Local Cache--')
            }
          }

          // ext = { ...ext, ...remoteInfo.config.externals }
          // this.externalsMap = Object.assign(this.externalsMap, dubheConfig.externals)

          this.aliasMap[i] = dubheConfig.alias
          log(`Remote Module [${i}] Map:`)
          console.table(dubheConfig.alias)

          log(`Remote Module [${i}] Asset List:`)
          console.table(dubheConfig.files)

          log('All externals')
          console.table([...externalSet])
        }
        catch (e) {
          log(`can't find remote module (${i}) -- ${this.config.remote[i].url}`, 'red')
          process.exit(1)
        }
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
            if (injectHtml) {
              const externalMap = {} as Record<string, string>
              [...externalSet].forEach((dep) => {
                const resolvedDep = externals(dep)
                if (resolvedDep)
                  externalMap[dep] = resolvedDep
              })

              const importMapStr = JSON.stringify({ ...externalMap, ...importMap })

              if (injectHtml.systemjs) {
                tags.unshift({
                  // importmap polyfill
                  tagName: 'script',
                  voidTag: false,
                  meta: { plugin: 'dubhe::subscribe' },
                  attributes: {
                    src: injectHtml.systemjs === true ? DEFAULT_POLYFILL.systemjs : injectHtml.systemjs,
                    nomodule: true,
                  },
                })
              }
              if (injectHtml.importMap) {
                tags.unshift({
                  // importmap polyfill
                  tagName: 'script',
                  voidTag: false,
                  meta: { plugin: 'dubhe::subscribe' },
                  attributes: {
                    src: injectHtml.importMap === true ? DEFAULT_POLYFILL.importMap : injectHtml.importMap,
                  },
                })
              }
              if (this.config.systemjs) {
                tags.unshift({
                  tagName: 'script',
                  voidTag: false,
                  meta: { plugin: 'dubhe::subscribe' },
                  attributes: { type: 'systemjs-importmap' },
                  innerHTML: `{"imports":${importMapStr}}`,
                })
              }
              tags.unshift({
                tagName: 'script',
                voidTag: false,
                meta: { plugin: 'dubhe::subscribe' },
                attributes: { type: 'importmap' },
                innerHTML: `{"imports":${importMapStr}}`,
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
                console.log(id)

              const importer = (request as any).context.issuer
              if (FEDERATION_RE.test(id)) {
                const [project, moduleName] = resolveModuleAlias(
                  id,
                  this.aliasMap,
                )
                this.dp.definitions[`__DUBHE_${project}_`] = `"${this.config.remote[project].url}/core"`
                const { data } = await getVirtualContent(
                  `${this.config.remote[project].url}/core/${moduleName}`,
                  project,
                  moduleName,
                  this.config.cache,
                  this.config.cache,
                )
                const module = `dubhe-${project}/${moduleName}`
                if (useVirtualModule) {
                  this.vfs.writeModule(getVirtualFilePath(module), data)
                  request.request = resolve(
                    compiler.context,
                    '_VIRTUAL_DUBHE_',
                    module,
                  )
                }
                else {
                  request.request = getLocalPath(project, moduleName)
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
                && importer.includes('_VIRTUAL_DUBHE_')
                && id.endsWith('.js') && useVirtualModule
              ) {
                id = resolve(importer, '../', id)

                const resolveID = id
                  .split('_VIRTUAL_DUBHE_\\')[1]
                  .replace(/\\/g, '/')

                const [project, moduleName] = resolveModuleAlias(
                  resolveID,
                  this.aliasMap,
                )
                const { data } = await getVirtualContent(
                  `${this.config.remote[project].url}/core/${moduleName}`,
                  project,
                  moduleName,
                  this.config.cache,
                  this.config.cache,
                )
                const module = `dubhe-${project}/${moduleName}`

                this.vfs.writeModule(getVirtualFilePath(module), data)
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
