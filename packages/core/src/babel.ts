/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/*
 * SystemJS format Babel transformer
 */
import * as babel from '@babel/core'
import babelPluginSyntaxClassProperties from '@babel/plugin-syntax-class-properties'
import babelPluginNumericSeparator from '@babel/plugin-proposal-numeric-separator'
import babelPluginProposalExportDefaultFrom from '@babel/plugin-proposal-export-default-from'
import babelPluginProposalExportNamespaceFrom from '@babel/plugin-proposal-export-namespace-from'
import babelPluginTransformModulesSystemJS from '@babel/plugin-transform-modules-systemjs'
import babelPluginProposalDynamicImport from '@babel/plugin-proposal-dynamic-import'

const plugins = [
  babelPluginProposalExportDefaultFrom,
  babelPluginProposalExportNamespaceFrom,
  babelPluginSyntaxClassProperties,
  babelPluginNumericSeparator,
  babelPluginProposalDynamicImport,
  babelPluginTransformModulesSystemJS,
]

const stage3Syntax = ['asyncGenerators', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'dynamicImport', 'importMeta', 'nullishCoalescingOperator', 'numericSeparator', 'optionalCatchBinding', 'optionalChaining', 'objectRestSpread', 'topLevelAwait']

export function esmToSystemjs(source: string, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    babel.transform(source, {
      filename,
      sourceMaps: 'inline',
      ast: false,
      compact: false,
      sourceType: 'module',
      parserOpts: {
        plugins: stage3Syntax,
        errorRecovery: true,
      },
      plugins,
    }, (err, result) => {
      if (err)
        return reject(err)
      resolve(result.code)
    })
  })
}
