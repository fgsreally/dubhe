import fs from 'fs'
import { join, relative } from 'path'
import type { PluginOption } from 'vite'
import JSZip from 'jszip'
import type { OutputBundle, OutputChunk } from 'rollup'
import { log } from '../utils'
function getExposeFromBundle(bundle: OutputBundle) {
  const importsGraph = {} as Record<string, Set<string>>
  for (const i in bundle) {
    if (bundle[i].type === 'chunk') {
      Object.entries((bundle[i] as OutputChunk).importedBindings).forEach(
        (item) => {
          const packageName = item[0]
          // importsGraph should not includes remote project in hot mode
          if (packageName.startsWith('dubhe-'))
            return
          if (!(packageName in bundle)) {
            if (!importsGraph[packageName])
              importsGraph[packageName] = new Set()

            item[1].forEach(f => importsGraph[packageName].add(f))
          }
        },
      )
    }
  }
  for (const i in importsGraph)
    importsGraph[i] = [...importsGraph[i]] as any

  return importsGraph as unknown as Record<string, string[]>
}

export function Pub({ entries, dir, version }: {
  entries: Record<string, string>
  dir: string
  version?: string
}): PluginOption {
  return {
    name: 'dubhe-pub',
    enforce: 'pre',
    config() {
      return {
        build: {
          lib: {
            entry: entries,
            formats: ['es'],
          },

          cssCodeSplit: true,
        },
      }
    },

    generateBundle: {
      order: 'post',
      async handler(_, data) {
        if (!fs.existsSync(dir))
          fs.mkdirSync(dir)

        const bundleGraph: { [key: string]: string[] } = {}
        const outputSourceGraph: { [key: string]: string[] } = {}

        // alias.forEach(item => item.url = this.getFileName(item.url))
        const importsGraph = getExposeFromBundle(data)

        // generate zip
        const zip = new JSZip()
        function traverseDirectory(directoryPath: string) {
          const files = fs.readdirSync(directoryPath)
          files.forEach((file) => {
            const fullPath = join(directoryPath, file)
            const relativePath = relative(dir, fullPath)
            if (fs.lstatSync(fullPath).isDirectory())
              traverseDirectory(fullPath)
            else
              zip.file(relativePath, fs.readFileSync(fullPath))
          })
        }
        traverseDirectory(dir)

        const exports = {} as Record<string, {
          types: string
        }>
        // detect dts

        for (const key in entries) {
          if (fs.existsSync(join(dir, `${key}.d.ts`)))
            exports[`./${key}`] = { types: `./${key}.d.ts` }

          else
            log(`can't find entry "${key}" declartion file`)
        }

        zip.file('package.json', JSON.stringify({
          type: 'module',
          exports,
        }))

        this.emitFile({
          type: 'asset',
          name: 'dubhe-dts',
          fileName: 'dubhe-dts.zip',

          source: await zip.generateAsync({ type: 'uint8array' }),
        })

        this.emitFile({
          type: 'asset',
          name: 'dubhe',
          fileName: 'dubhe.json',

          source: JSON.stringify({
            type: 'publish',
            version,
            timestamp: new Date().toLocaleString(),

            sourceGraph: outputSourceGraph,
            importsGraph,
            bundleGraph,
          }),
        })
      },
    },
  }
}
