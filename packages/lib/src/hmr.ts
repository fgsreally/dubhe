// eslint-disable-next-line n/no-deprecated-api
import { resolve as urlResolve } from 'url'
import axios from 'axios'
import { log, resolveURLQuery } from './utils'
import { HMT_TYPES_TIMEOUT } from './common'
import { updateTypesFile } from './dts'
import type { SubConfig } from './types'
export function HMRModuleHandler(url: string) {
  const ret = resolveURLQuery(url) as any
  if (ret)
    return ret.module.map((item: string) => `dubhe-${ret.project}/${item}`)
}
/** update d.ts  */
export function HMRTypesHandler(url: string, remote: SubConfig['remote']) {
  const { file, project, module, types } = resolveURLQuery(url) as any

  if (
    types
      && (module as string[]).some(item => item.endsWith('.js'))
      && !(file as string).endsWith('.js')
  ) {
    setTimeout(() => {
      log('update types file', 'blue')
      updateTypesFile(
        urlResolve(remote[project].url, 'types/'),
        project,
        file.endsWith('.ts') ? file.replace(/\.ts$/, '.d.ts') : `${file}.d.ts`,
      )
    }, HMT_TYPES_TIMEOUT)
  }
}

// send HMR file info to Sub in watch mode
export async function sendHMRInfo({
  url,
  project,
  types,
  file,
  module,
}: {
  url: string
  types: boolean
  project: string
  file: string
  module: string[]
}) {
  return await axios.get(
      `${url}?file=${file}&project=${project}&module=${JSON.stringify(
        module,
      )}&types=${types}`,
  )
}
