import { resolve } from 'path'
import { parse } from 'es-module-lexer'
import MagicString from 'magic-string'
import fse from 'fs-extra'
export function copySourceFile(p: string, outdir: string) {
  if (fse.existsSync(resolve(process.cwd(), p)))
    fse.copy(p, resolve(process.cwd(), outdir, 'source', p))
}

export function isSourceFile(fp: string) {
  return fse.existsSync(fp) && !fp.includes('node_modules')
}

// work for vite/rollup
export async function createEntryFile(entryFiles: Record<string, string>) {
  return await fse.outputFile(resolve(process.cwd(), 'dubhe.ts'), Object.entries(entryFiles).reduce((p, c) => {
    return `${p}export const ${c[0]}= () => import('${c[1]}')\n`
  }, ''))
}

export function replaceEntryFile(code: string, source: string) {
  // work for vite^3
  const [i1] = parse(source, 'optional-sourcename')
  const [i2] = parse(code, 'optional-sourcename')
  const newSource = new MagicString(source)

  i1.forEach((item, i) => {
    newSource.overwrite(item.s, item.e, `"${i2[i].n}"`)
  })
  return newSource.toString()
}
