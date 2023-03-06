/* eslint-disable no-console */
import { resolve } from 'path'
import { FEDERATION_RE, HMRModuleHandler, HMRTypesHandler, getRemoteContent, getTypes, getVirtualContent, log, patchVersion, resolveModuleAlias, updateLocalRecord } from 'dubhe-share'
import { DefinePlugin } from 'webpack'
import type { Compiler, ResolvePluginInstance } from 'webpack'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import type { SubConfig, aliasType, remoteListType } from 'dubhe-share'
import HtmlWebpackPlugin from 'html-webpack-plugin'
function getVirtualFilePath(id: string) {
  return `_VIRTUAL_DUBHE_/${id}`
}
export class WebpackPlugin {
  aliasMap: { [key: string]: aliasType[] } = {
  }

  isReady = false
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
            `${this.config.remote[project]}/core/${moduleName}`,
            project,
            moduleName,
            false,
            this.config.cache,
          )
          this.vfs.writeModule(
            getVirtualFilePath(id),
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

  async apply(compiler: Compiler) {
    updateLocalRecord(this.config)

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
    const { mode, devServer } = compiler.options

    if (mode === 'development') {
      if (devServer) {
        const originSetupHook = devServer.setupMiddlewares

        devServer.setupMiddlewares = (middlewares: any, devServer: any) => {
          originSetupHook?.(middlewares, devServer)

          middlewares.push(this.middleware.bind(this))
        }
      }
    }
    else {
      compiler.hooks.compilation.tap('dubhe::subscribe', (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap(
          'dubhe::subscribe',

          // @ts-expect-error with no return
          (data) => {
            const tags = data.assetTags.scripts
            const { mode, injectHtml, importMap, externals } = this.config
            if (injectHtml) {
              if (mode === 'hot') {
                if (injectHtml.systemjs) {
                  tags.push({
                  // importmap polyfill
                    tagName: 'script',
                    voidTag: false,
                    meta: { plugin: 'dubhe::subscribe' },
                    attributes: {
                      src: injectHtml.systemjs,
                    },
                  })
                }

                if (injectHtml.systemBabel) {
                  tags.push({
                  // importmap polyfill
                    tagName: 'script',
                    voidTag: false,
                    meta: { plugin: 'dubhe::subscribe' },
                    attributes: {
                      src: injectHtml.systemBabel,
                    },
                  })
                }
              }
            }
            // work in both modes
            if (importMap) {
              tags.push({
                tagName: 'script',
                voidTag: false,
                meta: { plugin: 'dubhe::subscribe' },
                attributes: { type: 'systemjs-importmap' },
                innerHTML: `{"imports":${JSON.stringify(externals)}}`,
              })
            }
          },
        )
      })
    }

    const resolverPlugin = {
      apply: (resolver) => {
        const target = resolver.ensureHook('resolve')

        resolver
          .getHook('resolve')
          .tapAsync(
            'dubhe::subscribe',
            async (request, resolveContext, callback) => {
              let id = request.request
              if (!id)
                return callback()

              const importer = (request as any).context.issuer
              if (FEDERATION_RE.test(id)) {
                if (!this.isReady) {
                  this.isReady = true
                  for (const i in this.config.remote) {
                    try {
                      // 向远程请求清单
                      this.remoteCache[i] = {}

                      // eslint-disable-next-line prefer-const
                      let { data, isCache } = await getVirtualContent(
                        `${this.config.remote[i]}/core/remoteList.json`,
                        i,
                        'remoteList.json',
                        this.config.cache,
                      )

                      const dubheConfig: remoteListType = JSON.parse(data)
                      if (this.config.types)
                        getTypes(`${this.config.remote[i]}/types/types.json`, i, dubheConfig.entryFileMap)
                      if (this.config.cache) {
                        if (isCache) {
                          // const localInfo: remoteListType = remoteInfo
                          const remoteInfo = await getRemoteContent(
                            `${this.config.remote[i]}/core/remoteList.json`,
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
                      this.externalsMap = Object.assign(this.externalsMap, dubheConfig.externals)

                      this.aliasMap[i] = dubheConfig.alias
                      log(`Remote Module [${i}] Map:`)
                      console.table(dubheConfig.alias)

                      log(`Remote Module [${i}] Asset List:`)
                      console.table(dubheConfig.files)
                    }
                    catch (e) {
                      log(`can't find remote module (${i}) -- ${this.config.remote[i]}`, 'red')
                    }
                  }
                }
                const [project, moduleName] = resolveModuleAlias(
                  id,
                  this.aliasMap,
                )
                this.dp.definitions[`__DUBHE_${project}_`] = `"${this.config.remote[project]}/core"`
                const { data } = await getVirtualContent(
                  `${this.config.remote[project]}/core/${moduleName}`,
                  project,
                  moduleName,
                  this.config.cache,
                  this.config.cache,
                )
                this.vfs.writeModule(getVirtualFilePath(id), data)
                request.request = resolve(
                  compiler.context,
                  '_VIRTUAL_DUBHE_',
                  id,
                )
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
                && id.endsWith('.js')
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
                  `${this.config.remote[project]}/core/${moduleName}`,
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
