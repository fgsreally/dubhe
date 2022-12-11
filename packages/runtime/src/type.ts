import type { EventType } from 'mitt'
import type { DubheModel } from '.'
export interface DubheNameSpace {
  [name: string]: DubheModel
}

export interface DubheEvents {
  [key: EventType]: any
}
