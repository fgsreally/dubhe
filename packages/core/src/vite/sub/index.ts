import { join, posix } from 'path'
import type { PluginOption } from 'vite'
import fetch from 'node-fetch'
import fse from 'fs-extra'
import JSZip from 'jszip'
// import { installPackage } from '@antfu/install-pkg'
import { compareVersions } from 'compare-versions'
import { OptimizeImportmap } from '../optimizeImportmap'
import { DevExternal } from '../devExternal'
import { log } from '../../utils'

const STATIC_SYMBOL = '__DUBHE_STATIC__'
export function Sub({ remote, dir = '.dubhe' }: {
  remote: {
    url: string
    dynamic?: boolean
  }[]
  dir?: string
}): PluginOption {
  const externalSet = new Set<string>()
  const dynamicEntries = new Map<string, string>()
  const staticEntries = new Map<string, string>()
  const devUrlSet = new Set<string>()
  // const destSet = new Set<string>()

  async function loadRemoteDubhe(url: string, dynamic = false) {
    try {
      const { dev, version, external, entries, name } = await (await fetch(new URL('dubhe.json', url).href)).json() as any
      const dest = posix.join(dir, name.replace(/^\@dubhe\//, ''))
      if (dev) {
        devUrlSet.add(url)
        log(`project '${name}' use Dev Mode`)
      }
      let existDubheJSON: any

      const dubheJSONPath = join(dest, 'dubhe.json')
      if (await fse.pathExists(dubheJSONPath))
        existDubheJSON = await fse.readJSON(dubheJSONPath)

      if (!existDubheJSON || compareVersions(version, existDubheJSON.version) > 0) {
        await fse.remove(dest)
        const arrayBuffer = await (await fetch(new URL('dubhe.zip', url).href)).arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)
        dynamic && external.forEach((item: string) => externalSet.add(item))

        for (const entry in entries)
          (dynamic ? dynamicEntries : staticEntries).set(`${name}/${entry}`, new URL(entries[entry], url).href)

        zip.forEach(async (relativePath, file) => {
          // 读取文件内容
          const buffer = await file.async('nodebuffer')

          fse.outputFile(join(dir, name, relativePath), buffer)
        })
      }
      else {
        dynamic && external.forEach((item: string) => externalSet.add(item))

        for (const entry in entries)
          (dynamic ? dynamicEntries : staticEntries).set(`${name}/${entry}`, new URL(entries[entry], url).href)
      }
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }

  let isDev = false
  return [{
    name: 'vite-plugin-dubhe-sub',
    enforce: 'pre',
    async config(_, { command }) {
      isDev = command === 'serve'

      await Promise.all(remote.map(({ url, dynamic }) => loadRemoteDubhe(url, dynamic)))
    },

    buildStart() {
      if (!isDev) {
        [...externalSet].forEach((external) => {
          this.emitFile({
            preserveSignature: 'strict',
            type: 'chunk',
            fileName: `assets/${external}.js`,
            id: external,
          })
        })
      }
    },

    resolveId(source, importer) {
      if (!isDev) {
        if (importer?.startsWith(STATIC_SYMBOL) && source.startsWith('.'))
          return `${STATIC_SYMBOL}${new URL(source, importer.slice(STATIC_SYMBOL.length))}`
        if (importer && externalSet.has(source))
          return { external: true, id: source }

        if (staticEntries.has(source))
          return STATIC_SYMBOL + staticEntries.get(source)
      }
      if (staticEntries.has(source))
        return staticEntries.get(source)

      if (dynamicEntries.has(source))
        return { id: dynamicEntries.get(source)!, external: true }
    },

    async load(id) {
      if (!isDev && id.startsWith(STATIC_SYMBOL)) {
        const code = (await fetch(id.slice(STATIC_SYMBOL.length))).text()
        return code
      }
    },

    transformIndexHtml(html) {
      if (isDev) {
        return {
          html,
          tags: [...devUrlSet].map(url => ({
            tag: 'script',
            attrs: {
              type: 'module',
              src: new URL('/@vite/client', url).href,
            },
            injectTo: 'head-prepend',

          })),
        }
      }
      else {
        const imports: Record<string, string> = {}

        for (const external of externalSet)
          imports[external] = `./assets/${external}.js`

        return {
          html,
          tags: [
            {
              tag: 'script',
              attrs: {
                type: 'importmap',
              },
              injectTo: 'head-prepend',
              children: JSON.stringify({
                imports,
              }),
            },

          ],
        }
      }
    },

  }, DevExternal(externalSet), OptimizeImportmap()]
}
