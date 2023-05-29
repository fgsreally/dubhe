import { build, defineConfig } from 'vite'
import { CSS } from '../plugin'
// const { CSS } = require('dubhe-pub/vite')
export async function buildExternal(outDir: string, files: string[]) {
  const config = defineConfig({
    plugins: [CSS() as any],
    define: {
      'process.env': process.env,
    },
    build: {
      emptyOutDir: false,
      outDir,
      lib: {
        entry: files,
        formats: ['es'],
        fileName: (_, name) => {
          return `${name}.js`
        },
      },
    },
  })

  await build({ ...config, configFile: false })
}
