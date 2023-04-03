### 生产端配置

```ts
interface PubConfig {

  // 入口文件
  // 默认：src/dubhe.ts
  entry: string


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
  // 默认为0.0.0
  version?: string


  // 项目名称
  project?: string

  // 是否输出类型
  // 默认不输出
  types?: boolean


  // 联调热更新，只用于watch 模式
  HMR?: {
    // 在消费端中项目的名称
    projectName: string
    // 消费端vite服务的url
    homePort: string
  }

  // 类型的相关配置
  dts?: dtsPluginOptions

  // 元数据，根据自己需求填
  meta?:  any
}

```