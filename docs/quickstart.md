# 快速开始

`dubhe` 存在至少一个生产端和一个消费端，这和模块联邦是一致的

## 生产端

需要安装`dubhe-pub`，并将配置写入`dubhe.config.ts/js`

> 不是必须放在这个文件，但这样做会方便 cli 的寻找

```ts
// in dubhe.config.ts
import type { PubConfig } from 'dubhe-pub'
import { esmsh } from 'dubhe-pub'

export default {
  project: 'viteout', // 项目名
  entry: {
    // 各个入口
    test: './src/modules/test.ts',
    app: './src/App.vue',
    hello: './src/components/HelloWorld.vue',
  },
  types: true, // 是否产生dts
  // limit: 1000,
  externals: {
    vue: 'cdn-vue',
  }, // 共享依赖通过cdn的形式
  HMR: [
    {
      port: 'http://localhost:4100', // 生产端的port，如果不需要热更新，可不填
    },
  ],
  outDir: '.dubhe', // 输出文件夹
  source: true, // 是否输出 源码
  importMap: true, // 是否使用 importmap模式
} as PubConfig
```

### vite

```ts
import { Pub } from 'dubhe-pub/vite'
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/dynamic_base__/' : '/', // 打包时这需要是一个特定字符串，从而使得消费端能够正确处理assets，比如图片等，由于vite 没有publicpath ，暂时采用社区插件vite-plugin-dynamic-base，故base不能为空
  plugins: [Pub(config)],
})
```

### esbuild

暂时需要依赖`esbuild-plugin-merge`,来提供`watch`模式和`transform`钩子，但这在最新的`esbuild@0.17`上不起效，需要安装`@0.16`或以前的版本

```ts
import { build } from 'esbuild'
import { Pub } from 'dubhe-pub/esbuild'
import { merge } from 'esbuild-plugin-merge'
import config from './dubhe.config'
build({
  plugins: [merge([...Pub(config)])],
})
```

:::warning 提醒
顺带一提，`dubhe`没有在生产端支持`webpcak`的计划（实际上是做不到，[详见]()），建议使用`esbuild`代替，
可以看看[unplugin]()社区有无同时支持`esbuild`，`webpack`的插件
:::

## 消费端

同样需要一个配置文件

```ts
import type { SubConfig } from 'dubhe-sub'
export default {
  remote: {
    viteout: {
      // 远程项目名
      url: 'http://127.0.0.1:5173',
      mode: 'hot', // 模式
    },
  },
  cache: true,
  types: true,
} as SubConfig
```

### vite

```ts
import { Sub } from 'dubhe-sub/vite'
export default {
  optimizeDeps: {
    exclude: [], // it doesn't work
  },
  server: {
    port: 4100,
  },
  plugins: [vue(), Sub(config)],
}
```
### webpack

```ts
const { Sub } = require('dubhe-sub/webpack')
const config = require('./dubhe.config')
/** @type {import('webpack').Configuration} */
module.exports = webpackEnv => ({
  mode: webpackEnv,
  plugins: [new Sub(config)],
  devServer: {
    hot: true,
    port: '8088',
  },
})
```
然后就可以在代码里使用了

```ts
import { testFromViteRemote } from 'dubhe-viteout/test'// dubhe-项目名/入口名
testFromViteRemote()
```