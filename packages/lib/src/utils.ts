import { dirname, extname, isAbsolute, join, normalize, posix, relative, resolve, sep } from 'path'

import { existsSync, lstatSync, readdirSync, rmdirSync } from 'fs'
import os from 'os'
import type { Color } from 'colors'
import colors from 'colors'

import fse from 'fs-extra'
import cv from 'compare-versions'
import debug from 'debug'
import hash from 'hash-string'
import {
  VIRTUAL_HMR_PREFIX,
} from './common'
// import type {

//   extensionType,
// } from './types'

// export function normalizeFileName(name: string) {
//   return `${name}${extname(name) ? '' : '.js'}`
// }

// export function getModuleName(fileName: string) {
//   return fileName.replace(extname(fileName), '')
// }

// export function getHMRFilePath(i: ModuleNode) {
//   return `/${normalizePath(relative(process.cwd(), i?.file || ''))}`
// }
const windowsSlashRE = /\\/g

export function slash(p: string): string {
  return p.replace(windowsSlashRE, '/')
}
export const isWindows = os.platform() === 'win32'

export function normalizePath(id: string): string {
  return posix.normalize(isWindows ? slash(id) : id)
}

export function resolveURLQuery(url: string) {
  if (!url.startsWith(`/${VIRTUAL_HMR_PREFIX}`))
    return false
  const queryUrl = url.replace(`/${VIRTUAL_HMR_PREFIX}`, '')
  const query = new URLSearchParams(queryUrl)
  return {
    file: query.get('file'),
    dir: query.get('dir') || '',
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

// export function getTypePath(project: string,
//   moduleName: string) {
//   return resolve(CACHE_ROOT, project, moduleName)
// }

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
  return normalizePath(relative(process.cwd(), p || ''))
}

export function addExtension(p: string) {
  return p + (extname(p) === '' ? '.ts' : '')
}

export function getShortHash(str: string) {
  return hash(str).toString(16)
}

export function patchVersion(version1: string, version2: string) {
  return cv.compare(version1, version2, '=')
}

export const debugLog = debug('dubhe')

export function getFormatDate() {
  // const date = new Date()
  // const year = date.getFullYear()
  // const month = date.getMonth()
  // const day = date.getDate()
  // return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`
  return new Date().toLocaleString()
}

export function getPkgName(str: string) {
  if (str.startsWith('@'))
    return str.split('/').splice(0, 2).join('/')

  return str.split('/')[0]
}

export function isNativeObj<T extends Record<string, any> = Record<string, any>>(
  value: T,
): value is T {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function isRegExp(value: unknown): value is RegExp {
  return Object.prototype.toString.call(value) === '[object RegExp]'
}

export function isPromise(value: unknown): value is Promise<any> {
  return (
    !!value
    && typeof (value as any).then === 'function'
    && typeof (value as any).catch === 'function'
  )
}

export function mergeObjects<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  sourceObj: T,
  targetObj: U,
) {
  const loop: Array<{
    source: Record<string, any>
    target: Record<string, any>
    // merged: Record<string, any>
  }> = [
    {
      source: sourceObj,
      target: targetObj,
      // merged: mergedObj
    },
  ]

  while (loop.length) {
    const { source, target } = loop.pop()!

    Object.keys(target).forEach((key) => {
      if (isNativeObj(target[key])) {
        if (!isNativeObj(source[key]))
          source[key] = {}

        loop.push({
          source: source[key],
          target: target[key],
        })
      }
      else if (Array.isArray(target[key])) {
        if (!Array.isArray(source[key]))
          source[key] = []

        loop.push({
          source: source[key],
          target: target[key],
        })
      }
      else {
        source[key] = target[key]
      }
    })
  }

  return sourceObj as T & U
}

export function ensureAbsolute(path: string, root: string) {
  return path ? (isAbsolute(path) ? path : resolve(root, path)) : root
}

export function ensureArray<T>(value: T | T[]) {
  return Array.isArray(value) ? value : value ? [value] : []
}

export async function runParallel<T>(
  maxConcurrency: number,
  source: T[],
  iteratorFn: (item: T, source: T[]) => Promise<any>,
) {
  const ret: Promise<any>[] = []
  const executing: Promise<any>[] = []

  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item, source))

    ret.push(p)

    if (maxConcurrency <= source.length) {
      const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1))

      executing.push(e)

      if (executing.length >= maxConcurrency)
        await Promise.race(executing)
    }
  }

  return Promise.all(ret)
}

const speRE = /[\\/]/

export function queryPublicPath(paths: string[]) {
  if (paths.length === 0)
    return ''

  else if (paths.length === 1)
    return dirname(paths[0])

  let publicPath = normalize(dirname(paths[0])) + sep
  let publicUnits = publicPath.split(speRE)
  let index = publicUnits.length - 1

  for (const path of paths.slice(1)) {
    if (!index)
      return publicPath

    const dirPath = normalize(dirname(path)) + sep

    if (dirPath.startsWith(publicPath))
      continue

    const units = dirPath.split(speRE)

    if (units.length < index) {
      publicPath = dirPath
      publicUnits = units
      continue
    }

    for (let i = 0; i <= index; ++i) {
      if (publicUnits[i] !== units[i]) {
        if (!i)
          return ''

        index = i - 1
        publicUnits = publicUnits.slice(0, index + 1)
        publicPath = publicUnits.join(sep) + sep
        break
      }
    }
  }

  return publicPath.slice(0, -1)
}

export function removeDirIfEmpty(dir: string) {
  if (!existsSync(dir))
    return

  let onlyHasDir = true

  for (const file of readdirSync(dir)) {
    const abs = resolve(dir, file)

    if (lstatSync(abs).isDirectory()) {
      if (!removeDirIfEmpty(abs))
        onlyHasDir = false
    }
    else {
      onlyHasDir = false
    }
  }

  if (onlyHasDir)
    rmdirSync(dir)

  return onlyHasDir
}

export function debounce(fn: Function, time = 2000) {
  let timer: NodeJS.Timeout
  return (parms?: any) => {
    if (timer)
      clearTimeout(timer)

    timer = setTimeout(() => {
      fn(parms)
    }, time)
  }
}

