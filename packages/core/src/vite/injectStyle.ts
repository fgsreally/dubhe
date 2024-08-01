import type { OutputChunk } from 'rollup'
import type { Plugin } from 'vite'

export function InjectStyle(): Plugin {
  return {
    name: 'vite-plugin-style-inject',
    apply: 'build', // 应用模式
    enforce: 'post', // 作用阶段
    generateBundle(_, bundle) {
      // 遍历bundle
      for (const key in bundle) {
        const chunk = bundle[key] // 拿到文件名对应的值
        // 判断+提取+移除
        if (chunk.type === 'asset' && chunk.fileName.includes('.css') && chunk.source.length > 0) {
          const jsChunk = bundle[key.replace(/\.css$/, '.js')] as OutputChunk
          const initialCode = jsChunk.code // 保存原有代码
          // 重新赋值
          jsChunk.code = '(function(){ try {var elementStyle = document.createElement(\'style\'); elementStyle.appendChild(document.createTextNode('
          jsChunk.code += JSON.stringify((chunk.source as string).trim())
          jsChunk.code += ')); '
          // + 判断是否添加id

          jsChunk.code += 'document.head.appendChild(elementStyle);} catch(e) {console.error(\'vite-plugin-css-injected-by-js\', e);} })();'
          // 拼接原有代码
          jsChunk.code += initialCode

          delete bundle[key]
        }
      }
    },
  }
}
