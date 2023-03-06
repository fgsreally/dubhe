import type { PubConfig } from 'dubhe-pub'
import { esmsh } from 'dubhe-pub'
export default {
  project: 'esbuildpub',
  entry: {
    app: './src/App.vue',
    hello: './src/HelloWorld.vue',
  },
  types: true,
  // limit: 1000,
  externals: esmsh(['vue']),
  HMR: [{
    port: 'http://localhost:4100',
  }],
  outDir: '.dubhe',
  // vendor: ['\0plugin-vue:export-helper'],
  source: true,
  cssSplit: true,
  importMap: true,
} as PubConfig
