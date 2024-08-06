import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { Sub } from 'dubhe'
// https://vitejs.dev/config/

const dynamic = !!process.env.DYNAMIC
export default defineConfig({
  plugins: [vue(),

    await Sub({
      remote: [
        {
          url: process.env.REMOTE!,
          dynamic,
        },
      ],
    })],

  build: {
    outDir: dynamic ? 'dist/dynamic' : 'dist/static',
  },

  server: {
    port: 5000,
    strictPort: true,
  },
  preview: {
    port: dynamic ? 5001 : 5002,
    strictPort: true,
  },
})
