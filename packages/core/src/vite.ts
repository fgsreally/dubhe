import { createRequire } from 'module'
import { resolve } from 'path'
import type { PluginOption } from 'vite'
import { dtsPlugin } from './dts/index'
import { HomePlugin } from './consumer'
import { DevPlugin } from './dev'
import { BundlePlugin as Bundle } from './bundle'
import type { dtsPluginOptions } from './types'
export { Bundle }
export const Home = HomePlugin.vite
export const Dev = DevPlugin.vite
export const Dts = dtsPlugin.vite as (options: dtsPluginOptions) => PluginOption

const require = createRequire(import.meta.url)

export function Publisher(): PluginOption {
  const config = require(resolve(process.cwd(), 'dubhe.cjs'))
  const dtsConfig = config.dts
  const pubConfig = config
  return [Dts(dtsConfig || {}), Bundle(pubConfig)]
}

export function Consumer() {
  const config = require(resolve(process.cwd(), 'dubhe.cjs'))
  return Home(config)
}
