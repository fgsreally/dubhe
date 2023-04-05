import { describe, expect, it } from 'vitest'
import { getDistFiles, getFileContent, getImportMap } from '../utils'
describe('[vite] subscribe module', () => {
  it('dist files output [cold mode]', async () => {
    const html = await getFileContent('vite-sub/dist/cold/index.html')

    expect(getImportMap(html)).toMatchSnapshot()
    const files = await getDistFiles('vite-sub/dist/cold')
    const content = await getFileContent(`vite-sub/dist/cold/${files[0]}`)
    expect(content).not.toMatch('\"dubhe-esbuildpub/App.dubhe-esbuildpub.js\"')
    expect(content).not.toMatch('\"dubhe-viteout/App.dubhe-viteout.js\"')
  })
  it('dist files output [hot mode]', async () => {
    const html = await getFileContent('vite-sub/dist/hot/index.html')

    expect(getImportMap(html)).toMatchSnapshot()
    const files = await getDistFiles('vite-sub/dist/hot')
    expect(await getFileContent('vite-sub/dist/hot/index.html')).toMatchSnapshot()
    const content = await getFileContent(`vite-sub/dist/hot/${files[0]}`)
    expect(content).toMatch('\"dubhe-esbuildpub/App.dubhe-esbuildpub.js\"')
    expect(content).toMatch('\"dubhe-viteout/App.dubhe-viteout.js\"')
  })
})
