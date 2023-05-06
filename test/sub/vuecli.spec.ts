import { describe, expect, it } from 'vitest'
import { getDistFiles, getFileContent, getImportMap } from '../utils'
describe('[vuecli] subscribe module', () => {
  it('dist files output [cold mode]', async () => {
    const files = await getDistFiles('vuecli-sub/dist/cold')
    const html = await getFileContent('vuecli-sub/dist/cold/index.html')

    expect(getImportMap(html)).toMatchSnapshot()
    const content = await getFileContent(`vuecli-sub/dist/cold/${files[0]}`)
    expect(content).not.toMatch('dubhe-viteout/app')
  })
  it('dist files output [hot mode]', async () => {
    const html = await getFileContent('vuecli-sub/dist/hot/index.html')
    expect(Object.keys(getImportMap(html).imports).length).toBe(6)
    const files = await getDistFiles('vuecli-sub/dist/hot')
    const content = await getFileContent(`vuecli-sub/dist/hot/${files[0]}`)
    expect(content).toMatch('dubhe-viteout/app')
  })
})
