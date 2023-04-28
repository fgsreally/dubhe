module.exports = ({
  remote: {
    viteout: {
      url: 'http://127.0.0.1:8080',
      mode: process.env.HOTBUILD ? 'hot' : 'cold',
    }, // remote static server
  },
  externals: id => false,
  systemjs: true,
  cache: true,
  types: true,
  polyfill: {
    importMap: true,
    systemjs: true,
  },
})
