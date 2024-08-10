import fs from 'fs'
import { resolve } from 'path'
import fg from 'fast-glob'

export async function getFileContent(p: string) {
  return fs.promises.readFile(resolve(process.cwd(), 'examples', p), 'utf-8')
}
export async function getDirFiles(p: string, files = ['**/*.js', '!/**/*.js.map']) {
  return fg(files, { cwd: resolve(process.cwd(), 'examples', p) })
}

export function getImportMap(html: string) {
  const ret = html.match(/<script type="importmap">([^\<]*)<\/script>/)!
  if (ret)
    return Object.keys(JSON.parse(ret[1]).imports)

  else return false
}
