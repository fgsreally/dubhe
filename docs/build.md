# 模式

在生产阶段，你需要关注某个远程项目该以何种模式调用。如果是冷模式，那这个远程项目就等同于一个`npm`包。如果是热模式，那么这就和模块联邦类似，远程项目是在浏览器中通过`import`引入（需要跨域支持）

> 在开发阶段，这没影响

## 垫片

如果希望热模式在非 esm 下工作，需要降级为`systemjs`，可以在配置项中注入垫片。

```ts
export default {
  polyfill: {
    /**
     * string|boolean
     */
    systemjs, // 添加systemjs
    /**
     * string|boolean
     */
    importMap, // import-map的垫片
  },
}
```
