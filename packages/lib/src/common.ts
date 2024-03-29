import { resolve } from 'path'
import envPaths from 'env-paths'
export const CACHE_ROOT = envPaths('dubhe').data
export const TYPE_ROOT = envPaths('dubhe-type').data

export const VIRTUAL_RE = /^dubhe-(.*)\/([^?]*)/
export const VIRTUAL_PREFIX = 'virtual:dubhe'
export const VIRTUAL_EMPTY = 'virtual:d_empty'
export const VIRTUAL_HMR_PREFIX = 'virtual:d_hmr'
export const ESM_SH_URL = 'https://esm.sh/'
export const UNPKG_URL = 'https://unpkg.com/'

export const TS_CONFIG_PATH = resolve(
  process.cwd(),
  'tsconfig.dubhe.json',
)

export const DEFAULT_POLYFILL = {
  systemjs: 'https://unpkg.com/systemjs@6.13.0/dist/s.js',
  importMap: 'https://ga.jspm.io/npm:es-module-shims@1.6.2/dist/es-module-shims.js',
}
export const HMT_TYPES_TIMEOUT = 10000

export const VIRTUAL_CSS_PREFIX = '/@virtual:DUBHE_CSS/'

export const DUBHE_DOC_SYMBOL = '__DP_DOC__'

export const DUBHE_PATH_SYMBOL = '/__dubhe_path__/'

export const DUBHE_IMPORT_STYLE_SYMBOL = '__D_IS__'

