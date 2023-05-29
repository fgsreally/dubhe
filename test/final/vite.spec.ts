import { describe, expect, it } from 'vitest'
import { getDistFiles, getFileContent, getImportMap } from '../utils'
describe('[vite] final', () => {
  it('dist files output [cold mode]', async () => {
    const html = await getFileContent('vite-final/dist/cold/index.html')
    expect(getImportMap(html)).toMatchSnapshot()

    const files = await getDistFiles('vite-final/dist/cold', ['assets/*.js'])
    const content = await getFileContent(`vite-final/dist/cold/${files[0]}`)
    expect(content).not.toMatch('\"dubhe-vitesub/app\"')
  })
  it('dist files output [hot mode]', async () => {
    const html = await getFileContent('vite-final/dist/hot/index.html')
    expect(getImportMap(html)).toMatchSnapshot()
    const files = await getDistFiles('vite-final/dist/hot', ['assets/*.js'])
    const content = await getFileContent(`vite-final/dist/hot/${files[0]}`)
    expect(content).toMatch('\"dubhe-vitesub/app\"')
  })
})
