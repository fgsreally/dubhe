import type { PubConfig } from 'dubhe-pub'
import { esmsh } from 'dubhe-pub'

export default {
  project: 'viteout',
  entry: {
    test: './src/modules/test.ts',
    app: './src/App.vue',
    hello: './src/components/HelloWorld.vue',
  },
  types: true,
  // limit: 1000,
  externals: (id) => {
    if (id.startsWith('element-plus') || id === 'vue' || id === 'fgs')
      return true
  },
  HMR: [{
    port: 'http://localhost:8081',
  }],
  outDir: '.dubhe',
  source: true,
  importMap: true,
} as PubConfig

