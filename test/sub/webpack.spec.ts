import { describe, expect, it } from 'vitest'
import { getDistFiles, getFileContent } from '../utils'
describe('[webpack] subscribe module', () => {
  it('dist files output [cold mode]', async () => {
    const files = await getDistFiles('webpack-sub/dist-cold')
    expect(files.length).toMatchSnapshot()
    expect(await getFileContent('webpack-sub/dist-cold/index.html')).toMatchSnapshot()
  })
  it('dist files output [hot mode]', async () => {
    const files = await getDistFiles('webpack-sub/dist-hot')
    expect(files.length).toMatchSnapshot()
    for (const p of files)
      expect(await getFileContent(`webpack-sub/dist-hot/${p}`)).toMatchSnapshot()
  })
})
