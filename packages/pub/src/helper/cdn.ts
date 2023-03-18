import { ESM_SH_URL, UNPKG_URL } from 'dubhe-lib'

export function unpkg(name: string) {
  return `${UNPKG_URL}${name}?module`
}

export function esmsh(name: string) {
  return `${ESM_SH_URL}${name}`
}
