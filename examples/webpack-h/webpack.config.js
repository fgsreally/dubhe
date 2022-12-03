const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { DefinePlugin, HotModuleReplacementPlugin } = require("webpack");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const isProd = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProd,
  entry: "./src/micro.ts", // 指定打包文件检索的入口，这个就是默认值，可以修改
  output: {
    // 指定打包产出的目录文件，这里还是指定为当前目录的dist文件夹
    // 但是文件名指定成bundle.js
    filename: "bundle.js",
    path: path.resolve(__dirname, "./dist"),
  },
  plugins: [
    new DefinePlugin({
      BASE_URL: '"./"',
    }),
    new HotModuleReplacementPlugin(),
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
  ],

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              appendTsSuffixTo: [/\.vue$/],
            },
          },
        ],
      },
      {
        test: /.vue$/i,
        use: "vue-loader",
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
      },
      // this will apply to both plain `.css` files
      // AND `<style>` blocks in `.vue` files
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"],
      },
    ],
  },

  devtool: "cheap-module-source-map",

  devServer: {
    host: "localhost", // 主机名
    port: 8081,
    open: true,
  },
};
