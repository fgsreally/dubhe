import { expect, test } from 'vitest'
import { getDirFiles } from './utils'

test('pub files output', async () => {
  const files = await getDirFiles('pub/dist', ['**/*'])
  // remove virtual entry
  expect(files.length).toMatchSnapshot()
  expect(files).toContain('dubhe.json')
  expect(files).toContain('dubhe.zip')
})
