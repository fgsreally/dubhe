/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check
const { esmsh } = require('dubhe')
/** @type {import('dubhe').remoteConfig} */
module.exports = {
  entry: 'src/dubhe.ts',
  types: true,
  limit: 1000,
  externals: esmsh(['vue', 'plugin-vue:export-helper']),
  HMR: {
    projectName: 'app',
    homePort: 'http://localhost:4100',
  },
  vendor: ['\0plugin-vue:export-helper'],
  source: true,
  cssSplit: true,
  importMap: true,
}

