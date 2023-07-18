import { defineConfig } from 'vitepress'
const ogDescription = '基于编译，剑走偏锋的微前端方案'
// const ogImage = 'https://wujie-micro.github.io/doc/wujie.png'
// const ogTitle = '无界'
// const ogUrl = 'https://wujie-micro.github.io/doc/'
const base = process.env.NODE_ENV === 'production' ? '/doc/' : ''

export default defineConfig({
  title: '天枢',
  description: ogDescription,
  base,
  head: [
    ['link', { rel: 'icon', href: `${base}/favicon.ico` }],
    // ["meta", { property: "og:type", content: "website" }],
    // ["meta", { property: "og:title", content: ogTitle }],
    // ["meta", { property: "og:image", content: ogImage }],
    // ["meta", { property: "og:url", content: ogUrl }],
  ],

  vue: {
    reactivityTransform: true,
  },
  lastUpdated: true,
  themeConfig: {
    logo: '/wujie.svg',
    editLink: {
      pattern: 'https://github.com/Tencent/wujie/tree/master/docs/:path',
      text: '编辑本页',
    },
    lastUpdatedText: '最近更新时间',
    socialLinks: [{ icon: 'github', link: 'https://github.com/Tencent/wujie' }],
    // algolia: {
    //   appId: "",
    //   apiKey: "",
    //   indexName: "wujie",
    //   searchParameters: {
    //     facetFilters: ["tags:en"],
    //   },
    // },

    footer: {
      message: 'Released the MIT License.',
    },

    nav: [
      { text: '指南', link: '/guide/', activeMatch: '/guide/' },
      {
        text: 'API',
        link: '/api/main',
        activeMatch: '/api/',
      },
      { text: '常见问题', link: '/question/', activeMatch: '/question/' },
      { text: '框架封装', link: '/pack/', activeMatch: '/pack/' },
    //   {
    //     text: `v${version}`,
    //     items: [
    //       {
    //         text: '更新日志',
    //         link: 'https://github.com/Tencent/wujie/blob/master/CHANGELOG.md',
    //       },
    //     ],
    //   },
    //   {
    //     text: '示例',
    //     items: [
    //       {
    //         text: 'Vue主应用',
    //         link: 'https://wujie-micro.github.io/demo-main-vue/home',
    //       },
    //       {
    //         text: 'React主应用',
    //         link: 'https://wujie-micro.github.io/demo-main-react/',
    //       },
    //     ],
    //   },
    //   { text: '在线体验无界', link: '/wujie/', activeMatch: '/wujie/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门',
          collapsible: true,
          items: [
            {
              text: '介绍',
              link: '/guide/',
            },
            {
              text: '快速上手',
              link: '/guide/quickstart',
            },
            {
              text: '默认配置',
              link: '/guide/default',
            },
            // {
            //   text: "定制Demo",
            //   link: "/guide/demo",
            // },
          ],
        },

        {
          text: '基础',
          collapsible: true,
          items: [
            // {
            //   text: '主应用',
            //   link: '/guide/main',
            // },
            // {
            //   text: '子应用',
            //   link: '/guide/sub',
            // },
            {
              text: '原理',
              link: '/base/core',
            },
            {
              text: '自动引入',
              link: '/base/auto-import',
            },
            {
              text: '垫片',
              link: '/guide/vue',
            },

            {
              text: '用前须知',
              link: '/base/mustknown',
            },

          ],
        },
        {
          text: '设计思路',
          collapsible: true,
          items: [
            {
              text: '难点',
              link: '/guide/idea/question',
            },
            {
              text: '核心设计',
              link: '/guide/idea/core',
            },
            {
              text: '对比',
              link: '/guide/idea/compare',
            },
            {
              text: '歧义性行为',
              link: '/guide/idea/action',
            },
          ],
        },
        {
          text: '改造',
          collapsible: false,
          items: [
            {
              text: '改造须知',
              link: '/guide/reform/index',
            },
            {
              text: '沙箱改造',
              link: '/guide/reform/proxy',
            },
          ],
        },
      ],
      '/api/': [
        {
          text: '主应用',
          collapsible: true,
          items: [
            {
              text: 'Merak',
              link: '/api/main',
            },

            {
              text: '生命周期',
              link: '/api/lifecycle',
            },

            {
              text: 'vue',
              link: '/api/vue',
            },
          ],
        },
        {
          text: '子应用',
          collapsible: true,
          items: [
            {
              text: 'helper',
              link: '/api/helper',
            },
            {
              text: 'vite',
              link: '/api/vite',
            },
            {
              text: 'webpack',
              link: '/api/webpack',
            },

          ],
        },
      ],
      '/question': [],
      '/pack/': [
        {
          text: '框架封装',
          collapsible: true,
          items: [
            {
              text: 'Vue组件封装',
              link: '/pack/',
            },
            {
              text: 'React组件封装',
              link: '/pack/react',
            },
          ],
        },
      ],
    },
  },
})
