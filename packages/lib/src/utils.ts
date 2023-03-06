import { extname, join, relative, resolve } from 'path'

import type { Color } from 'colors'
import colors from 'colors'
import { normalizePath } from 'vite'
import type { ModuleNode } from 'vite'
import axios from 'axios'
import fse from 'fs-extra'
import minimatch from 'minimatch'
import cv from 'compare-versions'
import debug from 'debug'
import hash from 'hash-string'
import {
  CACHE_ROOT,

  TYPE_ROOT,
  VIRTUAL_HMR_PREFIX,
} from './common'
// import type {

//   extensionType,
// } from './types'

export function normalizeFileName(name: string) {
  return `${name}${extname(name) ? '' : '.js'}`
}

export function getModuleName(fileName: string) {
  return fileName.replace(extname(fileName), '')
}

export function getHMRFilePath(i: ModuleNode) {
  return `/${normalizePath(relative(process.cwd(), i?.file || ''))}`
}

export function resolveURLQuery(url: string) {
  if (!url.startsWith(`/${VIRTUAL_HMR_PREFIX}`))
    return false
  const queryUrl = url.replace(`/${VIRTUAL_HMR_PREFIX}`, '')
  const query = new URLSearchParams(queryUrl)
  return {
    file: query.get('file'),
    types: query.get('types') === 'true',
    project: query.get('project'),
    module: JSON.parse(query.get('module') as string) as string[],
  }
}

const fileSet: string[] = []
let rootDir: string

// work for dts plugin only
export function traverseDic(dirPath: string, cb?: (opt: string[]) => void) {
  if (!rootDir)
    rootDir = dirPath
  fse.readdirSync(dirPath, { withFileTypes: true }).forEach((file) => {
    const filePath = join(dirPath, file.name)
    if (file.isFile())
      fileSet.push(normalizePath(relative(rootDir, filePath)))

    else if (file.isDirectory())
      traverseDic(filePath)
  })
  cb?.(fileSet)
}

export function log(msg: string, color: keyof Color = 'green') {
  // eslint-disable-next-line no-console
  console.log(colors[color](`${colors.cyan('[dubhe]')} ${msg}`))
}

export function getTypePath(project: string,
  moduleName: string) {
  return resolve(CACHE_ROOT, project, moduleName)
}

export function getLocalPath(project: string,
  moduleName: string) {
  return resolve(CACHE_ROOT, project, moduleName)
}

export async function getLocalContent(project: string,
  moduleName: string) {
  const path = getLocalPath(project, moduleName)
  if (fse.existsSync(path))
    return moduleName.endsWith('.json') ? fse.readJSON(path, 'utf-8') : fse.readFile(path, 'utf-8')
}

export function setLocalContent(path: string, content: string) {
  return fse.outputFile(path, content, 'utf-8')
}

export async function getRemoteContent(url: string) {
  const { data } = await axios.get(url)
  return data
}

// export function resolveExtension(
//   extensions: extensionType[],
//   moduleName: string,
//   basename: string,
// ) {
//   for (const i of extensions) {
//     if (extname(moduleName) === i.key)
//       return i.transform(basename)
//   }
// }

export function getRelatedPath(p: string) {
  return normalizePath(relative(process.cwd(), p))
}

export function addExtension(p: string) {
  return p + (extname(p) === '' ? '.ts' : '')
}

export function getShortHash(str: string) {
  return hash(str).toString(16)
}

export function getTypePathInCache(project: string, file: string) {
  return resolve(TYPE_ROOT, project, file)
}
export function getTypePathInWorkspace(project: string, file: string) {
  return resolve(process.cwd(), '.dubhe', 'types', project, file)
}

export function patchVersion(version1: string, version2: string) {
  return cv.compare(version1, version2, '=')
}

export const debugLog = debug('dubhe')

// glob to RegExp
export function toReg(input: string) {
  return minimatch.makeRe(input) || input
}

