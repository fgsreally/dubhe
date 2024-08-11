import { parse, serialize } from 'parse5'
import { handleESM } from './babel'
export async function handleHTML(html: string, filename?: string) {
  const document = parse(html)
  const processNode = async (node: any) => {
    if (node.nodeName === 'script') {
      const typeAttr = node.attrs.find((attr: any) => attr.name === 'type')

      if (typeAttr) {
        if (typeAttr.value === 'module') {
          typeAttr.value = 'systemjs-module'

          if (!node.attrs.find((attr: any) => attr.name === 'src')) {
            // 处理内联脚本
            const textNode = node.childNodes[0]
            if (textNode) {
              const inlineScript = textNode.value
              const systemJS = await handleESM(inlineScript, {
                filename,
                sourceMaps: false,
              })

              textNode.value = systemJS
            }
          }
        }
        if (typeAttr.value === 'importmap')
          typeAttr.value = 'systemjs-importmap'
      }
    }

    if (node.childNodes) {
      for (const n of node.childNodes)
        await processNode(n)
    }
  }

  // 开始处理根节点
  await processNode(document)
  return serialize(document)
}

