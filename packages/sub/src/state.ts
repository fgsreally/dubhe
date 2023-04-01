import type { AliasType, RemoteListType } from 'dubhe'

interface SubState {
  remoteListMap: Record<string, RemoteListType>
  externalSet: Set<string>
  systemjsImportMap: Record<string, string>
  esmImportMap: Record<string, string>
  aliasMap: { [key: string]: AliasType[] }
}
export const state: SubState = { remoteListMap: {}, externalSet: new Set(), systemjsImportMap: {}, esmImportMap: {}, aliasMap: {} }
export function getState() {
  return state
}
