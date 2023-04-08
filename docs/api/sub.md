### 消费端配置

```ts
interface SubConfig {
// 共用cdn依赖，不填会自动判断
  externals?: { [key: string]: string }

  // 版本
  version?: string

  // 远程项目
  remote: { [key: string]: {
    url: string
    // 打包模式,冷模式和正常应用无区别，热模式类似于模块联邦
    // 默认: cold
    mode: 'hot' | 'cold'
  } }

  // 是否使用缓存
  // 默认不使用
  cache?: boolean

  // 是否开启importmap，
  // 默认不开启
  importMap: boolean

  // 是否下载类型文件
  // 默认：false
  types?: boolean

}

```