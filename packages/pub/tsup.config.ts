import type { Options } from 'tsup'
import pkg from './package.json'
export const tsup: Options = {
  entry: ['src/index.ts', 'src/vite.ts', 'src/esbuild.ts', 'src/webpack.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  clean: true,
  shims: false,
  sourcemap: true,
  external:Object.keys(pkg.devDependencies)
}
