import type { PubConfig } from 'dubhe-lib'
import { dtsPlugin } from './dts/index'
import { BundlePlugin as Bundle, CSSPlugin as CSS } from './bundle/esbuild'
// export { Bundle }

export { CSS, Bundle }

export function Pub(dubheConfig: PubConfig): any {
  const config = Object.assign({}, dubheConfig) as Required<PubConfig>

  return [dtsPlugin(config).esbuild, Bundle(config), CSS()]
}

