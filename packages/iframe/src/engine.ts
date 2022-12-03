import type { Emitter, EventType } from 'mitt'
import mitt from 'mitt'
import type { IframePool } from './type'

export class Dubhe<Data extends Object, Events extends Record<EventType, unknown>> {
  data: Data
  emitter: Emitter<Events>
}

export class Publish<Data extends Object, Events extends Record<EventType, unknown>> extends Dubhe<Data, Events> {
  listener: { type: string; handler: (params: any) => void }[] = []
  constructor(
    public errHandler: (parms: string) => void = console.warn,
  ) {
    super()

    if (self === top) {
      this.errHandler('[dubhe]: publish instance should be in an iframe')
      return
    }
    this.data = parent.window.__DUBHE_DATA__
    if (!this.data)
      this.errHandler('[dubhe]: can not find __DUBHE_DATA__ in parent window')

    if (typeof this.data !== 'object')
      this.errHandler('[dubhe]: __DUBHE_DATA__ is not an object')

    this.emitter = parent.window.__DUBHE_EMITTER__

    if (!this.emitter)
      this.errHandler('[dubhe]: can not find __DUBHE_EMITTER__ in parent window')
    window.addEventListener('message', this.listen, false)
  }

  listen(e: any) {
    for (const i of this.listener) {
      if (i.type === e.data.type)
        i.handler(e.data.data)
    }
  }

  dispose() {
    window.removeEventListener('message', this.listen)
  }

  on<Params = any>(type: string, handler: (params: Params) => void) {
    this.listener.push({ type, handler })
  }
}

export class Subscribe<Namespace extends string, Data extends Object, Events extends Record<EventType, unknown>> extends Dubhe<Data, Events> {
  instancePool: IframePool = {}
  constructor(public data: Data, iframeMap: Record<string, string> = {}) {
    super()
    for (const i in iframeMap)
      this.add(i as Namespace, iframeMap[i])
    window.__DUBHE_EMITTER__ = this.emitter = mitt()
    window.__DUBHE_DATA__ = this.data
    window.__IS_DUBHE__ = true
  }

  send(name: Namespace, type: string, data: any, targetOrigin = '*') {
    const windowInstance = this.instancePool[name].contentWindow as Window
    windowInstance.postMessage({
      type, data,
    }, targetOrigin)
  }

  add(name: Namespace, url: string) {
    const iframe = document.createElement('iframe')
    iframe.src = url
    this.instancePool[name] = iframe
    return new Promise((resolve, reject) => {
      iframe.onload = resolve
      iframe.onerror = reject
    })
  }

  del(name: Namespace) {
    delete this.instancePool[name]
  }
}
