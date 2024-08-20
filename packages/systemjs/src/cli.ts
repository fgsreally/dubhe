import { resolve } from 'path'
import fg from 'fast-glob'
import fse from 'fs-extra'
import { log } from './utils'
import { handleESM } from './babel'
import { handleHTML } from './html'

const root = process.cwd()
const [from, to] = process.argv.slice(2)
async function start() {
  if (!from || !to)
    throw new Error('please use format -- dubhe-systemjs <from> <to> -- or -- ds <from> <to> --')

  const cwd = resolve(root, from)
  const entries = await fg(['**/*'], { cwd })
  const dest = resolve(root, to)
  await fse.ensureDir(dest)

  log('Handle files:')
  console.table(entries)
  await Promise.all(entries.map(async (entry) => {
    const filePath = resolve(cwd, entry)
    const destPath = resolve(root, to, entry)
    if (filePath.endsWith('.js')) {
      const source = await fse.readFile(filePath, 'utf-8')
      fse.outputFile(destPath, await handleESM(source, { filename: entry }))
    }
    else if (filePath.endsWith('.html')) {
      const source = await fse.readFile(filePath, 'utf-8')
      fse.outputFile(destPath, await handleHTML(source, entry))
    }
    else {
      fse.copyFile(filePath, destPath)
    }
  }))
  log(`Create systemjs files to "${dest}"`)
}

start()
