/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SubConfig } from 'dubhe-share'

import type { ComponentResolver } from 'unplugin-vue-components'

export function kebabCase(key: string) {
  const result = key.replace(/([A-Z])/g, ' $1').trim()
  return result.split(' ').join('-').toLowerCase()
}

// from r-app-hello to !app/hello
export function DubheResolver(config: SubConfig) {
  // function getSideEffects(id: string) {
  //   return `!${id.replace('-', '/')}.css`
  // }
  function resolveDirectory(id: string) {
    return `dubhe-${id.replace('-', '/')}`
  }

  function componentsResolver(name: string) {
    if (name.match(/^\$[a-zA-Zd]+_[a-zA-Zd]+_[a-zA-Zd]+/)) {
      const [_, project, module, imports] = name.match(
        /^\$([a-zA-Zd]+)_([a-zA-Zd]+)_([a-zA-Zd]+)/,
      ) as string[]
      return {
        name: imports,
        from: `dubhe-${project}/${module}`,
      }
    }
    if (name.match(/^([A-Z][a-z]*)([A-Z][a-z]*)$/)) {
      const [_, project] = name.match(
        /^([A-Z][a-z]*)([A-Z][a-z]*)/,
      ) as string[]
      // FOR DEFAULT IMPORT
      if (project.toLowerCase() in config.remote) {
        const resolveId = kebabCase(name)

        return {
          // sideEffects: getSideEffects(resolveId),
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
