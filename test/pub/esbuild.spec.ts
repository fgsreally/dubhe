import { describe, expect, it } from 'vitest'
import { getDistFiles, isExist } from '../utils'
describe('[esbuild] publish module ', () => {
  it('core files output', async () => {
    const files = await getDistFiles('esbuild-pub/.dubhe/core')
    expect(files.length).toBe(1)
    expect(isExist('esbuild-pub/.dubhe/core/dubheList.json')).toBeTruthy()
  })

  it('types files output', async () => {
    expect(isExist('esbuild-pub/.dubhe/types/types.json')).toBeTruthy()
  })

  it('source files output', async () => {
    expect(isExist('esbuild-pub/.dubhe/source/src')).toBeTruthy()
  })
})
