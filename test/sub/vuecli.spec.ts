import { describe, expect, it } from 'vitest'
import { getDistFiles, getFileContent } from '../utils'
describe('[vuecli] subscribe module', () => {
  it('dist files output [cold mode]', async () => {
    const files = await getDistFiles('vuecli-sub/dist/cold')
    expect(files.length).toMatchSnapshot()
    expect(await getFileContent('vuecli-sub/dist/cold/index.html')).toMatchSnapshot()
  })
  it('dist files output [hot mode]', async () => {
    const files = await getDistFiles('vuecli-sub/dist/hot')
    expect(files.length).toMatchSnapshot()
    for (const p of files)
      expect(await getFileContent(`vuecli-sub/dist/hot/${p}`)).toMatchSnapshot()
  })
})
