# 垫片

如果希望在非 esm 下工作，需要降级为`systemjs`，具体步骤如下：
## 冷模式
如果消费端是冷模式，那么不需要做任何的工作，只需要引入`vite`官方的`@vitejs/plugin-legacy`，

> `webpack`等类似

## 热模式 
如果消费端是热模式，那需要两步
1. 在生产端，使用[dubhe transform](../api/cli.md)生成`sysmtemjs`格式
2. 在消费端, 可以在配置项中注入垫片。
```ts
export default {
  polyfill: {
    /**
     * string|boolean
     */
    systemjs, // systemjs的垫片，cdn形式，vite可不用
    /**
     * string|boolean
     */
    importMap// importmap的垫片，cdn形式
  },
}
```

> `importmap`其实没有那么理想，比如一旦创建以后，无法更改且全局唯一，反而`systemjs`能提供灵活的动态能力，也许只使用`systemjs`是一个不差的方式