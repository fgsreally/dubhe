import type { ConfigEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { Consumer } from 'dubhe/vite'
import { DubheResolver } from 'dubhe'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Inspect from 'vite-plugin-inspect'
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
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver(), DubheResolver()], vueTemplate: true,
      }),
      Components({
        resolvers: [ElementPlusResolver(), DubheResolver()],
      }),
      Consumer(),
    ],
  }
}
