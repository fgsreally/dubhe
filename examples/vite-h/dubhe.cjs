/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check

const { vExtension } = require('dubhe')

/** @type {import('dubhe').homeConfig} */
module.exports = {
  // when remote is bundled
  remote: {
    app: 'http://127.0.0.1:8080', // remote static server
  },
  mode: 'hot',
  cache: true,
  importMap: true,
  types: true,
  info: false,
  extensions: [vExtension],
}
