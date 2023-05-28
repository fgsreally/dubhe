import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { Sub } from 'dubhe-sub/vite'
import config from './dubhe.config'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), Sub(config)],
})
