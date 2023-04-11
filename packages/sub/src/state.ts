import type { AliasType, PubListType } from 'dubhe'

interface SubState {
  pubListMap: Record<string, PubListType>
  externalSet: Set<string>
  systemjsImportMap: Record<string, string>
  esmImportMap: Record<string, string>
  aliasMap: { [key: string]: AliasType[] }
}
export const state: SubState = { pubListMap: {}, externalSet: new Set(), systemjsImportMap: {}, esmImportMap: {}, aliasMap: {} }
export function getState() {
  return state
}
