import { extname, join, relative, resolve } from 'path'
import fs from 'fs'
// eslint-disable-next-line n/no-deprecated-api
import { resolve as urlResolve } from 'url'
import type { ImportSpecifier } from 'es-module-lexer'
import { parse } from 'es-module-lexer'
import type { Color } from 'colors'
import colors from 'colors'
import { normalizePath } from 'vite'
import type { ModuleNode } from 'vite'
import axios from 'axios'
import fse from 'fs-extra'
import MagicString from 'magic-string'
import type {
  ModulePathMap,
  aliasType,
  extensionType,
  externals,
  homeConfig,
} from '../types'
import {
  FEDERATION_RE,
  HMT_TYPES_TIMEOUT,
  TS_CONFIG_PATH,
  VIRTUAL_HMR_PREFIX,
  VIRTUAL_PREFIX,
} from '../common/common'

export const TYPES_CACHE = resolve(process.cwd(), '.dubhe', 'types')

export function HMRModuleHandler(url: string) {
  const ret = resolveURLQuery(url) as any
  if (ret)
    return ret.module.map((item: string) => `!${ret.project}/${item}`)
}

export function HMRTypesHandler(url: string, remoteConfig: externals) {
  const { file, project, module, types } = resolveURLQuery(url) as any

  if (
    types
    && (module as string[]).some(item => item.endsWith('.js'))
    && !(file as string).endsWith('.js')
  ) {
    setTimeout(() => {
      log('update types file', 'blue')
      updateTypesFile(
        urlResolve(remoteConfig[project], 'types/'),
        project,
        file.endsWith('.ts') ? file.replace(/\.ts$/, '.d.ts') : `${file}.d.ts`,
      )
    }, HMT_TYPES_TIMEOUT)
  }
}

export function normalizeFileName(name: string) {
  return `${name}${extname(name) ? '' : '.js'}`
}

export function replaceImportDeclarations(source: any, externals: externals) {
  // let newSource = source;
  const newSource = new MagicString(source)

  const [imports] = parse(source, 'optional-sourcename')
  for (const i of imports as any) {
    for (const j in externals) {
      if (i.n === externals[j]) {
        // newSource = newSource.replace(i.n, j);
        newSource.overwrite(i.s, i.e, j)

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

export function replaceHotImportDeclarations(
  source: any,
  config: homeConfig,
  aliasMap: { [key: string]: aliasType[] },
) {
  const [imports] = parse(source, 'optional-sourcename')
  // let newSource = source;
  const newSource = new MagicString(source)
  let cssImports = ''
  for (const i of imports as any) {
    if (FEDERATION_RE.test(i.n)) {
      const [project, moduleName] = resolveModuleAlias(i.n, aliasMap)

      if (extname(moduleName) === '.js') {
        newSource.overwrite(
          i.s,
          i.e,
          urlResolve(config.remote[project], `core/${moduleName}`),
        )
      }

      if (extname(moduleName) === '.css') {
        cssImports += `\nloadCss("${config.remote[project]}/core/${moduleName}");`
        newSource.overwrite(i.ss, i.se, '')
      }
    }
  }
  if (cssImports.length > 0) {
    newSource
      .prepend('import {loadCss} from "dubhe/runtime"\n')
      .append(cssImports)
  }
  return newSource.toString()
}

export function replaceBundleImportDeclarations(
  source: string,
  externals: externals,
) {
  const [imports] = parse(source, 'optional-sourcename')
  // let newSource = ``;
  const newSource = new MagicString(source)

  const replacement: [ImportSpecifier, string][] = []

  for (const i of imports) {
    for (const j in externals) {
      if (i.n === j) {
        log(` ${j} has been replaced to ${externals[j]}`)
        replacement.push([i, externals[j]])
        newSource.overwrite(i.s, i.e, externals[j])
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

export function getModuleName(fileName: string) {
  return fileName.replace(extname(fileName), '')
}

export function getHMRFilePath(i: ModuleNode) {
  return `/${normalizePath(relative(process.cwd(), i?.file || ''))}`
}

export async function sendHMRInfo({
  url,
  project,
  types,
  file,
  module,
}: {
  url: string
  types: boolean
  project: string
  file: string
  module: string[]
}) {
  return await axios.get(
    `${url}?file=${file}&project=${project}&module=${JSON.stringify(
      module,
    )}&types=${types}`,
  )
}

export function resolveURLQuery(url: string) {
  if (!url.startsWith(`/${VIRTUAL_HMR_PREFIX}`))
    return false
  const queryUrl = url.replace(`/${VIRTUAL_HMR_PREFIX}`, '')
  const query = new URLSearchParams(queryUrl)
  return {
    file: query.get('file'),
    types: query.get('types') === 'true',
    project: query.get('project'),
    module: JSON.parse(query.get('module') as string) as string[],
  }
}

export async function analyseTSEntry(code: string) {
  const [imports, exports] = await parse(code)
  const modulePathMap: ModulePathMap = {}
  exports.forEach((item, i) => {
    modulePathMap[item] = imports[i].n as string
  })
  return modulePathMap
}

export function updateTSconfig(project: string, modulePathMap: ModulePathMap) {
  const tsconfig: any = {
    compilerOptions: {
      baseUrl: '.',
      paths: {},
    },
  }

  for (const i in modulePathMap) {
    const jsPath = normalizePath(
      `./${join(`./${project}`, modulePathMap[i])}`,
    )
    tsconfig.compilerOptions.paths[`!${project}/${i}.*`] = [jsPath]
    tsconfig.compilerOptions.paths[`!${project}/${i}`] = [jsPath]
  }
  fse.outputJSON(TS_CONFIG_PATH, tsconfig)
}

export async function updateTypesFile(
  baseUrl: string,
  project: string,
  filePath: string,
) {
  try {
    const { data } = await axios.get(new URL(baseUrl, filePath).href)
    const p = resolve(TYPES_CACHE, project, filePath)
    fse.outputFileSync(p, data)
    // log(`update types file --${p}`, "blue");
  }
  catch (e) {
    log('update types file failed', 'red')
  }
}
export async function downloadTSFiles(url: string, project: string) {
  const { data } = await axios.get(url)
  const fileSet = data
  let entryFileCode
  for (const i of fileSet) {
    if (i.endsWith('.ts')) {
      const { data: code } = await axios.get(new URL(i, url).href)
      // if (i.includes('dubhe.d.ts'))
      //   entryFileCode = code.replace(/^export declare/gm, 'export')

      fse.outputFile(resolve(TYPES_CACHE, project, i), code)
    }
  }
  return entryFileCode
}

const fileSet: string[] = []
let rootDir: string
export function traverseDic(dirPath: string, cb?: (opt: string[]) => void) {
  if (!rootDir)
    rootDir = dirPath
  fs.readdirSync(dirPath, { withFileTypes: true }).forEach((file) => {
    const filePath = join(dirPath, file.name)
    if (file.isFile())
      fileSet.push(normalizePath(relative(rootDir, filePath)))

    else if (file.isDirectory())
      traverseDic(filePath)
  })
  cb?.(fileSet)
}

export function log(msg: string, color: keyof Color = 'green') {
  // eslint-disable-next-line no-console
  console.log(colors[color](`${colors.cyan('[dubhe]')} ${msg}`))
}

export function replaceEntryFile(code: string, source: string) {
  // work for vite^3

  const [i1] = parse(source, 'optional-sourcename')
  const [i2] = parse(code, 'optional-sourcename')
  const newSource = new MagicString(source)

  i1.forEach((item, i) => {
    newSource.overwrite(item.s, item.e, `"${i2[i].n}"`)
  })
  return newSource.toString()
}

export function resolvePathToModule(id?: string) {
  if (id?.includes(VIRTUAL_PREFIX))
    id = id.split(VIRTUAL_PREFIX)[1]
  if (id && FEDERATION_RE.test(id))
    return id
  return ''
}

export function resolveModuleAlias(
  id: string,
  alias: { [key: string]: aliasType[] },
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, project, moduleName] = id.match(FEDERATION_RE) as string[]

  let baseName = moduleName.split('.')[0]
  for (const i of alias[project]) {
    if (i.name === baseName)
      baseName = i.url
  }

  return [project, baseName + (extname(moduleName) || '.js'), baseName]
}

export async function getVirtualContent(
  url: string,
  project: string,
  moduleName: string,
  allowCache?: boolean,
) {
  const path = resolve(process.cwd(), '.dubhe', 'cache', project, moduleName)

  if (allowCache) {
    if (fse.existsSync(path))
      return { data: fs.readFileSync(path, 'utf-8'), isCache: true }
  }

  const data = await getRemoteContent(url)
  const content = typeof data === 'string' ? data : JSON.stringify(data)
  if (allowCache)
    setLocalContent(path, content)

  return { data: content, isCache: false }
}

export function setLocalContent(path: string, content: string) {
  fse.outputFile(path, content, 'utf-8')
}

export async function getRemoteContent(url: string) {
  const { data } = await axios.get(url)
  return data
}

export function resolveExtension(
  extensions: extensionType[],
  moduleName: string,
  basename: string,
) {
  for (const i of extensions) {
    if (extname(moduleName) === i.key)
      return i.transform(basename)
  }
}

export function getRelatedPath(p: string) {
  return normalizePath(relative(process.cwd(), p))
}

export function getAlias(
  filename: string,
  alias: { name: string; url: string }[],
) {
  if (extname(filename) === '.js')
    return alias.find(item => item.url === filename.split('.')[0])?.name
}

export function copySourceFile(p: string, outdir: string) {
  if (fse.existsSync(resolve(process.cwd(), p)))
    fse.copy(p, resolve(process.cwd(), outdir, 'source', p))
}

export function isSourceFile(fp: string) {
  return fse.existsSync(fp) && !fp.includes('node_modules')
}

export function addExtension(p: string) {
  return p + (extname(p) === '' ? '.ts' : '')
}
