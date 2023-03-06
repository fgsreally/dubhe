const { defineConfig } = require("@vue/cli-service");
const { Sub } = require("dubhe-sub/webpack");
const { DubheResolver } = require("dubhe-sub");

const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");

const config = {
  remote: {
    viteout: {
      url: "http://127.0.0.1:8080",
      mode: "cold",
    }, // remote static server
  },
  externals: (id) => false,
  systemjs: true,
  cache: false,
  types: true,
  injectHtml: {
    importMap: true,
    systemjs: true,
  },
};

const app = new Sub(config);
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  // parallel:false,
  configureWebpack: {
    externals: {},

    output: {
    },
    devServer: {
      setupMiddlewares(m) {
        m.push(app.middleware.bind(app));
        return m;
      },
    },
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver(), DubheResolver(config)],
      }),
      Components({
        resolvers: [ElementPlusResolver(), DubheResolver(config)],
      }),
      app,
    ],
  },
});
