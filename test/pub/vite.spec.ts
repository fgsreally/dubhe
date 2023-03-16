import { describe, expect, it } from 'vitest'
import { getDistFiles, getFileContent, isExist } from '../utils'
describe('[vite] publish module', () => {
  it('core files output', async () => {
    const files = await getDistFiles('vite-pub/.dubhe/core')
    expect(files.length).toBe(9)

    const remoteList = JSON.parse(await getFileContent('vite-pub/.dubhe/core/remoteList.json'))
    delete remoteList.time
    expect(remoteList).toMatchSnapshot()
    expect(await getFileContent('vite-pub/.dubhe/core/App.js')).toMatchSnapshot()
    expect(await getFileContent('vite-pub/.dubhe/core/HelloWorld.js')).toMatchSnapshot()
  })

  it('types files output', async () => {
    const content = await getFileContent('vite-pub/.dubhe/types/types.json')
    expect(content).toMatchSnapshot()
  })

  it('source files output', async () => {
    expect(isExist('vite-pub/.dubhe/source/src')).toBeTruthy()
  })
})
