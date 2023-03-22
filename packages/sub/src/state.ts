import type { RemoteListType } from 'dubhe-lib'

interface SubState {
  remoteListMap: Record<string, RemoteListType>
}
export const state: SubState = { remoteListMap: {} }
export function getState() {
  return state
}
