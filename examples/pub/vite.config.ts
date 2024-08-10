import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { Pub } from 'dubhe'
// https://vitejs.dev/config/
export default defineConfig({
  // base: '/aa',
  plugins: [vue(),
    Pub({
      version: '0.0.0',
      external: ['vue', 'element-plus/es'],
      entries: {
        a: './src/entries/a.ts',
        b: './src/entries/b.ts',
      },
      dir: 'dubhe',
      name: 'pub',
    }),

  ],

  server: {
    port: 4000,
    cors: true,
    strictPort: true,

  },
  preview: {
    port: 4001,
    cors: true,
    strictPort: true,

  },
})
