import type { SubConfig } from 'dubhe-sub'
export default {
  remote: {
    viteout: {
      url: 'http://localhost:8080',
      mode: process.env.HOTBUILD ? 'hot' : 'cold',
    }, // remote static server
    // esbuildpub: {
    //   url: 'http://127.0.0.1:8081',
    //   mode: process.env.HOTBUILD ? 'hot' : 'cold',
    // },
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
  cache: false,
  types: true,
  info: false,
  polyfill: {
    importMap: true,
  },
} as SubConfig
