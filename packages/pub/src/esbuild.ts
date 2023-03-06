import { resolve } from 'path'
import type { PubConfig } from 'dubhe-lib'
import { EsbuildPolyfill, dtsPlugin } from './dts/index'
import { BundlePlugin as Bundle, CSSPlugin as CSS } from './bundle/esbuild'

// export { Bundle }
export const Dts = dtsPlugin.esbuild

export { CSS, Bundle }

export function Pub(dubheConfig: PubConfig): any {
  const config = Object.assign({}, dubheConfig) as Required<PubConfig>
  return [EsbuildPolyfill, Dts(config), Bundle(config), CSS()]
}

