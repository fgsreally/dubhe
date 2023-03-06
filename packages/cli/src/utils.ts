import { join, resolve } from 'path'
import type { SubConfig } from 'dubhe-lib'
import { getLocalPath, getLocalRecord, getRemoteContent, getTypePathInCache, log } from 'dubhe-lib'
import axios from 'axios'
import { normalizePath } from 'vite'

import fse from 'fs-extra'
import { loadConfig } from 'unconfig'

const root = process.cwd()

export function getPkgName(str: string) {
  if (str.startsWith('@'))
    return str.split('/').splice(0, 2).join('/')

  return str.split('/')[0]
}

export function generateExports(imports: string[]) {
  return imports.reduce((p, c) => {
    const [importVar, importSource] = c.split('--')
    if (importVar === 'default')
      return `${p}import _defaultImport from '${importSource}'\nexport {_defaultImport as default}\n`
    if (importVar === '#css')
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

export async function getRemoteList() {
  const workspaceConfig = await getWorkSpaceConfig()
  return Object.assign(await getLocalRecord(), workspaceConfig.remote)
}

export async function analyseDep(dubheConfig: SubConfig) {
  const ret = {} as Record<string, Set<string>>
  for (const project in dubheConfig.remote) {
    const remoteConfig = await getRemoteContent(`${dubheConfig.remote[project].url}/core/remoteList.json`)
    if (!remoteConfig)
      continue
    for (const dep in remoteConfig.importsGraph) {
      const pkgName = getPkgName(dep)

      if (!ret[pkgName])
        ret[pkgName] = new Set()
      if (remoteConfig.importsGraph[dep].length === 0)
        ret[pkgName].add(`#css--${dep}`)

      else
        remoteConfig.importsGraph[dep].forEach((item: string) => ret[pkgName].add(`${item}--${dep}`))
    }
  }
  return ret
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
  for (const file of files) {
    // const cachePath = getCachePath(project, file)
    downloadFile(`${baseUrl}/core/${file}`, getLocalPath(project, file))
  }
}

export async function installProjectTypes(baseUrl: string, project: string) {
  const typesFiles = await getRemoteContent(`${baseUrl}/types/types.json`)
  for (const file of typesFiles) {
    const typesPath = getTypePathInCache(project, file)
    downloadFile(`${baseUrl}/types/${file}`, typesPath)
  }
}

export function updateTsConfig(project: string, fileMap: Record<string, string>) {
  let tsconfig
  const TS_CONFIG_PATH = resolve(
    process.cwd(),
    'tsconfig.dubhe.json',
  )
  try {
    tsconfig = fse.readJSONSync(TS_CONFIG_PATH)
  }
  catch (e) {
    tsconfig = {
      compilerOptions: {
        baseUrl: '.',
        paths: {},
      },
    }
  }

  for (const i in fileMap) {
    const jsPath = normalizePath(`./${join('.dubhe/types', project, fileMap[i])}`).replace(/\.ts$/, '')
    // tsconfig.compilerOptions.paths[`!${project}/${i}.*`] = [jsPath]
    tsconfig.compilerOptions.paths[`dubhe-${project}/${i}`] = [jsPath]
  }
  fse.outputJSON(TS_CONFIG_PATH, tsconfig)
}

