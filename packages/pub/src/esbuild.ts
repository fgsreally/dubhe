import type { PubConfig } from 'dubhe'
import { dtsPlugin } from './dts/index'
import { BundlePlugin as Bundle, CSSPlugin as CSS } from './bundle/esbuild'
// export { Bundle }

export { dtsPlugin as Dts }
export { CSS, Bundle }

export function Pub(config: PubConfig) {
  const plugins: any = []
  config.types && plugins.push(dtsPlugin(config).esbuild)
  plugins.push(Bundle(config))

  plugins.push(CSS())

  return plugins
}

