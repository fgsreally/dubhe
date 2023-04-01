import { ESM_SH_URL, UNPKG_URL } from 'dubhe'

export function unpkg(imports: string[]) {
  // work for unpkg
  const externals: { [key: string]: string } = {}

  for (const i of imports)
    externals[i] = `${UNPKG_URL}${i}?module`

  return externals
}

export function esmsh(imports: string[]) {
  // work for unpkg
  const externals: { [key: string]: string } = {}

  for (const i of imports)
    externals[i] = `${ESM_SH_URL}${i}`

  return externals
}
