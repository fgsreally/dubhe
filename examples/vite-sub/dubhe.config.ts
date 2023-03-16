import type { SubConfig } from 'dubhe-sub'
export default {
  remote: {
    viteout: {
      url: 'http://127.0.0.1:5173',
      mode: 'hot',
    }, // remote static server
    esbuildpub: {
      url: 'http://127.0.0.1:8081',
      mode: 'hot',
    },
  },
  externals: (id) => {

  },
  systemjs: true,
  cache: false,
  types: true,
  info: false,
  injectHtml: {
    importMap: true,
  },
} as SubConfig
