import { PubBundle } from './bundle'
import { PubDev } from './dev'
import type { PubOptions } from './types'

export function Pub(options: PubOptions) {
  return [PubDev(options), PubBundle(options)]
}

export * from './types'
