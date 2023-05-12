import type { PubConfig } from 'dubhe-pub'
export default {
  project: 'esbuildpub',
  entry: {
    app: './src/App.vue',
    hello: './src/HelloWorld.vue',
    module: './src/module.ts',
  },
  types: false,
  // limit: 1000,
  externals: (id) => {
    if (id === 'vue')
      return true
  },
  HMR: [{
    port: 'http://localhost:4100',
  }],
  outDir: '.dubhe',
  source: true,

} as PubConfig
