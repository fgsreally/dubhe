import { PluginOption } from "vite";
import fetch from 'node-fetch'
import fse from 'fs-extra'
import { join } from "path";
import JSZip from 'jszip'


const STATIC_SYMBOL = '__STATIC__'
const DYNAMIC_SYMBOL = '__DYNAMIC__'
export function Sub({ remote, dir = '.dubhe-sub' }: {
    remote: {
        url: string,
        dynamic?: boolean
    }[],
    dir?: string
}): PluginOption {
    const pkg = fse.readJSONSync('./package.json')
    const externalSet = new Set<string>()
    const dynamicEntries = new Map<string, string>()
    const staticEntries = new Map<string, string>()
    let isDev = false
    return {
        name: 'dubhe-pub',
        async config(config, { command }) {
            const output = config.build?.rollupOptions?.output
            if (Array.isArray(output) || !output) {

            }

            isDev = command === 'serve'
            async function loadRemoteDubhe(url: string, dynamic = false) {

                const { version, externals, entries, name } = await (await fetch(new URL('dubhe.json', url).href)).json() as any

                let existDubheData: any
                if (pkg.dependencies[name]) {
                    const dubheDataPath = join(dir, name, 'dubhe.json')
                    if (await fse.pathExists(dubheDataPath)) {
                        existDubheData = await fse.readJSON(dubheDataPath)
                    }
                } else {
                    pkg.dependencies[name] = `file://./${dir}/${name}`
                }


                if (!existDubheData || Number(version) > Number(existDubheData.version)) {
                    const arrayBuffer = await (await fetch(new URL('dubhe.zip', url).href)).arrayBuffer();
                    const zip = await JSZip.loadAsync(arrayBuffer);
                    dynamic && externals.forEach((item: string) => externalSet.add(item))
                    entries.forEach((entry: string) => {
                        (dynamic ? dynamicEntries : staticEntries).set(`${name}/${entry}`, new URL(`${entry}.js`, url).href)
                    })
                    zip.forEach(async (relativePath, file) => {
                        // 读取文件内容
                        const buffer = await file.async("nodebuffer");

                        fse.outputFile(join(dir, name, relativePath), buffer)
                    });
                } else {
                    const { externals, entries, name } = await (await fetch(new URL('dubhe.json', url).href)).json() as any

                    dynamic && externals.forEach((item: string) => externalSet.add(item))

                    entries.forEach((entry: string) => {
                        (dynamic ? dynamicEntries : staticEntries).set(`${name}/${entry}`, new URL(`${entry}.js`, url).href)
                    })
                }

            }


            await Promise.all(remote.map(({ url, dynamic }) => loadRemoteDubhe(url, dynamic)))

            fse.outputJSON('package.json', pkg)
        },

        buildStart(options) {
            if (!isDev)
                [...externalSet].forEach((external) => {
                    this.emitFile({
                        preserveSignature: 'strict',
                        type: 'chunk',
                        id: external,
                        fileName: `/assets/${external}.js`
                    })
                })
        },

        resolveId(source, importer, options) {
            if (importer?.startsWith(STATIC_SYMBOL) && source.startsWith('.')) {
                return `${STATIC_SYMBOL}${new URL(source, importer.slice(STATIC_SYMBOL.length))}`
            }

            if (staticEntries.has(source)) {
                return isDev ? staticEntries.get(source)! : STATIC_SYMBOL + staticEntries.get(source)
            }
            if (dynamicEntries.has(source)) {
                return {
                    id: dynamicEntries.get(source)!,
                }
            }
            if ((!isDev) && importer && externalSet.has(source)) {
                return { external: true, id: source }
            }
        },

        async load(id) {
            if (id.startsWith(STATIC_SYMBOL)) {
                const code = (await fetch(id.slice(STATIC_SYMBOL.length))).text()
                return code
            }
        },

        transformIndexHtml(html) {

            const imports: Record<string, string> = {}

            for (const external of externalSet) {
                imports[external] = './assets/' + external + '.js'
            }

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
                            imports
                        }),
                    },
                ],
            }
        }

    }
}