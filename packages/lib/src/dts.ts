import { dirname, join, resolve } from 'path'
// eslint-disable-next-line n/no-deprecated-api
import { resolve as urlResolve } from 'url'

import { normalizePath } from 'vite'
import axios from 'axios'
import fse from 'fs-extra'
import { log } from './utils'
import {
  TS_CONFIG_PATH,
  TYPE_ROOT,

} from './common'
import type {
  ModulePathMap,

} from './types'
import { getTypePathInCache, getTypePathInWorkspace } from './cache'

export function updateTSconfig(project: string, modulePathMap: ModulePathMap) {
  let tsconfig: any
  try {
    tsconfig = fse.readJSONSync(TS_CONFIG_PATH)
  }
  catch (e) {
    tsconfig = {
      compilerOptions: {
        baseUrl: '.',
        paths: {},
        composite: true,

      },
    }
  }

  for (const i in modulePathMap) {
    // js file should not be written into tsconfig
    if (modulePathMap[i].endsWith('.js'))
      continue
    const tsPath = normalizePath(
          `./${join('.dubhe/types', `${project}`, modulePathMap[i])}`,
    )
    tsconfig.compilerOptions.paths[`dubhe-${project}/${i}`] = [tsPath]
  }
  fse.outputJSON(TS_CONFIG_PATH, tsconfig)
}

export async function updateTypesFile(
  baseUrl: string,
  project: string,
  filePath: string,
) {
  try {
    const { data } = await axios.get(urlResolve(baseUrl, filePath))
    const p = resolve(TYPE_ROOT, project, filePath)
    await fse.outputFile(p, data)
    // log(`update types file --${p}`, "blue");
  }
  catch (e) {
    log('update types file failed', 'grey')
  }
}
export async function downloadTSFiles(fileSet: string, url: string, project: string) {
  for (const i of fileSet) {
    if (i.endsWith('.ts')) {
      const { data: code } = await axios.get(new URL(i, url).href)
      // if (i.includes('dubhe.d.ts'))
      //   entryFileCode = code.replace(/^export declare/gm, 'export')
      await fse.outputFile(resolve(TYPE_ROOT, project, i), code)
    }
  }
}

// ensure types files exist and link to workspace
export async function getTypes(url: string, project: string, fileMap: { [key: string]: string }) {
  try {
    if (fse.existsSync(getTypePathInWorkspace(project, '')))
      return
    const { data: fileSet } = await axios.get(url)
    if (!fse.existsSync(getTypePathInCache(project, '')))
      await downloadTSFiles(fileSet, url, project)

    await updateTSconfig(project, fileMap)
    await linkTypes(project, fileSet)
  }
  catch (e) {
    log(
          `can't find remote module (${project}) type declaration (it should be at "/types/types.json")`,
          'red',
    )
  }
}

// create link from types-cache to workspace
export async function linkTypes(project: string, fileSet: string) {
  for (const file of fileSet) {
    try {
      const dest = getTypePathInWorkspace(project, file)
      await fse.ensureDir(dirname(dest))
      await fse.symlink(getTypePathInCache(project, file), dest, 'junction')
    }
    catch (e) {
      log('fail to create symlink', 'red')
    }
  }
}
