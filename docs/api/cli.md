## 命令行工具

1.  比较本地缓存和远程模块的版本
```shell 
 dubhe detect 
```

2.  引入对应`project/module`的源码 例如 `vite-pub/test`
```shell 
 dubhe import <project>
```

3. 删除指定项目的缓存

```shell 
 dubhe delete <project> 
```
4. 安装缓存

```shell 
 dubhe install
```

5.  构建共有依赖（在生产消费两端均完成后执行，这可以实现函数级别的treeshake，以vue为例，两端用到了多少，就打包多少）
```shell 
 dubhe  bundle <dependence>
```
6.  分析远程模块的依赖情况

```shell 
 dubhe  analyse 
```

7.  清除所有缓存

```shell 
 dubhe clear
```


8. 获得全局的缓存与类型缓存的位置 
```shell 
 dubhe root
```

9. 将类型缓存link到开发目录下
> 一般而言，以一个`vite`空白项目为例，启动服务会尝试：寻找缓存->拉取缓存->缓存的类型link到本地目录，相当于`install`->`link`,
> 如果中间出现问题导致中断，开发者可以自行使用这两个命令进行调试
```shell 
 dubhe link
```

10. 把对应目录下的构建文件(esm)，转成`systemjs`
```shell 
 dubhe transform
```

11. 获得远程项目暴露的方法
```shell 
 dubhe export <project>
```

11. 开发时的类型共享(实验性)
> 本质就是开发时，使用`watch`模式产生类型文件，然后再同步到消费端
> 我不知道是不是我电脑or配置的原因，`watch`模式在持续一段时间后一定会莫名报错，暂时无法处理，故为实验性
```shell 
 dubhe export <project>
```