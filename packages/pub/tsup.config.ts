import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['src/index.ts', 'src/vite.ts', 'src/esbuild.ts', 'src/webpack.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  clean: true,
  shims: false,
  external:['vite','esbuild','esbuild-plugin-merge'],
  sourcemap: true,
}
