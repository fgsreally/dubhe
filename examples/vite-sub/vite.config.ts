import type { UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { Sub } from 'dubhe-sub/vite'
import { DubheResolver } from 'dubhe-sub'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { visualizer } from 'rollup-plugin-visualizer'
import Inspect from 'vite-plugin-inspect'
import config from './dubhe.config'
export default (): UserConfig => {
  return {
    optimizeDeps: {
      exclude: [], // it doesn't work
    },
    build: {
      sourcemap: true,
      outDir: process.env.HOTBUILD ? 'dist/hot' : 'dist/cold',

    },
    server: {
      port: 4100,
    },
    plugins: [
      Inspect(),
      visualizer(),
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
