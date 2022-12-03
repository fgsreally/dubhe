const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const { DefinePlugin, HotModuleReplacementPlugin } = require('webpack')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
// const { Dts } = require('dubhe/webpack')

class test {
  apply(compiler) {
    compiler.hooks.afterCompile.tap('test', (compilation) => {
    })
  }
}
module.exports = {
  experiments: { outputModule: true },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  mode: process.env.NODE_ENV,
  entry: './src/dubhe.ts', // 指定打包文件检索的入口，这个就是默认值，可以修改
  output: {
    // 指定打包产出的目录文件，这里还是指定为当前目录的dist文件夹
    // 但是文件名指定成bundle.js
    filename: '[name].bundle.js',
    module: true,
    libraryTarget: 'module',
    path: path.resolve(__dirname, './dist'),
  },

  plugins: [
    new DefinePlugin({
      BASE_URL: '"./"',
    }),
    new HotModuleReplacementPlugin(),
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),

    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
    new test(),
  ],

  module: {
    rules: [

      {
        test: /.vue$/i,
        use: 'vue-loader',
      },

      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                noEmit: false,
              },

              appendTsSuffixTo: [/\.vue$/],
            },
          },
        ],
      },
    ],
  },

  devtool: 'cheap-module-source-map',

  devServer: {
    host: 'localhost', // 主机名
    port: 8081,
    open: true,
  },
}
