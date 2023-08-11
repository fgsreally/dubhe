import { dirname, resolve } from 'path'
import fse from 'fs-extra'
import axios from 'axios'
import { CACHE_ROOT, TYPE_ROOT } from './common'
import { log } from './utils'
// update global config
export async function updateLocalRecord(config: Record<string, { mode?: 'hot' | 'cold'; url: string }>) {
  const records = await getLocalRecord()
  Object.assign(records, config)
  writeLocalRecord(JSON.stringify(records))
}

export async function writeLocalRecord(content: string) {
  const recordPath = resolve(CACHE_ROOT, 'dubhe-record.json')
  await fse.outputFile(recordPath, content)
}

export async function getLocalRecord() {
  const recordPath = resolve(CACHE_ROOT, 'dubhe-record.json')

  let records = {} as any
  if (fse.existsSync(recordPath))
    records = await fse.readJSON(recordPath)
  return records
}
// removeLocalCache, removeLocalType, updateLocalRecord
export async function removeLocalCache(project: string) {
  return fse.remove(resolve(CACHE_ROOT, project))
}

export async function removeLocalType(project: string) {
  return fse.remove(resolve(TYPE_ROOT, project))
}

export async function removeWorkspaceType(project: string) {
  return fse.remove(resolve(process.cwd(), '.dubhe/types', project))
}

export function getLocalPath(project: string,
  moduleName: string) {
  return resolve(CACHE_ROOT, project, moduleName)
}

export function isLocalPath(path: string) {
  return path.startsWith(CACHE_ROOT)
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

export function getTypePathInCache(project: string, file: string) {
  return resolve(TYPE_ROOT, project, file)
}

export function getPathInWorkspace(project: string, file: string) {
  return resolve(process.cwd(), '.dubhe', 'core', project, file)
}

export function getTypePathInWorkspace(project: string, file: string) {
  return resolve(process.cwd(), '.dubhe', 'types', project, file)
}

// create link from types-cache to workspace
export async function linkCache(project: string, fileSet: string[]) {
  for (const file of fileSet) {
    try {
      const dest = getPathInWorkspace(project, file)
      await fse.ensureDir(dirname(dest))
      await fse.symlink(getLocalPath(project, file), dest, 'file')
    }
    catch (e) {
      log('fail to create symlink', 'red')
    }
  }
}
