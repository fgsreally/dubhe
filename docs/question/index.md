## 

需要把下载的类型文件关联到当前的工作文件夹中，这需要创建软链接，在`windows`下这好像一定需要管理员权限，换成管理员权限`vite`即可，也可以使用`dubhe-cli`

## 关于缓存
> `vite`中不使用缓存时，性能会有点糟糕，
在缓存模式下，如果出现某种问题，可尝试使用非缓存，如果非缓存时一切正常，那么问题来自缓存，将缓存删掉重启服务即可,详见[`dubhe-cli`]()

# webpack

1. `webpack`如果使用了多线程打包，那么必须使用缓存，因为不使用缓存时，`dubhe`使用的是`webpackvirtualmodule`，这在多线程中无法起效


 `[vite] Internal server error: ENOENT: no such file or directory, open 'D:\MyProject\1\dubhe\examples\vite-sub\node_modules\.vite\deps\element-plus_es_components_button_style_css.js'`