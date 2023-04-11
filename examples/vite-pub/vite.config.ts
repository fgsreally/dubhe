import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { Federation } from 'dubhe-vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import config from './dubhe.config'
const isLoad = false
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': 'src',
    },
  },
  base: process.env.NODE_ENV === 'production' ? '/__dynamic_base__/' : '/',

  server: {
    port: 8080,
    cors: true,
  },

  plugins: [vue(), Federation(config),

    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),

  ],
})
