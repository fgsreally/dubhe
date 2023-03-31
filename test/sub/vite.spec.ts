import { describe, expect, it } from 'vitest'
import { getDistFiles, getFileContent } from '../utils'
describe('[vite] subscribe module', () => {
  it('dist files output [cold mode]', async () => {
    const files = await getDistFiles('vite-sub/dist/cold')
    expect(files.length).toMatchSnapshot()
    expect(await getFileContent('vite-sub/dist/cold/index.html')).toMatchSnapshot()
  })
  it('dist files output [hot mode]', async () => {
    const files = await getDistFiles('vite-sub/dist/hot')
    expect(files.length).toMatchSnapshot()
    expect(await getFileContent('vite-sub/dist/hot/index.html')).toMatchSnapshot()

    for (const p of files)
      expect(await getFileContent(`vite-sub/dist/hot/${p}`)).toMatchSnapshot()
  })
})
