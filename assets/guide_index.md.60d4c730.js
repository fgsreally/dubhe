import{_ as e,o as t,c as o,a as r}from"./app.c7558d4a.js";const h=JSON.parse('{"title":"简介","description":"","frontmatter":{},"headers":[{"level":2,"title":"feature","slug":"feature","link":"#feature","children":[]}],"relativePath":"guide/index.md","lastUpdated":1690294878000}'),d={name:"guide/index.md"},s=r('<h1 id="简介" tabindex="-1">简介 <a class="header-anchor" href="#简介" aria-hidden="true">#</a></h1><p>一款极致体验的,跨打包工具的模块复用方案</p><blockquote><p>姑且可以理解为<strong>带热更新的<code>npm</code>包</strong>+<strong><code>esm</code>的模块联邦</strong></p></blockquote><h2 id="feature" tabindex="-1">feature <a class="header-anchor" href="#feature" aria-hidden="true">#</a></h2><ul><li><p><strong>跨打包器</strong> 目前支持<code>vite</code>,<code>esbuild</code>的生产端，<code>vite</code>,<code>webpack</code>的消费端，应该满足绝大部分需求了</p></li><li><p><strong>热更新</strong> 提供打包器级别的热更新，而不是简单的页面刷新，</p></li><li><p><strong>类型提示</strong> 相当于模块联邦加上了类型</p></li><li><p><strong>源码引入</strong> 当需要改造某个远程模块，可直接把对应模块拉到本地，相当于是<a href="https://bit.dev/" target="_blank" rel="noreferrer">bit</a></p></li><li><p><strong>共享依赖创建</strong> 当多个<code>cdn</code>中互相依赖，或者其中只使用了部分功能。<code>dubhe</code>总是能创建最合适的共享依赖</p></li><li><p><strong>可降级</strong> 可用于开发时共享工具库，也可用于生产时动态管理，可用<code>esm</code>,也可用<code>systemjs</code>,你可以选择，并随意转换</p></li></ul><div class="info custom-block"><p class="custom-block-title">INFO</p></div>',6),a=[s];function c(n,i,l,p,_,u){return t(),o("div",null,a)}const f=e(d,[["render",c]]);export{h as __pageData,f as default};
