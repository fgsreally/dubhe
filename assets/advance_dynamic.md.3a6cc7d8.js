import{_ as s,o as a,c as n,a as l}from"./app.c7558d4a.js";const A=JSON.parse('{"title":"应用分发","description":"","frontmatter":{},"headers":[{"level":2,"title":"ssr","slug":"ssr","link":"#ssr","children":[]},{"level":2,"title":"spa","slug":"spa","link":"#spa","children":[]}],"relativePath":"advance/dynamic.md","lastUpdated":1690294878000}'),p={name:"advance/dynamic.md"},o=l(`<h1 id="应用分发" tabindex="-1">应用分发 <a class="header-anchor" href="#应用分发" aria-hidden="true">#</a></h1><p>由于模块联邦的一些问题，项目间依赖复用反而不是一个主流的用法了，一个另辟蹊径的做法是：生产端只负责依赖生产，分发依赖，本身不再是一个独立运行的项目，更像是个组件库，从而消费端实现及时更新 or 回滚。</p><blockquote><p>有些团队管这个叫应用分发，本质上就是：消费端需要在某个地方获得生产端的信息，如版本号等</p></blockquote><p><code>dubhe</code>只是一个底层的工具，这种上层的应用需要开发者自行设计，同样，<code>dubhe</code>也没有带来任何的约束，开发者可以自由设计应用分发的具体手法</p><p>我会给出以下两个案例，希望是有效的</p><h2 id="ssr" tabindex="-1">ssr <a class="header-anchor" href="#ssr" aria-hidden="true">#</a></h2><p>在服务端，就将生产端的信息打入<code>html</code></p><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-theme-palenight" tabindex="0"><code><span class="line"><span style="color:#676E95;font-style:italic;">// 在消费端打包时</span></span>
<span class="line"><span style="color:#89DDFF;font-style:italic;">export</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;font-style:italic;">default</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">injectHtml</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FF9CAC;">false</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;font-style:italic;">// 不再注入importmap的信息，由后续操作添加</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-theme-palenight" tabindex="0"><code><span class="line"><span style="color:#676E95;font-style:italic;">// 在服务端</span></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> meta </span><span style="color:#676E95;font-style:italic;">// 生产端信息</span></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> html </span><span style="color:#676E95;font-style:italic;">// html</span></span>
<span class="line"><span style="color:#A6ACCD;">html</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">replace</span><span style="color:#A6ACCD;">(</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">&lt;/title&gt;</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">&lt;script type=&quot;importmap&quot;&gt;{&quot;imports&quot;:</span><span style="color:#89DDFF;">\${</span><span style="color:#A6ACCD;">JSON</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">stringify</span><span style="color:#A6ACCD;">(</span></span>
<span class="line"><span style="color:#A6ACCD;">    meta</span></span>
<span class="line"><span style="color:#A6ACCD;">  )</span><span style="color:#89DDFF;">}</span><span style="color:#C3E88D;">}&lt;/script&gt;&lt;/title&gt;</span><span style="color:#89DDFF;">\`</span></span>
<span class="line"><span style="color:#A6ACCD;">)</span></span>
<span class="line"></span></code></pre></div><p>只需要控制<code>meta</code>，就可以实现版本回滚等功能</p><h2 id="spa" tabindex="-1">spa <a class="header-anchor" href="#spa" aria-hidden="true">#</a></h2><p>同上</p><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-theme-palenight" tabindex="0"><code><span class="line"><span style="color:#676E95;font-style:italic;">// 在消费端打包时</span></span>
<span class="line"><span style="color:#89DDFF;font-style:italic;">export</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;font-style:italic;">default</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">injectHtml</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FF9CAC;">false</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><p>在<code>html</code>中加上一段</p><div class="language-html"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki material-theme-palenight" tabindex="0"><code><span class="line"><span style="color:#89DDFF;">&lt;</span><span style="color:#F07178;">script</span><span style="color:#89DDFF;">&gt;</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 动态添加importmap</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#C792EA;">var</span><span style="color:#A6ACCD;"> request </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">new</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">XMLHttpRequest</span><span style="color:#A6ACCD;">()</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">  request</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">open</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">GET</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> url</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#FF9CAC;">false</span><span style="color:#A6ACCD;">)</span><span style="color:#89DDFF;">;</span><span style="color:#676E95;font-style:italic;">//获得meta</span></span>
<span class="line"><span style="color:#A6ACCD;">  request</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">send</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">null</span><span style="color:#A6ACCD;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> im </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> document</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">createElement</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">script</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">  im</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">type </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">importmap</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">  im</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">textContent </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> JSON</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">stringify</span><span style="color:#A6ACCD;">(request</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">responseText)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">  document</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">currentScript</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">after</span><span style="color:#A6ACCD;">(im)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">&lt;/</span><span style="color:#F07178;">script</span><span style="color:#89DDFF;">&gt;</span></span>
<span class="line"></span></code></pre></div><blockquote><p>请注意，这种用法至少需要一个应用分发中心及管理系统，且需要考虑错误处理等，务必考虑团队压力，</p></blockquote>`,16),e=[o];function t(c,r,D,y,i,F){return a(),n("div",null,e)}const d=s(p,[["render",t]]);export{A as __pageData,d as default};
