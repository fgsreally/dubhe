import { describe, expect, it } from 'vitest'
import { getDistFiles, getFileContent, isExist } from '../utils'
describe('[vite] publish module', () => {
  it('core files output', async () => {
    const files = await getDistFiles('vite-pub/.dubhe/core')
    expect(files.length).toBe(5)

    const dubheList = JSON.parse(await getFileContent('vite-pub/.dubhe/core/dubheList.json'))
    delete dubheList.timestamp
    expect(dubheList).toMatchSnapshot()
  })

  it('types files output', async () => {
    expect(isExist('vite-pub/.dubhe/types/types.json')).toBeTruthy()
  })

  it('source files output', async () => {
    expect(isExist('vite-pub/.dubhe/source/src')).toBeTruthy()
  })
})
