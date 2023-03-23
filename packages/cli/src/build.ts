import { resolve } from 'path'
import { build, defineConfig } from 'vite'
import { CSS } from 'dubhe-lib'
// const { CSS } = require('dubhe-pub/vite')
const root = process.cwd()
export async function buildExternal(outDir: string, count: number) {
  const entry: string[] = []
  for (let i = 1; i < count + 1; i++)
    entry.push(resolve(root, 'dubhe-bundle', `dubhe.dep${i}.js`))
  const config = defineConfig({
    plugins: [CSS() as any],

    build: {
      emptyOutDir: false,

      lib: {
        entry,
        formats: ['es'],
        fileName: (_, name) => {
          return `${name}.js`
        },
      },
    },
  })

  await build({ ...config, configFile: false })
}
