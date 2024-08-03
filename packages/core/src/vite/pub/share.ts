import { join, relative } from 'path'
import fs from 'fs'
import JSZip from 'jszip'
import { log } from '../../utils'
import type { PubOptions } from './types'

export function zipDubheDir(dir: string, pkgJson: object) {
  const zip = new JSZip()
  function traverseDirectory(directoryPath: string) {
    const files = fs.readdirSync(directoryPath)
    files.forEach((file) => {
      const fullPath = join(directoryPath, file)
      const relativePath = relative(dir, fullPath)
      if (fs.lstatSync(fullPath).isDirectory())
        traverseDirectory(fullPath)
      else
        zip.file(relativePath, fs.readFileSync(fullPath))
    })
  }
  traverseDirectory(dir)

  zip.file('package.json', JSON.stringify(pkgJson))
  return zip.generateAsync({ type: 'uint8array' })
}

export function createDubhePkgJson({ dir, entries, name }: PubOptions) {
  const pkgJson = {
    type: 'module',
    exports: {} as Record<string, {
      types: string
    }>,
    name: `@dubhe/${name}`,
  }
  for (const key in entries) {
    if (fs.existsSync(join(dir, `${key}.d.ts`)))
      exports[`./${key}`] = { types: `./${key}.d.ts` }

    else
      log(`can't find entry "${key}" declartion file`, 'yellow')
  }
  return pkgJson
}
