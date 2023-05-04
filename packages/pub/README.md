# dubhe-pub
publishing side for dubhe

base options:
```ts
const config = {
  project: 'viteout', // projectID
  entry: {
    // entries

  },
  types: true, // output dts
  externals: (id) => {
    // which use cdn
  },
  HMR: [
    // hmr port
  ],
  source: false, // output source code
}
```

## vite

```ts
// in vite.config.ts
import { Pub } from 'dubhe-pub/vite'

export default {
  plugins: [
    Pub(config)
  ]
}

```

## esbuild

```ts
import { build } from 'esbuild'
import { Pub } from 'dubhe-pub/esbuild'
import { merge } from 'esbuild-plugin-merge'// not support esbuild^0.17
import vue from 'unplugin-vue/esbuild'
build({
  watch: true, // use watch mode
  plugins: [merge([vue(), ...Pub(config)])],
})

```