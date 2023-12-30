import type { Options } from 'tsup'
import pkg from './package.json'
export const tsup: Options = {
  entry: ['src/index.ts', 'src/client.ts', 'src/vite.ts', 'src/webpack.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  clean: true,
  shims: false,
  external: Object.keys(pkg.devDependencies)
}
