## 动态控制

由于模块联邦的一些问题，项目间依赖复用反而不是一个主流的用法了，一个另辟蹊径的做法是：生产端只负责依赖生产，分发依赖，本身不再是一个独立运行的项目，更像是个组件库，从而消费端实现及时更新 or 回滚。

> 有些团队管这个叫应用分发，本质上就是：消费端需要在某个地方获得生产端的信息，如版本号等

`dubhe`只是一个底层的工具，这种上层的应用需要开发者自行设计，同样，`dubhe`也没有带来任何的约束，开发者可以自由设计应用分发的具体手法

我会给出以下两个案例，希望是有效的

### ssr

在服务端，就将生产端的信息打入`html`

```ts
// 在消费端打包时
export default {
  injectHtml: false,
}
```

```ts
// 在服务端
const meta // 生产端信息
const html // html
html.replace(
  '</title>',
  `<script type="importmap">{"imports":${JSON.stringify(
    meta
  )}}</script></title>`
)
```

只需要控制`meta`，就可以实现版本回滚等功能

## spa

同上

```ts
// 在消费端打包时
export default {
  injectHtml: false,
}
```

在`html`中加上一段

```html
<script>
  var request = new XMLHttpRequest();
  request.open("GET", url, false);//获得meta
  request.send(null);
  const im = document.createElement('script');
  im.type = 'importmap';
  im.textContent = JSON.stringify(request.responseText);
  document.currentScript.after(im);
</script>
```

> 请注意，这种用法至少需要一个应用分发中心及管理系统，且需要考虑错误处理等，务必考虑团队压力，
