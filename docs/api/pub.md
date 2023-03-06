### 生产端配置

```ts
interface PubConfig {

  // 入口文件
  // 默认：src/dubhe.ts
  entry: string

  // 是否开启自动分包，当文件字符长度小于limit，会被分到vendor
  // 默认不开启
  limit?: number

  // 是否输出对应源码
  // 默认不输出
  source?: boolean// 是否输出源码

  // 输出文件夹
  // 默认：.dubhe
  outDir?: string

  // 共用依赖（cdn形式）
  // 默认为{}
  externals: { [key: string]: string }

  // 版本，用于消费端判断缓存是否命中
  // 默认为undefined
  version?: string

  // 是否开启importmap，该配置生产消费端必须相同
  // 默认不开启
  importMap: boolean

  // 项目名称
  project?: string

  // 是否输出类型
  // 默认不输出
  types?: boolean

  // 手动分包，将该id的文件分入vendor
  vendor?: string[]

  // 联调热更新，只用于watch 模式
  HMR?: {
    // 在消费端中项目的名称
    projectName: string
    // 消费端vite服务的url
    homePort: string
  }

  // 类型的相关配置
  dts?: dtsPluginOptions
  // 是否开启css split
  // 默认不开启
  cssSplit?: boolean
  // 元数据，根据自己需求填
  meta?: Metadata | any
}

```