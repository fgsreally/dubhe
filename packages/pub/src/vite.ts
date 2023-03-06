import type { PubConfig } from 'dubhe-lib'
import { dynamicBase } from 'vite-plugin-dynamic-base'
import { CSS } from 'dubhe-lib'
import { dtsPlugin } from './dts/index'
import { BundlePlugin as Bundle } from './bundle/vite/vite'
import { DevPlugin as Dev } from './bundle/vite/dev'

export { Bundle, CSS }
export const Dts = dtsPlugin.vite as any

export function Pub(dubheConfig: PubConfig): any {
  const config = Object.assign({}, dubheConfig) as Required<PubConfig>

  return [Dev(config), Dts(config), Bundle(config), CSS(), dynamicBase({
    // dynamic public path var string, default window.__dynamic_base__
    publicPath: `__DUBHE_${dubheConfig.project}_`,
  })]
}

