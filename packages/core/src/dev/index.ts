import axios from 'axios'
import { createFilter } from 'vite'
import { init, parse } from 'es-module-lexer'
import MagicString from 'magic-string'
import { createUnplugin } from 'unplugin'
import type { devConfig } from '../types'
import { normalizeFileName } from '../utils'
export const DevPlugin = createUnplugin((
  config: devConfig,
) => {
  const { include = /\.[ts|js|vue|jsx|tsx]/, exclude } = config.opts || {}
  const filter = createFilter(include, exclude)

  return {
    name: 'tianshu-dev',
    enforce: 'post',
    async  buildStart() {
      await init
    },
    transform(code: string, id: string) {
      if (!id.includes('node_modules') && filter(id)) {
        const newSource = new MagicString(code)

        const [imports] = parse(code, 'optional-sourcename')
        for (const i of imports as any) {
          for (const j in config.externals) {
            if (i.n === j) {
              newSource.overwrite(i.s, i.e, config.externals[j])
              break
            }
          }
        }

        return newSource.toString()
      }
    },
    webpack(compiler) {

    },
    vite: {
      apply: 'serve',
      async config(cf: any) {
        if (config.remote) {
          let alias: any = cf.resolve?.alias || []
          if (!Array.isArray(alias)) {
            alias = Object.entries(alias).map((item) => {
              return { find: item[0], replacement: item[1] }
            })
          }
          for (const i in config.remote) {
            const { data: source } = await axios.get(config.remote[i])

            // alias.push({find:/\!/,replacement:})
            source.replace(
              /\s([^\s]*)\s=\simport\("(.*)"\)/g,
              (_: string, name: string, url: string) => {
                const RE = new RegExp(`\!${i}/${name}\.?(.*)`)
                alias.push({ find: RE, replacement: new URL((config.remote as any)[i], url).href })
                return ''
              },
            )
            const RE = new RegExp(`\!${i}/(.*)`)
            alias.push({ find: RE, replacement: (p: string) => new URL((config.remote as any)[i], normalizeFileName(p)).href })
          }

          if (!cf.resolve)
            cf.resolve = {}
          cf.resolve.alias = alias
        }
      },
      transformIndexHtml(html: string) {
        return {
          html,
          tags: [
            {
              tag: 'script',
              attrs: {
                type: 'importmap',

              },
              children: `  {
                    "imports":${JSON.stringify(config.externals)}
                  }`,
              injectTo: 'head-prepend',
            }],
        }
      },
    },

  }
})
