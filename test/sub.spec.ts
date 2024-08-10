import { expect, test } from 'vitest'
import { getDirFiles, getFileContent, getImportMap } from './utils'

test('sub files output in dynamic mode', async () => {
  const files = await getDirFiles('sub/dist/dynamic', ['**/*'])
  // remove virtual entry
  expect(files.length).toMatchSnapshot()
  expect(getImportMap(await getFileContent('sub/dist/dynamic/index.html'))).toMatchSnapshot()
})

test('sub files output in static mode', async () => {
  const files = await getDirFiles('sub/dist/static', ['**/*'])
  // remove virtual entry
  expect(files.length).toMatchSnapshot()
  expect(getImportMap(await getFileContent('sub/dist/static/index.html'))).toMatchSnapshot()
})
