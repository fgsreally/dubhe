import { resolve } from 'path'

import axios from 'axios'

import fse from 'fs-extra'
import { loadConfig } from 'unconfig'
import { log } from 'debug'
import { getLocalPath, getLocalRecord, getRemoteContent, getTypePathInCache } from '../cache'
import type { SubConfig } from '../types'
import { getPkgName } from '../utils'
import { removeHash } from '../core'

const root = process.cwd()

export function generateExports(imports: string[]) {
  return imports.reduce((p, c) => {
    const [importVar, importSource] = c.split('--')
    if (importVar === '*')
      return `export * from '${importSource}'\n`
    if (importVar === 'default')
      return `${p}import _defaultImport from '${importSource}'\nexport {_defaultImport as default}\n`
    if (importVar === '#side_effect')
      return `${p}import '${importSource}'\n`
    return `${p}export {${importVar}} from '${importSource}'\n`
  }, '')
}
export async function getWorkSpaceConfig() {
  const { config } = await loadConfig({
    sources: [
      // load from `my.config.xx`
      {
        files: 'dubhe.config',
        // default extensions
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json'],
      },

    ],

    merge: false,
  })
  return config as any
}

export async function getDubheList() {
  const workspaceConfig = await getWorkSpaceConfig()
  return Object.assign(await getLocalRecord(), workspaceConfig.remote)
}
export async function analysePubDep(dubheConfig: SubConfig, subList?: Record<string, Set<string>>) {
  const ret: Record<string, Set<string>> = subList || {}
  for (const project in dubheConfig.remote) {
    const pubList = await getRemoteContent(`${dubheConfig.remote[project].url}/core/dubheList.json`)
    if (!pubList)
      continue
    for (const dep in pubList.importsGraph) {
      const pkgName = getPkgName(dep)

      if (!ret[pkgName])
        ret[pkgName] = new Set()
      if (pubList.importsGraph[dep].length === 0)
        ret[pkgName].add(`#side_effect--${dep}`)

      else
        pubList.importsGraph[dep].forEach((item: string) => ret[pkgName].add(`${item}--${dep}`))
    }
  }
  return ret
}
export async function analyseSubDep(subListPath: string) {
  const ret = {} as Record<string, Set<string>>
  try {
    const subList = await fse.readJSON(subListPath)
    for (const dep in subList.importsGraph) {
      const pkgName = getPkgName(dep)

      if (!ret[pkgName])
        ret[pkgName] = new Set()
      if (subList.importsGraph[dep].length === 0)
        ret[pkgName].add(`#side_effect--${dep}`)

      else
        subList.importsGraph[dep].forEach((item: string) => ret[pkgName].add(`${item}--${dep}`))
    }
    return ret
  }
  catch (e) {
    log('can\'t find dubheList.json', 'red')
  }
}

export function getDubheDepJS() {
  return resolve(root, 'dubhe.dep.js')
}

export function isExist(p: string) {
  return fse.existsSync(p)
}

export async function downloadFile(url: string, output: string) {
  try {
    const { data: code } = await axios.get(url)
    await fse.outputFile(
      output,
      typeof code === 'string' ? code : JSON.stringify(code),
    )
  }
  catch (e) {
    log(`get remote content fail--${url}`)
    process.exit(1)
  }
}

export async function installProjectCache(baseUrl: string, files: string[], project: string) {
  for (const file of files)
    downloadFile(`${baseUrl}/core/${file}`, removeHash(getLocalPath(project, file)))
}

export async function installProjectTypes(baseUrl: string, project: string) {
  const typesFiles = await getRemoteContent(`${baseUrl}/types/types.json`)
  for (const file of typesFiles) {
    const typesPath = getTypePathInCache(project, file)
    downloadFile(`${baseUrl}/types/${file}`, typesPath)
  }
}

// export function updateTsConfig(project: string, fileMap: Record<string, string>) {
//   let tsconfig
//   const TS_CONFIG_PATH = resolve(
//     process.cwd(),
//     'tsconfig.dubhe.json',
//   )
//   try {
//     tsconfig = fse.readJSONSync(TS_CONFIG_PATH)
//   }
//   catch (e) {
//     tsconfig = {
//       compilerOptions: {
//         baseUrl: '.',
//         composite: true,
//         paths: {},
//       },
//     }
//   }

//   for (const i in fileMap) {
//     const jsPath = normalizePath(`./${join('.dubhe/types', project, fileMap[i])}`).replace(/\.ts$/, '')
//     // tsconfig.compilerOptions.paths[`!${project}/${i}.*`] = [jsPath]
//     tsconfig.compilerOptions.paths[`dubhe-${project}/${i}`] = [jsPath]
//   }
//   fse.outputJSON(TS_CONFIG_PATH, tsconfig)
// }

