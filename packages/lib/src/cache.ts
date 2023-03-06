import { resolve } from 'path'
import fse from 'fs-extra'
import { CACHE_ROOT, TYPE_ROOT } from './common'
// update global config
export async function updateLocalRecord(config: Record<string, { mode?: 'hot' | 'cold', url: string }>) {
  const recordPath = resolve(CACHE_ROOT, 'dubhe-record.json')
  const records = await getLocalRecord(recordPath)
  Object.assign(records, config)
  await fse.outputJSON(recordPath, records)
}

export async function getLocalRecord(recordPath: string) {
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