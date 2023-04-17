import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { Remote } from 'tianshu/vite'
import { Pub } from 'dubhe-pub/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import config from './dubhe.config'
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': 'src',
    },
  },

  server: {
    port: 8080,
    cors: true,
  },

  plugins: [vue(), Pub(config),

    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),

  ],
})
