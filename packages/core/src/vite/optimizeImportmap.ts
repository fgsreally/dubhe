import fs from 'fs'
import { join } from 'path'
import type { PluginOption, ViteDevServer } from 'vite'
import type { Plugin } from 'esbuild'
/**
 * create importmap from hash
 */

export interface ImportmapOpts {
  imports?: Record<string, string>
  scopes?: Record<string, Record<string, string>>
}
export function OptimizeImportmap(): PluginOption {
  const metaDataPath = join('node_modules/.vite/deps', '_metadata.json')
  let server: ViteDevServer
  const esbuildPlugin: Plugin = {
    name: 'vite-plugin-optimize-importmap',
    setup(build) {
      build.onEnd(({ metafile }) => {
        if (metafile && server) {
          setTimeout(() => {
            server.ws.send({ type: 'full-reload' })
          }, 1000)
        }
      })
    },
  }
  return {
    name: 'vite-plugin-optimize-importmap',
    enforce: 'post',
    apply: 'serve',
    config() {
      return {
        optimizeDeps: {
          esbuildOptions: {
            plugins: [esbuildPlugin as any],
          },
        },
      }
    },
    configureServer(s) {
      server = s
    },
    async transformIndexHtml(html) {
      if (!fs.existsSync(metaDataPath))

        return

      const imports: Record<string, string> = {}
      const metaData = JSON.parse(fs.readFileSync(metaDataPath, 'utf-8'))
      for (const key in metaData.optimized)
        imports[key] = `./node_modules/.vite/deps/${metaData.optimized[key].file}?${metaData.browserHash}`
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
    },
  }
}

