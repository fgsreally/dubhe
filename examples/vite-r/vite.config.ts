import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { Remote } from 'tianshu/vite'
import { Publisher } from 'dubhe/vite'
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': 'src',
    },
  },
  build: {

  },
  plugins: [vue(), Publisher(),

  ],
})
