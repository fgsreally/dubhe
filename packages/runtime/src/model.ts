import type { EffectScope } from 'vue'
import { effectScope, onUnmounted } from 'vue'
import type { Handler } from 'mitt'
import mitt from 'mitt'
import type { DubheEvents } from './type'
import { getHandler, getInitEvent, getModelState } from './helper'

export class DubheModel {
  _scope: EffectScope
  _symbol: string
  // _emitter: Emitter<DubheEvents> = window.__DUBHE_EMIT__
  constructor() {
    if (!window.__DUBHE_EMIT__) {
      window.__DUBHE_EMIT__ = mitt()
      window.__DUBHE_MODEL__ = []
      window.__DUBHE_NAMESPACE__ = {}
    }
    if (window.__DUBHE_NAMESPACE__[this._symbol])
      return window.__DUBHE_NAMESPACE__[this._symbol]
    window.__DUBHE_MODEL__.push(this._symbol)
    window.__DUBHE_NAMESPACE__[this._symbol] = this

    const scope = effectScope()
    this._scope = scope
    scope.run(() => {
      const stateVar = getModelState(this)
      stateVar.forEach((item) => {
        getHandler(this, item)(this)
      })
      const initEvents = getInitEvent(this)
      initEvents.forEach((item) => {
        (this as any)[item]()
      })
    })
  }

  on<Key extends keyof DubheEvents>(type: Key, handler: Handler<DubheEvents[Key]>): void {
    window.__DUBHE_EMIT__.on(type, handler)
  }

  emit(type: keyof DubheEvents, event: DubheEvents[keyof DubheEvents]) {
    window.__DUBHE_EMIT__.emit(type, event)
  }

  off<Key extends keyof DubheEvents>(type: Key, handler?: Handler<DubheEvents[Key]>): void {
    window.__DUBHE_EMIT__.off(type, handler)
  }

  vOn<Key extends keyof DubheEvents>(type: Key, handler: Handler<DubheEvents[Key]>): void {
    window.__DUBHE_EMIT__.on(type, handler)

    onUnmounted(() => {
      window.__DUBHE_EMIT__.off(type, handler)
    })
  }

  dispose() {
    this._scope.stop()
  }
}

