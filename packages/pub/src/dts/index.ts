import { relative, resolve } from 'path'
import os from 'os'
import type { SourceFile } from 'ts-morph'
import { Project } from 'ts-morph'
import { createUnplugin } from 'unplugin'
import fse from 'fs-extra'
import type { Alias, AliasOptions } from 'vite'
import { normalizePath } from 'vite'
import TS from 'typescript'
import debug from 'debug'
import glob from 'fast-glob'
import type { Plugin } from 'esbuild'
import type { PubConfig, dtsPluginOptions } from 'dubhe-lib'
import { debounce, ensureAbsolute, ensureArray, isNativeObj, log, mergeObjects, queryPublicPath, resolveAlias, runParallel, traverseDic } from 'dubhe-lib'

import { VueCompiler } from './compile'
import { normalizeGlob, removePureImport, transformAliasImport } from './transform'
const Debug = debug('dubhe-dts')
const virtualPrefix = '\0'

// const vueRE = /\.vue$/
const tsRE = /\.tsx?$/
const jsRE = /\.jsx?$/
const tjsRE = /\.(t|j)sx?$/
const dtsRE = /\.d\.tsx?$/

let aliases: Alias[] = []

const { readConfigFile } = TS
export const dtsPlugin = createUnplugin((remoteConf: Required<PubConfig>) => {
  const options: dtsPluginOptions = remoteConf.dts || {}
  const {
    tsConfigFilePath = 'tsconfig.json',
    // aliasesExclude = [],
    clearPureImport = true,
    noEmitOnError = false,
    compiler = [VueCompiler],
    // afterBuild = noop,
  } = options

  const compilerOptions = options.compilerOptions ?? {}

  // let outputDir: string, tsConfigPath: string, root: string, entry: string
  let entryRoot = options.entryRoot ?? ''
  const root = process.cwd()
  const tsConfigPath = resolve(root, tsConfigFilePath)
  const outputDir = resolve(root, remoteConf.outDir, 'types')
  const entry = normalizePath(ensureAbsolute('dubhe.ts', root))

  const noneExport = 'export {};\n'

  const project = new Project({
    compilerOptions: mergeObjects(compilerOptions, {
      noEmitOnError,
      outDir: '.',
      declarationDir: null,
      noUnusedParameters: false,
      declaration: true,
      noEmit: false,
      emitDeclarationOnly: true,
    }),
    tsConfigFilePath,
    skipAddingFilesFromTsConfig: true,
  })

  project.createSourceFile(resolve(process.cwd(), 'index.ts'), 'export {}')

  const allowJs = project.getCompilerOptions().allowJs ?? false

  async function outputDts() {
    Debug('buildEnd')
    const sourceDtsFiles = new Set<SourceFile>()

    const startTime = Date.now()
    const tsConfig: {
      extends?: string
      include?: string[]
      exclude?: string[]
    } = readConfigFile(tsConfigPath, project.getFileSystem().readFileSync).config ?? {}

    const parentTsConfigPath = tsConfig.extends && ensureAbsolute(tsConfig.extends, root)
    const parentTsConfig: {
      include?: string[]
      exclude?: string[]
    } = parentTsConfigPath
      ? readConfigFile(parentTsConfigPath, project.getFileSystem().readFileSync).config
      : {}

    const include = options.include ?? tsConfig.include ?? parentTsConfig.include ?? '**/*'
    const exclude
      = options.exclude ?? tsConfig.exclude ?? parentTsConfig.exclude ?? 'node_modules/**'

    Debug('read TS config')

    const includedFileSet = new Set<string>()

    // 收集ts文件
    if (include && include.length) {
      const files = await glob(ensureArray(include).map(normalizeGlob), {
        cwd: root,
        absolute: true,
        ignore: ensureArray(exclude).map(normalizeGlob),
      })

      files.forEach((file) => {
        if (dtsRE.test(file)) {
          includedFileSet.add(file)
          sourceDtsFiles.add(project.addSourceFileAtPath(file))
          return
        }
        includedFileSet.add(`${tjsRE.test(file) ? file.replace(tjsRE, '') : file}.d.ts`)
      })

      Debug('collect all TS files under dir')
    }

    const dtsOutputFiles = Array.from(sourceDtsFiles).map(sourceFile => ({
      path: sourceFile.getFilePath(),
      content: sourceFile.getFullText(),
    }))
    project.resolveSourceFileDependencies()
    Debug('resolve source dependence')

    const service = project.getLanguageService()

    const outputFiles = project
      .getSourceFiles()
      .map(sourceFile =>
        service
          .getEmitOutput(sourceFile, true)
          .getOutputFiles()
          .map((outputFile) => {
            return {
              path: normalizePath(resolve(root, outputFile.compilerObject.name)),
              content: outputFile.getText(),
            }
          }),
      )
      .flat().concat(dtsOutputFiles)

    Debug('get output content')

    entryRoot = queryPublicPath(outputFiles.map(file => file.path))

    entryRoot = ensureAbsolute(entryRoot, root)
    const wroteFiles = new Set<string>()

    await runParallel(os.cpus().length, outputFiles, async (outputFile) => {
      let filePath = outputFile.path
      let content = outputFile.content

      const isMapFile = filePath.endsWith('.map')

      if (
        !includedFileSet.has(isMapFile ? filePath.slice(0, -4) : filePath)

      )
        return

      if (!isMapFile && content && content !== noneExport) {
        content = clearPureImport ? removePureImport(content) : content// 移除 import 'xx.js'
        content = transformAliasImport(filePath, content, aliases)
        // content  staticImport ? transformDynamicImport(content) : content
      }// 移除 将 import("xx") 转为 import {} from ""

      filePath = resolve(
        outputDir,
        relative(entryRoot, filePath),
      )

      await fse.outputFile(
        filePath,
        content,
        'utf-8',
      )

      wroteFiles.add(normalizePath(filePath))
    })
    Debug('output dts')

    traverseDic(outputDir, (params) => {
      fse.outputJSONSync(
        resolve(outputDir, 'types.json'),
        params,
      )
    })

    Debug('output types.json')
    log(`Generate dts takes ${Date.now() - startTime}`)
  }

  const buildEnd = debounce(outputDts)

  return {
    name: 'dubhe::dts',
    enforce: 'pre',
    transformInclude(id) {
      return tjsRE.test(id) || compiler?.some(item => item.key.test(id))
    },
    transform(code, id) {
      if (id.startsWith(virtualPrefix) || id === entry)
        return null

      for (const i of compiler || []) {
        if (i.key.test(id))

          return i.handler(code, id, project, remoteConf)
      }

      if (fse.existsSync(id) && (tsRE.test(id) || (allowJs && jsRE.test(id)))) {
        const sourceFile = project.getSourceFile(id)
        if (sourceFile)
          project.removeSourceFile(sourceFile)

        project.addSourceFileAtPath(id)
      }

      return null
    },

    writeBundle: buildEnd,

    vite: {
      apply: 'build',
      // options,
      config(config: any) {
        const aliasOptions = config?.resolve?.alias ?? []
        getAlias(aliasOptions as AliasOptions)
      },
      // configResolved(config) {
      //   root = ensureAbsolute(options.root ?? '', config.root)
      //   tsConfigPath = resolve(root, tsConfigFilePath)
      //   outputDir = resolve(root, config.build.outDir, '../', 'types')
      //   entry = normalizePath(ensureAbsolute(remoteConf.entry, root))
      // },
    },
  }
})

export const EsbuildPolyfill: Plugin = {
  name: 'dubhe::dts[esbuild-polyfill]',
  setup(build) {
    getAlias(resolveAlias(build.initialOptions.alias))
  },
}

function getAlias(aliasOptions: AliasOptions) {
  if (isNativeObj(aliasOptions)) {
    aliases = Object.entries(aliasOptions).map(([key, value]) => {
      return { find: key, replacement: value }
    })
  }
  else {
    aliases = ensureArray(aliasOptions)
  }
}
