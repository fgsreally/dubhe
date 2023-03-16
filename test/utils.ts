import fs from 'fs'
import { resolve } from 'path'
import fg from 'fast-glob'

export async function getFileContent(p: string) {
  return fs.promises.readFile(resolve(process.cwd(), 'examples', p), 'utf-8')
}
export async function getDistFiles(p: string) {
  return fg(['index.html', '*.js'], { cwd: resolve(process.cwd(), 'examples', p) })
}

export function isExist(p: string) {
  return fs.existsSync(resolve(process.cwd(), 'examples', p))
}
