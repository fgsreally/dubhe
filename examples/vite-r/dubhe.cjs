/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check
const { esmsh } = require('dubhe')
/** @type {import('dubhe').remoteConfig} */
module.exports = {
  entry: 'src/dubhe.ts',
  types: true,
  externals: esmsh(['vue']),
  HMR: {
    projectName: 'app',
    homePort: 'http://localhost:4100',
  },
  source: true,
  cssSplit: true,
  importMap: true,
}

