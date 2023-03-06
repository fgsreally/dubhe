import axios from 'axios'
import { log } from 'debug'
import { HMT_TYPES_TIMEOUT } from './common'
import { updateTypesFile } from './dts'
import { resolveURLQuery, urlResolve } from './utils'
export function HMRModuleHandler(url: string) {
  const ret = resolveURLQuery(url) as any
  if (ret)
    return ret.module.map((item: string) => `dubhe-${ret.project}/${item}`)
}
/** update d.ts  */
export function HMRTypesHandler(url: string, PubConfig: Record<string, string>) {
  const { file, project, module, types } = resolveURLQuery(url) as any

  if (
    types
      && (module as string[]).some(item => item.endsWith('.js'))
      && !(file as string).endsWith('.js')
  ) {
    setTimeout(() => {
      log('update types file', 'blue')
      updateTypesFile(
        urlResolve(PubConfig[project], 'types/'),
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
