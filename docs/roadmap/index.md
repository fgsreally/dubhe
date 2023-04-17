## 短期计划
1. 可以设置`config path`，（现在默认是找目录下的`dubhe.config.js/ts/json`）
2. 全部功能均应保留离线功能 （现在大部分功能都必须生产端服务运行，比如cli）
3. 为`webpack`生产端构建时提供`dubheList.json`，（现在不会生成，所有在`webpack`端无法使用命令行工具中的`bundle`），
如果这个实在不好做，那么当生产端使用`webpack`时，放弃`tree-shake`全量打包，至少要在`webpack`端`bundle`命令起效
4. 移除无用代码
5. 提供更多的调试/监控功能

## 长期计划
1. 生产端可能会放弃虚拟入口，但这会导致`vue`文件不再能作为入口
2. 放弃css in js，尽量和正常开发等同（2.0）
3. 将消费端的inspector 换为 net-vis
4. 仅有`systemjs`/`importmap` ,更自定义的`html`输出模式
5. 更改chunkfileName，加入hash(2.0)