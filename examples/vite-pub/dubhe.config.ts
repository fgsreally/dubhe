import type { PubConfig } from 'dubhe-pub'

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
    if (id.startsWith('element-plus') || id === 'vue')
      return true
  },
  app: false,
  HMR: [{
    port: 'http://localhost:4100',
  }],
  outDir: '.dubhe',
  source: true,
} as PubConfig

