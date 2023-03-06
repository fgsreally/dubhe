import { build } from 'esbuild'
import { Pub } from 'dubhe-pub/esbuild'
import { merge } from 'esbuild-plugin-merge'
import unplugin from 'unplugin-vue'
import config from './dubhe.config'
build({
  outdir: 'dist',
  format: 'esm',
  splitting: true,
  watch: true,
  bundle: true,
  metafile: true,
  plugins: [merge([unplugin.esbuild(), ...Pub(config)])],
})
