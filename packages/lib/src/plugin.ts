import type { PluginOption } from 'vite'
import type { ResolvedId } from 'rollup'
import { getShortHash } from './utils'
import { VIRTUAL_CSS_PREFIX } from './common'
import { INJECT_STYLE_SCRIPT } from './style'
const cssCodeMap: Map<string, string> = new Map()
const cssIDMap: Map<string, string> = new Map()
const cssIDset: Set<string> = new Set()
export const virtualCssHelper = 'virtual:injectstyle'
export function CSS(): PluginOption {
  return {
    name: 'dubhe::css',
    enforce: 'pre',
    apply: 'build',
    async resolveId(id, i) {
      if (id.endsWith('main.css'))
        return
      if (id.endsWith('.css') && !cssIDset.has(id)) {
        cssIDset.add(id)
        const { id: originID } = await this.resolve(id, i) as ResolvedId
        const newId = genUid()
        cssIDMap.set(newId, originID)
        return newId
      }
      if (id === virtualCssHelper)
        return virtualCssHelper
    },
    async load(id) {
      if (id.endsWith('.dubhe_css.js')) {
        const originID = cssIDMap.get(id) as string
        await this.load({ id: originID })

        return mountStyle(cssCodeMap.get(originID) as string, originID.split('?')[0])
      }
      if (id === virtualCssHelper)
        return INJECT_STYLE_SCRIPT
    },
    transform(code, id) {
      if (id.endsWith('.css') && !id.endsWith('main.css')) {
        cssCodeMap.set(id, code)
        return ''
      }
    },
  }
}

export function mountStyle(css: string, id: string) {
  return `
   import {injectStyle} from '${virtualCssHelper}'
   injectStyle(\`${css}\`,\`${getShortHash(id)}\`)
    `
}

let cssID = 0
function genUid() {
  return `${VIRTUAL_CSS_PREFIX}${++cssID}.dubhe_css.js`
}
