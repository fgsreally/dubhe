import { resolve } from 'path'
import { build, defineConfig } from 'vite'
import { CSS } from 'dubhe-lib'
// const { CSS } = require('dubhe-pub/vite')
const root = process.cwd()

export async function buildExternal(dep: string, outDir: string) {
  const config = defineConfig({
    plugins: [CSS() as any],

    build: {
      outDir,
      emptyOutDir: false,
      lib: {
        entry: resolve(root, 'dubhe.dep.js'),
        name: dep,
        formats: ['es'],
        fileName: () => {
          return `${dep}.js`
        },
      },
    },
  })

  await build({ ...config, configFile: false })
}
