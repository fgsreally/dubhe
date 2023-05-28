import type { PubConfig, SubConfig } from 'dubhe-sub'
export const subConfig = {
  project: 'vitesub',
  remote: {
    viteout: {
      url: 'http://127.0.0.1:8080',
      mode: process.env.HOTBUILD ? 'hot' : 'cold',
    }, // remote static server

  },
  externals: (id) => {
    if (process.env.TEST) {
      if (id === 'vue' || id.includes('element-plus')) {
        return {
          esm: `dubhe:${id}`, // only work for test
          systemjs: `dubhe:${id}`, // only work for test
        }
      }
    }
  },
  injectHtml: true,
  systemjs: true,
  cache: !process.env.CI,
  types: true,
  info: false,
  polyfill: {
    importMap: true,
  },
} as SubConfig

export const pubConfig = {
  project: 'vitesub',
  entry: {
    app: './src/App.vue',
  },
  types: true,
  // limit: 1000,
  externals: (id) => {
    if (id.startsWith('element-plus') || id === 'vue')
      return true
  },
  app: true,
  outDir: process.env.HOTBUILD ? 'dist/hot' : 'dist/cold',
  source: false,
} as PubConfig
