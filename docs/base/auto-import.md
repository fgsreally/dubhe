# 自动引入
## `unplugin-auto-import`/`unplugin-vue-components`

以 vite 为例

```ts
import { DubheResolver } from 'dubhe-sub'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import config from './dubhe.config'
export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [DubheResolver(config)],
    }),
    Components({
      resolvers: [DubheResolver(config)],
    }),
    Sub(config),
  ],
})
```
就可以在项目中随心所欲了


### in js

使用前
```ts
import { testFromViteRemote } from 'dubhe-viteout/test'
testFromViteRemote()
```
使用后
```ts
$viteout_test_testFromViteRemote()// $项目名_模块名_函数名
```


### in vue
使用前
```vue
<script setup lang="ts">
import ViteoutApp from 'dubhe-viteout/app'
</script>

<template>
  <viteout-app msg="remote app component from viteout" />
</template>

```
使用后

```vue
<template>
  <viteout-app msg="remote app component from viteout" />
  <!-- 项目名-模块名 -->
</template>

```

