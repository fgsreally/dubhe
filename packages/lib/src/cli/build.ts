import { CSS } from '../plugin'
// const { CSS } = require('dubhe-pub/vite')
export async function buildExternal(outDir: string, files: string[]) {

  const { build, defineConfig}=await import('vite')
  const config = defineConfig({
    plugins: [CSS()],
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
