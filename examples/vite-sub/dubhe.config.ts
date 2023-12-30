import type { SubConfig } from 'dubhe-sub'
export default {
  project: 'vitesub',
  remote: {
    viteout: {
      url: 'http://127.0.0.1:8080',
      mode: process.env.HOTBUILD ? 'hot' : 'cold',
    }, // remote static server

  },
  externals: (id) => {
    if (id === 'vue') {
      return {
        esm: './vue.js', // only work for test
        // systemjs: '../systemjs/vue.js',
      }
    }
    if (id.includes('element-plus')) {
      return {
        esm: './element-plus.js',
        // systemjs: '../systemjs/element-plus.js',

      }
    }
  },
  // injectOpts: {
  //   importmap: 'link',
  //   systemjs: 'link',
  // },
  cache: !process.env.TEST,
  types: true,
  info: false,
  polyfill: {
    importMap: true,
  },
} as SubConfig

