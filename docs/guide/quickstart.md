# 快速开始

`dubhe` 存在至少一个生产端和一个消费端，

## 生产端

需要安装`dubhe-pub`，并将配置写入`dubhe.config.ts/js`


```ts
// in dubhe.config.ts
import type { PubConfig } from 'dubhe-pub'

export default {
  project: 'viteout', // 项目名
  entry: {
    // 各个入口
    test: './src/modules/test.ts',
    app: './src/App.vue',
    hello: './src/components/HelloWorld.vue',
  },
  types: true, // 是否产生dts
  externals: (name) => {
    if (name === 'vue')
      return true// 此时共有依赖为vue，后续放到cdn的依赖
  },
  HMR: [
    {
      port: 'http://localhost:4100', // 生产端的port，生产端watch模式打包时，使消费端正常热更新，如果不需要热更新，可不填
    },
  ],
  source: true, // 是否输出 源码
} as PubConfig
```

### vite

```ts
import { Pub } from 'dubhe-pub/vite'
export default defineConfig({
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
顺带一提，`dubhe`没有在生产端支持`webpcak`的计划，建议使用`esbuild`代替，
:::

然后使用`watch`模式打包，并在打包目录处打开静态服务器（`http-server`/`serve`/`live-server`都行，记得打开跨域）

## 消费端

同样需要一个配置文件

```ts
import type { SubConfig } from 'dubhe-sub'
export default {
  remote: {
    viteout: {
      // 远程项目名
      url: 'http://127.0.0.1:5173', // 静态服务url
      mode: 'hot', // 模式
    },
  },
  cache: true, // 使用缓存
  types: true, // 安装类型，要使用管理员权限
} as SubConfig
```
然后启动服务，

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