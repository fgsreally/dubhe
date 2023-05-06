import { DUBHE_DOC_SYMBOL } from './common'

export function wrapInjectStyle(project: string, href: string) {
  return `/**dis-${href}*/globalThis.__D_IS__(__DP_${project}_+${href})/**dis*/\n`
}
/**/

export const INJECT_STYLE_SCRIPT = `export function injectStyle(styleStr, id) {
    const dubheDoc=globalThis.${DUBHE_DOC_SYMBOL}||document
    let style = dubheDoc.querySelector(\`#dubhe-style-\${id}\`)
    if (!style) {
      style = dubheDoc.createElement('style')
      style.id = \`dubhe-style-\${id}\`
      dubheDoc.head.appendChild(style)
    }
    style.innerHTML = styleStr
  }
  `
export const IMPORT_STYLE_SCRIPT = `globalThis.__D_IS__=(href)=>{const s= document.createElement('link');s.rel="stylesheet";s.href=href;const d=globalThis.${DUBHE_DOC_SYMBOL}||document;d.head.appendChild(s)}`

export function injectScriptToPub(project: string) {
/**
 * @future globalThis.__D_IS__=()=>{}
 */
  return `globalThis.__DP_${project}_='.'`
}

export function removeDynamicCss(code: string) {
  return code.replace(/\/\*\*dis-(\.\/)?([a-zA-Z0-9_\/]+)\/\*\*dis\*\//g, (_, path) => {
    return `import "${path}"`
  },
  )
}
