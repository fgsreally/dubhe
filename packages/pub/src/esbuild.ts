import type { PubConfig } from 'dubhe'
import { dtsPlugin } from './dts/index'
import { BundlePlugin as Bundle, CSSPlugin as CSS } from './bundle/esbuild'
// export { Bundle }

export { dtsPlugin as Dts }
export { CSS, Bundle }

export function Pub(dubheConfig: PubConfig): any {
  const config = Object.assign({}, dubheConfig) as Required<PubConfig>

  return [dtsPlugin(config).esbuild, Bundle(config), CSS()]
}

