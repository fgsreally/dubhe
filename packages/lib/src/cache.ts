import { resolve } from 'path'
import fse from 'fs-extra'
import type { SubConfig } from './types'
import { CACHE_ROOT } from './common'
// update global config
export async function updateLocalRecord(config: SubConfig) {
  const recordPath = resolve(CACHE_ROOT, 'dubhe-record.json')
  const records = await getLocalRecord(recordPath)
  Object.assign(records, config.remote)
  await fse.outputJSON(recordPath, records)
}

export async function getLocalRecord(recordPath: string) {
  let records = {} as any
  if (fse.existsSync(recordPath))
    records = await fse.readJSON(recordPath)
  return records
}
