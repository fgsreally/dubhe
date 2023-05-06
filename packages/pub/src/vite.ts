import type { PubConfig } from 'dubhe'
import { dynamicBase } from 'vite-plugin-dynamic-base'
import { CSS } from 'dubhe'
import { dtsPlugin } from './dts/index'
import { BundlePlugin as Bundle } from './bundle/vite/vite'
import { DevPlugin as Dev } from './bundle/vite/dev'

export { Bundle, CSS }
export { dtsPlugin as Dts }

export function Pub(dubheConfig: PubConfig): any {
  const config = Object.assign({}, dubheConfig) as Required<PubConfig>

  return [Dev(config), dtsPlugin(config).vite, Bundle(config), CSS(), dynamicBase({
    // dynamic public path var string, default window.__dynamic_base__
    publicPath: `globalThis.__DP_${config.project}_`,
    transformIndexHtml: false,

  })]
}

