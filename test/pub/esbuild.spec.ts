import { describe, expect, it } from 'vitest'
import { getDistFiles, getFileContent, isExist } from '../utils'
describe('[esbuild] publish module ', () => {
  it('core files output', async () => {
    const files = await getDistFiles('esbuild-pub/.dubhe/core')
    expect(files.length).toBe(9)
    const remoteList = JSON.parse(await getFileContent('esbuild-pub/.dubhe/core/remoteList.json'))
    delete remoteList.time
    expect(remoteList).toMatchSnapshot()
    expect(await getFileContent('esbuild-pub/.dubhe/core/App.js')).toMatchSnapshot()
    expect(await getFileContent('esbuild-pub/.dubhe/core/HelloWorld.js')).toMatchSnapshot()
  })

  it('types files output', async () => {
    const content = await getFileContent('esbuild-pub/.dubhe/types/types.json')
    expect(content).toMatchSnapshot()
  })

  it('source files output', async () => {
    expect(isExist('esbuild-pub/.dubhe/source/src')).toBeTruthy()
  })
})
