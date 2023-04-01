import { basename } from 'path'
import type { SFCDescriptor } from '@vue/compiler-sfc'
import { compileScript, parse, rewriteDefault } from '@vue/compiler-sfc'
import type { dtsCompiler } from 'dubhe'
import { transferSetupPosition } from './transform'
const exportDefaultRE = /export\s+default/
const exportDefaultClassRE = /(?:(?:^|\n|;)\s*)export\s+default\s+class\s+([\w$]+)/

const noScriptContent = 'import { defineComponent } from \'vue\'\nexport default defineComponent({})'

let index = 1

function parseCode(code: string) {
  const descriptor = parse(code).descriptor

  return descriptor as SFCDescriptor
}

export const VueCompiler: dtsCompiler = {
  key: /\.vue$/,
  handler(code, id, project, config) {
    const { content, ext } = compileVueCode(code)

    const virtualPath = `${id}.${ext || 'js'}`

    if (project.getSourceFile(virtualPath))
      project.removeSourceFile(project.getSourceFile(virtualPath)!)

    if (content)
      project.createSourceFile(virtualPath, content, { overwrite: true })
    return `${code}\n<dubhe>export default (block)=>{block.projectID="${config.project || 'dubhe'
}";block.fileID="${basename(id)}";}</dubhe>`
  },
}

export function compileVueCode(code: string) {
  const descriptor = parseCode(code)
  const { script, scriptSetup } = descriptor

  let content: string | null = null
  let ext: string | null = null

  if (script || scriptSetup) {
    const compiled = compileScript(descriptor, {
      id: `${index++}`,
    })
    if (scriptSetup) {
      const classMatch = compiled.content.match(exportDefaultClassRE)
      const plugins = scriptSetup.lang === 'ts' ? ['typescript' as const] : undefined

      if (classMatch) {
        content
          = `${compiled.content.replace(exportDefaultClassRE, '\nclass $1')
          }\nconst _sfc_main = ${classMatch[1]}`

        if (exportDefaultRE.test(content))
          content = rewriteDefault(compiled.content, '_sfc_main', plugins)
      }
      else {
        content = rewriteDefault(compiled.content, '_sfc_main', plugins)
      }

      content = transferSetupPosition(content)
      content += '\nexport default _sfc_main\n'

      ext = scriptSetup.lang || 'js'
    }
    else if (script && script.content) {
      content = rewriteDefault(
        script.content,
        '_sfc_main',
        script.lang === 'ts' ? ['typescript'] : undefined,
      )
      content += '\nexport default _sfc_main\n'

      ext = script.lang || 'js'
    }
  }
  else {
    content = noScriptContent
    ext = 'ts'
  }
  return { content, ext }
}
