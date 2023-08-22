import type { UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { Sub } from 'dubhe-sub/vite'
import { Pub } from 'dubhe-pub/vite'
import { DubheResolver } from 'dubhe-sub'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { visualizer } from 'rollup-plugin-visualizer'
import Inspect from 'vite-plugin-inspect'
import Legacy from '@vitejs/plugin-legacy'
import config from './dubhe.config'
export const pubConfig = {
  project: 'vitesub',
  entry: {
    app: './src/App.vue',
  },
  types: true,
  // limit: 1000,
  externals: (id) => {
    if (id.startsWith('element-plus') || id === 'vue')
      return true
  },
  app: true,
  outDir: process.env.HOTBUILD ? 'dist/hot' : 'dist/cold',
  source: false,
} as PubConfig
export default (): UserConfig => {
  return {
    optimizeDeps: {
      exclude: [], // it doesn't work
    },
    build: {
      sourcemap: true,

    },
    server: {
      port: 4100,
    },
    plugins: [
      Inspect(),
      Legacy(),
      visualizer(),
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver(), DubheResolver(config)],
      }),
      Components({
        resolvers: [ElementPlusResolver(), DubheResolver(config)],
      }),
      Sub(config),
      Pub(pubConfig),
    ],
  }
}
