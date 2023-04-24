import { build } from 'esbuild'
import { Pub } from 'dubhe-pub/esbuild'
import { merge } from 'esbuild-plugin-merge'
import vue from 'unplugin-vue/esbuild'
import config from './dubhe.config'
build({
  watch: false,
  // sourcemap: true,//it seems like that unplugin-vue doesn't support sourcemap in esbuild
  plugins: [merge([vue(), ...Pub(config)])],
})
