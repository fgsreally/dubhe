# 模式

在生产阶段，你需要关注某个远程项目该以何种模式调用。如果是冷模式，那这个远程项目就等同于一个`npm`包。如果是热模式，那么这就和模块联邦类似，远程项目是在浏览器中通过`import`引入（需要跨域支持）

> 在开发阶段，这没影响

## 垫片

如果希望热模式在非 esm 下工作，需要降级为`systemjs`，可以在配置项中注入垫片。

```ts
export default {
  injectHtml: {
    // injectHtml 为false时，不注入任何垫片，垫片默认均为unpkg的源
    systemjs, // systemjs
    importMap, // import-map的垫片，如果有远程项目使用了importmap，就启用它
    systemBabel, // 功能是在systemjs中调用esm 这是一个破坏力很大的垫片，会影响体积性能，官方的实现有一点赘余，建议自行封装一个。如果不想用，可以改造生产端的线上版本为systemjs
  },
}
```
