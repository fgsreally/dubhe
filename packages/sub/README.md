# dubhe-sub
subscription side for dubhe

base options:
```ts
const config = {
  remote: {
    projectid: {
      url, // remote static server port
      mode // hot/cold
    },

  },
  externals: (id) => {
    // use cdn
  },
  injectHtml: true, // inject importmap to html
  systemjs: true, // inject systemjs importmap to html
  cache: false, // use cache
  types: true, // generate dts
  polyfill: {
    // polyfill for importmap and systemjs
  },
}

```

## vite

```ts
// in vite.config.ts
import { Sub } from 'dubhe-sub/vite'
import { DubheResolver } from 'dubhe-sub'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
export default {
  plugins: [
    AutoImport({
      resolvers: [DubheResolver(config)],
    }),
    Components({
      resolvers: [DubheResolver(config)],
    }),
    Sub(config),
  ],
}
```

## webpack
```ts
const { Sub } = require('dubhe-sub/webpack')
const { DubheResolver } = require('dubhe-sub')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
module.exports = {
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver(), DubheResolver(config)],
    }),
    Components({
      resolvers: [ElementPlusResolver(), DubheResolver(config)],
    }),
    new Sub(config),
  ],
}

```