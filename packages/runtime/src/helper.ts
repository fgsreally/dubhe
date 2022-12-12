import type { DebuggerOptions } from 'vue'
import { computed, reactive, ref } from 'vue'
import type { DubheModel } from './model'
import type { DubheNameSpace } from './type'

function init(target: any) {
  if (!target._namespace) {
    target._namespace = {}
    target._namespace.__INIT_EVENT__ = new Set()
    target._namespace.__STATE_VAR__ = new Set()
    target._namespace.__STATE_HANDLER__ = {}
  }
}

export function regisInitEvent(target: any, key: string) {
  init(target)
  target._namespace.__INIT_EVENT__.add(key)
}

export function getInitEvent(target: any) {
  init(target)
  return [...target._namespace.__INIT_EVENT__] as string[]
}

export function setModalState(target: any, key: string) {
  init(target)
  target._namespace.__STATE_VAR__.add(key)
}

export function regisHandler(target: any, key: string, handler: Function) {
  init(target)
  target._namespace.__STATE_HANDLER__[key] = handler
}

export function getHandler(target: any, key: string) {
  return target._namespace.__STATE_HANDLER__[key]
}
export function getModelState(target: any) {
  init(target)
  return [...target._namespace.__STATE_VAR__] as string[]
}

export function D(target: any, key: string) {
  regisInitEvent(target, key)
}

export function Dcomputed<Model, Ret>(getter: (params: Model) => Ret, debugOptions?: DebuggerOptions): any {
  return (target: any, key: string) => {
    setModalState(target, key)
    regisHandler(target, key, (instance: any) => {
      instance[key] = computed(() => getter(instance), debugOptions)
    })
  }
}

export function Dtag(tag: string) {
  return (target: any) => {
    target.prototype._symbol = tag
  }
}

export function Dref<V = any>(v: V) {
  return (target: any, key: string) => {
    setModalState(target, key)
    regisHandler(target, key, (instance: any) => {
      instance[key] = ref(v)
    })
  }
}

export function Dreactive<V extends object>(v: V) {
  return (target: any, key: string) => {
    setModalState(target, key)

    regisHandler(target, key, (instance: any) => {
      instance[key] = reactive(v)
    })
  }
}

export function getModel<Key extends keyof DubheNameSpace>(name: Key): DubheNameSpace[Key] {
  return window.__DUBHE_NAMESPACE__[name]
}

export function useModel<T extends typeof DubheModel>(Model: T): InstanceType<T> {
  const instance = new Model()
  return new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function')
        return target[key].bind(target)
      return target[key]
    },
  })
}
