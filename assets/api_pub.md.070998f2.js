import{_ as s,o as n,c as a,a as l}from"./app.c7558d4a.js";const A=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[{"level":3,"title":"生产端配置","slug":"生产端配置","link":"#生产端配置","children":[]}],"relativePath":"api/pub.md","lastUpdated":1692794988000}'),p={name:"api/pub.md"},o=l(`<h3 id="生产端配置" tabindex="-1">生产端配置 <a class="header-anchor" href="#生产端配置" aria-hidden="true">#</a></h3><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-theme-palenight" tabindex="0"><code><span class="line"><span style="color:#C792EA;">interface</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">PubConfig</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 入口文件</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 默认：src/dubhe.ts</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">entry</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">string</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 是否输出对应源码</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 默认不输出</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">source</span><span style="color:#89DDFF;">?:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">boolean</span><span style="color:#676E95;font-style:italic;">// 是否输出源码</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 输出文件夹</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 默认：.dubhe</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">outDir</span><span style="color:#89DDFF;">?:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">string</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 共用依赖（cdn形式）</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 默认为{}</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">externals</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;"> [</span><span style="color:#A6ACCD;font-style:italic;">key</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">string</span><span style="color:#A6ACCD;">]</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">string</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 版本，用于消费端判断缓存是否命中</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 默认为0.0.0</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">version</span><span style="color:#89DDFF;">?:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">string</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 项目名称</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">project</span><span style="color:#89DDFF;">?:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">string</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 是否输出类型</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 默认不输出</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">types</span><span style="color:#89DDFF;">?:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">boolean</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 联调热更新，只用于watch 模式</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">HMR</span><span style="color:#89DDFF;">?:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;font-style:italic;">// 在消费端中项目的名称</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">projectName</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">string</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;font-style:italic;">// 消费端vite服务的url</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">homePort</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">string</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 类型的相关配置</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">dts</span><span style="color:#89DDFF;">?:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">dtsPluginOptions</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;font-style:italic;">// 元数据，根据自己需求填</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">meta</span><span style="color:#89DDFF;">?:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">any</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"></span></code></pre></div>`,2),e=[o];function t(c,r,y,i,F,D){return n(),a("div",null,e)}const d=s(p,[["render",t]]);export{A as __pageData,d as default};
