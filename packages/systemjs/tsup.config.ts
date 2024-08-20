import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['src/index.ts', 'src/cli.ts'], // 'src/cli/index.ts'
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  clean: true,
  shims: false,
}
