module.exports = ({
  remote: {
    viteout: {
      url: 'http://127.0.0.1:8080',
      mode: 'hot',
    }, // remote static server
  }, 
  externals: id => false,
  systemjs: true,
  cache: true,
  types: true,
  injectHtml: {
    importMap: true,
    systemjs: true,
  },
})
