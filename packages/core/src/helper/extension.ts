import type { extensionType } from '../types'

export const vExtension: extensionType = {
  key: '.v',
  color: '#54dd65',
  transform(basename: string) {
    return `import Comp from "./${basename}.js"\n
     export default Comp
    import "./${basename}.css"
    `
  },
}
