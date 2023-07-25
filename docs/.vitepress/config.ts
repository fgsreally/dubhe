import { defineConfig } from 'vitepress'
const ogDescription = '极致体验的模块共用方案'

const base = process.env.NODE_ENV === 'production' ? '/dubhe/' : ''

export default defineConfig({
  title: '天枢',
  description: ogDescription,
  base,
  head: [
    ['link', { rel: 'icon', href: `${base}favicon.ico` }],

  ],

  // vue: {

  lastUpdated: true,
  themeConfig: {
    logo: '/dubhe.png',
    editLink: {
      pattern: 'https://github.com/fgsreally/dubhe/tree/master/docs/:path',
      text: '编辑本页',
    },
    lastUpdatedText: '最近更新时间',
    socialLinks: [{ icon: 'github', link: 'https://github.com/fgsreally/dubhe' }],

    footer: {
      message: 'Released the MIT License.',
    },

    nav: [
      { text: '指南', link: '/guide/', activeMatch: '/guide/' },
      {
        text: 'API',
        link: '/api/cli.md',
        activeMatch: '/api/',
      },
      { text: '常见问题', link: '/question/', activeMatch: '/question/' },

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
              text: '用前须知',
              link: '/guide/must-known',
            },
            {
              text: '快速上手',
              link: '/guide/quick-start',
            },
          ],
        },

        {
          text: '基础',
          collapsible: true,
          items: [

            {
              text: '原理',
              link: '/base/core',
            },
            {
              text: '自动引入',
              link: '/guide/auto-import',
            },

          ],
        },

        {
          text: '高级',
          collapsible: false,
          items: [
            {
              text: '嵌套使用',
              link: '/advance/nest',
            },
            {
              text: 'vite独有',
              link: '/advance/vite',
            },
            {
              text: '垫片兼容',
              link: '/advance/polyfill',
            },
            {
              text: '模块共用',
              link: '/advance/share',
            },
            {
              text: '应用分发',
              link: '/advance/dynamic',
            },
          ],
        },
        {
          text: '一点想法',
          collapsible: false,
          items: [
            {
              text: '为什么不使用模块联邦',
              link: '/why/federation',
            },
            {
              text: '什么是微模块',
              link: '/why/micro',
            },

          ],
        },
      ],
      '/api/': [
        {
          text: 'api',
          collapsible: true,
          items: [
            {
              text: '命令行工具',
              link: '/api/cli',
            },

            {
              text: '生产端',
              link: '/api/pub',
            },

            {
              text: '消费端',
              link: '/api/sub',
            },
          ],
        },

      ],
      '/question': [],

    },
  },
})
