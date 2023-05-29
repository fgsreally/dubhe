import { describe, expect, it } from 'vitest'
import { getFileContent, getImportMap } from '../utils'
describe('[vite] subscribe module', () => {
  it('dist files output [cold mode]', async () => {
    const html = await getFileContent('vite-sub/dist/cold/core/index.html')
    expect(getImportMap(html)).toMatchSnapshot()
  })
  it('dist files output [hot mode]', async () => {
    const html = await getFileContent('vite-sub/dist/hot/core/index.html')
    expect(Object.keys(getImportMap(html).imports).length).toBe(6)
  })
})
