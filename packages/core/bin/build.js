const { defineConfig } = require('vite')
async function build() {
  const config = defineConfig({
    command: 'build',
    mode: 'production',
  })
}
module.exports = {}
