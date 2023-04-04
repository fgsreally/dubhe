import { basename, extname } from 'path'
import { parse } from 'es-module-lexer'
import MagicString from 'magic-string'
import fse from 'fs-extra'
import { parseSync, traverse } from '@babel/core'
import type { AliasType } from './types'
import { VIRTUAL_PREFIX, VIRTUAL_RE } from './common'
import { getLocalPath, getRemoteContent, setLocalContent } from './utils'

export function resolveAlias(alias: Record<string, string> = {}) {
  return Object.entries(alias).map((item) => {
    return {
      find: item[0],
      replacement: item[1],
    }
  })
}

export function getExternalId(id: string, handler: string | ((id: string) => string)) {
  return typeof handler === 'string' ? handler : handler(id)
}

export function getAlias(
  filename: string,
  alias: { name: string; url: string }[],
) {
  if (extname(filename) === '.js')
    return alias.find(item => item.url === basename(filename, '.js'))?.name
}

// get content from file cache or http
export async function getVirtualContent(
  url: string,
  project: string,
  moduleName: string,
  allowCache?: boolean,
  forceRewrite?: boolean,
) {
  // const path = resolve(process.cwd(), '.dubhe', 'cache', project, moduleName)
  const path = getLocalPath(project, moduleName)
  if (allowCache && fse.existsSync(path))

    return { data: await fse.readFile(path, 'utf-8'), isCache: true }

  const data = await getRemoteContent(url)
  const content = typeof data === 'string' ? data : JSON.stringify(data)
  if (allowCache || forceRewrite)
    setLocalContent(path, content)

  return { data: content, isCache: false }
}

export function resolvePathToModule(id?: string) {
  if (id?.includes(VIRTUAL_PREFIX))
    id = id.split(VIRTUAL_PREFIX)[1]
  if (id && VIRTUAL_RE.test(id))
    return id
  return ''
}

export function resolveModuleAlias(
  id: string,
  alias: { [key: string]: AliasType[] },
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, project, moduleName] = id.match(VIRTUAL_RE) || []

  if (!project)
    return []
  let baseName = moduleName
  for (const i of alias[project]) {
    if (i.name === baseName)
      baseName = `${i.url}.js`
  }

  return [project, `${baseName}`, baseName]
}

export function replaceImportDeclarations(source: any, externals: Record<string, string>) {
  // let newSource = source;
  const newSource = new MagicString(source)

  const [imports] = parse(source, 'optional-sourcename')
  for (const i of imports as any) {
    for (const j in externals) {
      if (i.n === j) {
        // newSource = newSource.replace(i.n, j);
        newSource.overwrite(i.s, i.e, externals[j])

        break
      }
    }
  }

  return newSource.toString()
}

export function ImportExpression(source: string) {
  const ret: { url: string; name: string }[] = []
  source.replace(
    /\s([^\s]*)\s*=.*import\(['|"]\.\/(.*)\.js['|"]\)/g,
    (_: string, name: string, i: string) => {
      ret.push({ url: i, name })
      return ''
    },
  )

  return ret
}

export function analyseImport(code: string) {
  const ret = {} as Record<string, Set<string>>
  const ast = parseSync(code)

  traverse(ast, {

    ImportDeclaration(path) {
      const { node } = path

      const { source: { value }, specifiers } = node
      if (!value.startsWith('/') && !value.startsWith('.')) {
        if (!ret[value])
          ret[value] = new Set()

        specifiers.forEach((item) => {
          if (item.type === 'ImportSpecifier')
            ret[value].add((item as any).imported.name)
          if (item.type === 'ImportDefaultSpecifier')
            ret[value].add('default')
          if (item.type === 'ImportNamespaceSpecifier')
            ret[value].add('*')
        })
      }
    },

  })

  for (const i in ret)
    (ret as any)[i] = [...ret[i]]

  return ret as unknown as Record<string, string[]>
}
// export function replaceHotImportDeclarations(
//   source: any,
//   config: SubConfig,
//   aliasMap: { [key: string]: AliasType[] },
// ) {
//   const [imports] = parse(source, 'optional-sourcename')
//   // let newSource = source;
//   const newSource = new MagicString(source)
//   let cssImports = ''
//   for (const i of imports as any) {
//     if (VIRTUAL_RE.test(i.n)) {
//       const [project, moduleName] = resolveModuleAlias(i.n, aliasMap)

//       if (extname(moduleName) === '.js') {
//         newSource.overwrite(
//           i.s,
//           i.e,
//           urlResolve(config.remote[project], `core/${moduleName}`),
//         )
//       }

//       if (extname(moduleName) === '.css') {
//         cssImports += `\nloadCss("${config.remote[project]}/core/${moduleName}");`
//         newSource.overwrite(i.ss, i.se, '')
//       }
//     }
//   }
//   if (cssImports.length > 0) {
//     newSource
//       .prepend('import {loadCss} from "dubhe/runtime"\n')
//       .append(cssImports)
//   }
//   return newSource.toString()
// }

export function replaceBundleImportDeclarations(
  source: string,
  externals: Record<string, string>,
) {
  const [imports] = parse(source, 'optional-sourcename')
  // let newSource = ``;
  const newSource = new MagicString(source)

  // const replacement: [ImportSpecifier, string][] = []

  for (const i of imports) {
    for (const j in externals) {
      if (i.n === externals[j]) {
        // const replaceID = getExternalId(j, externals[j])
        // log(` ${j} has been replaced to ${replaceID}`)
        // replacement.push([i, replaceID])
        newSource.overwrite(i.s, i.e, j)
        break
      }
    }
  }
  // let start = 0,
  //   end: any = replacement[0]?.[0]?.s || undefined;

  // replacement.forEach((k, i) => {
  //   newSource += source.substring(start, end) + k[1];
  //   start = replacement[i][0].e;
  //   end = replacement[i + 1]?.[0]?.s || undefined;
  // });
  // newSource += source.substring(start, end);
  return newSource.toString()
}
