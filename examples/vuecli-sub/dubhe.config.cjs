module.exports= {
    remote: {
      viteout: {
        url: "http://127.0.0.1:8080",
        mode: process.env.HOTBUILD ? 'hot' : 'cold',
      }, // remote static server
    },
    externals: (id) => {
   
      if (id === 'vue') {
        return {
          esm: './vue.js', // only work for test
        }
      }
      if (id.includes('element-plus'))
        return { esm: './element-plus.js' }
    },
    systemjs: true,
    cache: !process.env.CI,
    types: true,
    injectHtml: {
      importMap: true,
      systemjs: true,
    },
  };