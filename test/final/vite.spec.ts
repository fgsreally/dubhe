import { describe, expect, it } from 'vitest'
import { getDistFiles, getFileContent, getImportMap } from '../utils'
describe('[vite] final', () => {
  it('dist files output [cold mode]', async () => {
    const html = await getFileContent('vite-final/dist/index.html')
    expect(getImportMap(html)).toMatchSnapshot()

    const files = await getDistFiles('vite-final/dist', ['index'])
    const content = await getFileContent(`vite-final/dist/${files[0]}`)
    // expect(content).not.toMatch('\"dubhe-esbuildpub/app\"')
    expect(content).not.toMatch('\"dubhe-vitesub/app\"')
  })
})
