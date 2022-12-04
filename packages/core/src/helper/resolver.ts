import { createRequire } from 'module'
import { resolve } from 'path'
import type { ComponentResolver } from 'unplugin-vue-components'
const require = createRequire(process.cwd())

const { remote } = require(resolve(process.cwd(), 'dubhe.cjs'))

export function kebabCase(key: string) {
  const result = key.replace(/([A-Z])/g, ' $1').trim()
  return result.split(' ').join('-').toLowerCase()
}

// from r-app-hello to !app/hello
export function DubheResolver() {
  function getSideEffects(id: string) {
    return `!${id.replace('-', '/')}.css`
  }
  function resolveDirectory(id: string) {
    return `!${id.replace('-', '/')}`
  }

  function componentsResolver(name: string) {
    if (name.match(/^[a-zA-Zd]+_[a-zA-Zd]+_[a-zA-Zd]+/)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, project, module, imports] = name.match(
        /^([a-zA-Zd]+)_([a-zA-Zd]+)_([a-zA-Zd]+)/,
      ) as string[]
      console.log(project.toLowerCase(), remote, 'module')

      if (project.toLowerCase() in remote) {
        return {
          name: imports,
          from: `!${project}/${module}`,
        }
      }
    }
    if (name.match(/^([A-Z][a-z]*)([A-Z][a-z]*)$/)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, project] = name.match(
        /^([A-Z][a-z]*)([A-Z][a-z]*)/,
      ) as string[]
      // FOR DEFAULT IMPORT
      if (project.toLowerCase() in remote) {
        const resolveId = kebabCase(name)

        return {
          sideEffects: getSideEffects(resolveId),
          from: resolveDirectory(resolveId),
        }
      }
    }

    // from RAppHello to app-hello
  }

  const resolvers: ComponentResolver[] = [
    {
      type: 'component',
      resolve: (name: string) => componentsResolver(name),
    },
  ]

  return resolvers
}
