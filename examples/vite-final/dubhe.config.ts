import type { SubConfig } from 'dubhe-sub'
export default {
  project: 'vite_final',
  remote: {
    vitesub: {
      url: 'http://127.0.0.1:8082/dist/hot',
      mode: process.env.HOTBUILD ? 'hot' : 'cold',
    },

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
