export const state = { externalSet: new Set(), systemjsImportMap: {}, esmImportMap: {} } as {
  externalSet: Set<string>
  systemjsImportMap: Record<string, string>
  esmImportMap: Record<string, string>
}
