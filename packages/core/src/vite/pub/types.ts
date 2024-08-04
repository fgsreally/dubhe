export interface PubOptions {
  version: string
  external: string[]
  entries: Record<string, string>
  dir: string
  name: string
}

export interface PubDevConfig {
  version: string
  // glob
  external: string[]
  entries: Record<string, string>
  dev: true
}

export interface PubProdConfig {
  name: string
  version: string
  timestamp: string
  dependences: string[]
  entries: Record<string, string>

}
