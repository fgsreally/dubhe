const { defineConfig } = require("@vue/cli-service");
const { Sub } = require("dubhe-sub/webpack");
const { DubheResolver } = require("dubhe-sub");
const path = require("path");
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");
const config=require('./dubhe.config.cjs')


const app = new Sub(config);
module.exports = defineConfig({
  parallel:!process.env.CI,
  transpileDependencies: true,
  outputDir: process.env.HOTBUILD ? "dist/hot" : "dist/cold",
  lintOnSave: false,
  // parallel:false,
  configureWebpack: {
    externals: {},
    experiments: {
      outputModule: true,
    },
    externalsType: "module",

    output: {
      library: { type: "module" },
      environment: { module: true },
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
