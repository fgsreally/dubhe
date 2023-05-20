import { describe, expect, it } from 'vitest'
import { getDistFiles, isExist } from '../utils'
describe('[vite] publish module', () => {
  it('core files output', async () => {
    const files = await getDistFiles('vite-pub/.dubhe/core')
    // remove virtual entry
    expect(files.length).toBe(4)

    expect(isExist('vite-pub/.dubhe/core/dubheList.json')).toBeTruthy()
  })

  it('types files output', async () => {
    expect(isExist('vite-pub/.dubhe/types/types.json')).toBeTruthy()
  })

  it('source files output', async () => {
    expect(isExist('vite-pub/.dubhe/source/src')).toBeTruthy()
  })
})
