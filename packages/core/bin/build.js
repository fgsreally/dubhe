const { resolve } = require('path')
const { defineConfig, build } = require('vite')

const root = process.cwd()
async function buildExternal(project, outDir) {
  const config = defineConfig({
    build: {
      outDir,
      lib: {
        entry: resolve(root, 'dubhe.dep.js'),
        name: project,
        formats: ['es'],
        fileName: () => {
          return `${project}.js`
        },
      },
    },
  })

  await build({ ...config, configFile: false })
}
module.exports = { buildExternal }
