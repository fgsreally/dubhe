import type { SubConfig } from 'dubhe-sub'
export default {
  remote: {
    viteout: {
      url: 'http://127.0.0.1:8080',
      mode: 'hot',
    }, // remote static server
  },
  externals: id => `dubhe${id}`,
  systemjs: true,
  cache: true,
  types: true,
  info: false,
  injectHtml: {
    importMap: true,
  },
} as SubConfig
