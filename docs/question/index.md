## 关于类型
当
1. 配置中`types`这一项为true运行时，
2. 直接用`cli`进行`dubhe link`时

出现错误：`[dubhe]:fail to create symlink`，这是因为`dubhe`会下载类型文件并缓存在本地，但此时并不会在工作目录下，需要通过创建软链接的方式把下载的类型文件关联到当前的工作文件夹中，在`windows`下一定需要管理员权限，换成管理员权限运行即可，只需要第一次这样，后续启动时发现工作目录下已有内存，就直接跳过

此时在根目录下会创建`tsconfig.dubhe.json`，请将其与`tsconfig`关联

> 我也认为这很麻烦，但没有找到更好的方法，`pnpm`创建软链接似乎不需要管理员权限，不太清楚是怎么做到的,`chatgpt`也不肯告诉我。

## 关于缓存
 `vite`中不使用缓存时，性能会有点糟糕。在缓存模式下，如果出现某种问题，可尝试使用非缓存，如果非缓存时一切正常，那么问题来自缓存，将缓存删掉重启服务即可,详见[`命令行操作`](../api/cli.md)


## esbuild
1. 由于`esbuild`没有`transform hook`,暂时只能使用`esbuild-plugin-merge`模拟，但`esbuild`的`watch`模式在`0.17`的版本大改，所以`dubhe`暂时只能在`0.17`以前的版本起效，详见[example](https://github.com/fgsreally/dubhe/tree/main/examples/esbuild-pub)
2. `esbuild`暂时没有消费端能力，原因与前一个有关，做出来也是要用这种不太好的方式，暂时需要观察一下

## webpack
1. `webpack`不会添加生产端能力，这是架构问题，没有办法。但可以使用`vite`/`esbuild`对`webpack`项目进行生产端操作，毕竟都是`import`的模块写法
2. `webpack`如果使用了多进程打包，那么必须使用缓存，因为不使用缓存时，`dubhe`使用的是`webpack-virtual-module`，这在多进程中无法起效


## vite

1. 如果生产端和消费端都是`vite`，并都使用开发模式，有类似错误：`[vite] Internal server error: ENOENT: no such file or directory, open xxx`
这是因为`vite`依赖预构建尚未完成，`dubhe`找不到依赖，稍等片刻`vite`会自动重试并成功运行


> 我曾在某版本尝试使用`importmap`来解决这个问题，使`vite`不解析共有依赖，直接通过`importmap`获取，从而跳过`devserver`的报错，但`vite`实在尽职尽责，面对依赖必解析，我试了各种各样的方法尝试绕过，最后搞得灰头土脸，
> 对此我不予置评

2. 如果生产消费端都是`vite`，并都使用开发模式，热更新出现内存溢出，这是因为`vite`的热更新逻辑是相对于根路径的，比如项目路径为`D:\dubhe`，热更新的路径为`D:\dubhe\src\App.vue`,那么`vite`认为存在热更新的路径即`src/App.vue`，当生产消费两端，有同相对路径的文件，就出现问题，比如，双端都有`src/App.vue`文件，那么热更新时，就会反复触发`vue`对应的热更新逻辑知道内存溢出。解决：要么两边不能有相同路径，要么给个`base`

3. 当生产端是`vite`,base默认为`/_dubhe/`,如果要添加`base`，请添加一个特定字符串。由于vite 没有publicpath ，暂时采用社区插件vite-plugin-dynamic-base，故base不能为空，从而使得消费端能够正确处理`assets`，比如图片等，

## 动态控制


## hash
生产端产出的文件格式是`[文件名]-dubhe[项目名].js`，这是不能更改的，我很希望能在其中加入`hash`/可以自定义`chunkfilename`,但现在不行，这会导致热更新产生问题，如果要解决这个，改动会比较大。这意味着生产端的产出不能使用强缓存，否则热模式下，永远读到是旧有模块