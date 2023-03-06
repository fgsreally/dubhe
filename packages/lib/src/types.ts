import type { Diagnostic, Project, ts } from 'ts-morph'
import type { Alias } from 'vite'

interface TransformWriteFile {
  filePath?: string
  content?: string
}

export interface dtsCompiler { key: RegExp; handler: (code: string, id: string, project: Project, remoteConf: PubConfig) => void | any }

export interface dtsPluginOptions {

  include?: string | string[]
  exclude?: string | string[]
  root?: string
  outputDir?: string | string[]
  entryRoot?: string
  compilerOptions?: ts.CompilerOptions | null
  tsConfigFilePath?: string
  aliasesExclude?: Alias['find'][]
  cleanVueFileName?: boolean
  staticImport?: boolean
  clearPureImport?: boolean
  insertTypesEntry?: boolean
  compiler?: dtsCompiler[]
  copyDtsFiles?: boolean
  noEmitOnError?: boolean
  skipDiagnostics?: boolean
  logDiagnostics?: boolean
  afterDiagnostic?: (diagnostics: Diagnostic[]) => void | Promise<void>
  beforeWriteFile?: (filePath: string, content: string) => void | TransformWriteFile
  afterBuild?: () => void | Promise<void>
}

// interface remoteVueconfig {
//   delScoped?: boolean
//   addTag?: boolean
// }
export interface PubConfig {
  source?: boolean
  outDir?: string
  entry: Record<string, string>
  externals: (id: string) => boolean | void
  version?: string
  project?: string
  types?: boolean

  // vendor?: string[];
  HMR?: { port: string }[]
  dts?: dtsPluginOptions
  meta?: any
}

export interface SubConfig {
  externals: (id: string) => { esm?: string; systemjs?: string } | void
  version?: number
  remote: Record<string, {
    url: string, mode?: 'hot' | 'cold'
  }>
  cache?: boolean
  types?: boolean
  systemjs?: boolean

  injectHtml?: {
    systemjs?: string | boolean
    importMap?: string | boolean
    systemBabel?: string | boolean
  }
}

export interface remoteListType {
  from: 'vite' | 'esbuild'
  files: string[]
  version: string
  externals: string[]
  alias: { name: string; url: string }[]
  initEntryFiles: string[]
  entryFileMap: { [key: string]: string }
  sourceGraph: { [key: string]: string[] }
  dependenceGraph: { [key: string]: string[] }
  importsGraph: { [key: string]: string[] }
  timestamp: number
}

export type ModulePathMap = { [key in string]: string }

interface Options {
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
}

// export interface devConfig {
//   externals: { [key in string]: string }
//   remote?: { [key in string]: string }
//   opts?: Options
// }

export interface VisModuleGraph {
  nodes: {
    key: string | number
    attributes: {
      x: number
      y: number
      size: number
      label: string
      color: string
    }
  }[]
  edges: {
    key: string | number
    source: string | number
    target: string | number
    attributes: {
      color: string
      size: number
    }
  }[]
}

export interface aliasType {
  name: string
  url: string
}
