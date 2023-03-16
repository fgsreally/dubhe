import type { ConfigEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { Sub } from 'dubhe-sub/vite'
import { DubheResolver, defineConfig } from 'dubhe-sub'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { visualizer } from 'rollup-plugin-visualizer'
import legacy from '@vitejs/plugin-legacy'
import Inspect from 'vite-plugin-inspect'
import config from './dubhe.config'
export default ({ mode }: ConfigEnv): UserConfig => {
  return {
    optimizeDeps: {
      exclude: [], // it doesn't work
    },
    server: {
      port: 4100,
    },
    plugins: [
      Inspect(),
      visualizer(),
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver(), DubheResolver(config)],
      }),
      Components({
        resolvers: [ElementPlusResolver(), DubheResolver(config)],
      }),
      Sub(config),
    ],
  }
}
