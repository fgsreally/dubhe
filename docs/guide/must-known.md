# 用前须知
需要关注这几个点

1. 存在热模式和冷模式两种，
冷模式下，打包出来的产物和安装`npm`包的正常产物完全一致，热模式下，则是在浏览器中`import`。一个生产端下的产物只能使用同模式


2. 本质上是`esm`/`importmap`体系，但提供了`100%`的兼容，如果执意使用`umd`等方案，`dubhe`也许帮不到你
3. 请放心大胆的在各个应用之间共享代码，对于耦合的影响，`dubhe`有做一些准备
4. 鉴于其对css的特殊处理，目前只支持web平台。
4. 需要关注缓存和[命令行工具](../api/cli.md)里的东西，前者是性能的保证，后者则是包括绝大部分可能会用到的功能