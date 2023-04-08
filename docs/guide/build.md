# 构建中的冷模式与热模式

在生产阶段，你需要关注某个远程项目该以何种模式调用。如果是冷模式，那这个远程项目就等同于一个`npm`包。如果是热模式，那么这就和模块联邦类似，远程项目是在浏览器中通过`import`引入（需要跨域支持）


## 垫片

如果希望热模式在非 esm 下工作，需要降级为`systemjs`，可以在配置项中注入垫片。垫片为cdn形式

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
> `importmap`其实没有那么理想，比如一旦创建以后，无法更改且全局唯一，反而`systemjs`能提供灵活的动态能力，也许只使用`systemjs`是一个更好的方式