import type { AliasType, PubListType } from 'dubhe'

interface SubState {
  pubListMap: Record<string, PubListType>
  externalSet: Set<string>
  systemjsImportMap: Record<string, string>
  esmImportMap: Record<string, string>
  aliasMap: { [key: string]: AliasType[] }
  chains: { project: string; url: string; alias: AliasType[]; from: string }[]
  dependences: { project: string; from: string }[]
}
export const state: SubState = { pubListMap: {}, externalSet: new Set(), systemjsImportMap: {}, esmImportMap: {}, aliasMap: {}, chains: [], dependences: [] }
export function getState() {
  return state
}
