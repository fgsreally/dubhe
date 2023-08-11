import { join, resolve } from 'path'
/* eslint-disable no-console */
import { exec } from 'node:child_process'
import { createRequire } from 'module'
import cac from 'cac'
import fse from 'fs-extra'
import { findExports } from 'mlly'
import fg from 'fast-glob'
import { getPkgName, log, patchVersion, traverseDic } from '../utils'
import pkgs from '../../package.json'
import { CACHE_ROOT, TYPE_ROOT } from '../common'
import { esmToSystemjs } from '../babel'
import { getLocalContent, getLocalPath, getLocalRecord, getRemoteContent, getTypePathInCache, linkCache, removeLocalCache, removeLocalType, removeWorkspaceType, updateLocalRecord } from '../cache'
import { linkTypes, updateTSconfig } from '../dts'
import { removeHash } from '../core'
import { analysePubDep, analyseSubDep, downloadFile, generateExports, getDubheList, getWorkSpaceConfig, installProjectCache, installProjectTypes, isExist } from './utils'
import { buildExternal } from './build'
const root = process.cwd()
const require = createRequire(root)
const cli = cac('dubhe')

cli.command('root', 'show dubhe CACHE_ROOT/TYPE_ROOT path').action(() => {
  log(`CACHE_ROOT:${CACHE_ROOT}`)
  log(`TYPE_ROOT:${TYPE_ROOT}`)
})

cli.command('clear', 'clear dubhe cache & types/cache').action(() => {
  fse.remove(CACHE_ROOT)
  log('remove cache')
  fse.remove(TYPE_ROOT)
  log('remove types cache')
})

cli
  .command('detect', 'contrast cache version & remote version')
  .alias('det')
  .action(async () => {
    const { dependencies } = require(resolve(root, 'package.json'))
    const dubheList = await getDubheList()
    for (const project in dubheList) {
      const pubList = await getRemoteContent(`${dubheList[project].url}/core/dubheList.json`)

      try {
        const localConfig = await getLocalContent(project, 'dubheList.json')
        if (!localConfig) {
          log(`[${project}] cache doesn't exist`, 'yellow')
          continue
        }

        for (const i of pubList.externals) {
          const depPkgName = getPkgName(i)
          if (!(depPkgName in dependencies))
            log(`[${project}] dependence--${depPkgName} doesn't exist in current repo`, 'yellow')
        }

        if (!patchVersion(localConfig.version, pubList.version)) {
          log(
            `[${project}] version diff: (local:${localConfig.version}|remote:${pubList.version})`,
            'red',
          )
          continue
        }

        if (localConfig.timestamp !== pubList.timestamp)
          log(`[${project}] cache may be out of date`, 'yellow')
      }
      catch (e) {
        log(`[${project}] doesn't exist local cache`, 'red')
      }
    }
    log('Detect finish')
  })

cli
  .command('import <project/entry>', 'import source code from <project/entry>(like viteout/test)')
  .option('--path, -p [path]', '[string] dir path ', {
    default: '.dubhe-source',
  })
  .action(async (projectEntry, option) => {
    if (!projectEntry)
      return
    const dubheList = await getDubheList()

    const [project, id] = projectEntry.split('/')

    if (!(project in dubheList)) {
      log(`Project:${project} does't exist in local records`, 'red')
      return
    }
    const pubList = await getRemoteContent(`${dubheList[project].url}/core/dubheList.json`)

    if (['vite', 'esbuild'].includes(pubList.from)) {
      const file = pubList.entryFileMap[id]
      if (!file) {
        log(`Id:${id} does't exist in ${project}`, 'red')
        return
      }

      log(`Import [${projectEntry}] source code`)
      if (pubList.from === 'esbuild' && !pubList.sourceGraph[file].includes(file))
        pubList.sourceGraph[file].push(file)
      for (const i of pubList.sourceGraph[file]) {
        const outputPath = resolve(root, option.path, project, i)

        if (!isExist(outputPath)) {
          try {
            downloadFile(
              `${dubheList[project].url}/source/${i}`,
              outputPath,
            )
          }
          catch (e) {
            log(`${i} doesn't exist`, 'red')
          }
        }
      }
      return
    }
    if (pubList.from === 'esbuild') {
      pubList.entryFileMap.files.forEach((item: string) => {
        downloadFile(
          `${dubheList[project].url}/source/${item}`,
          resolve(root, option.path, project, item),
        )
      })
    }
  })

cli
  .command('delete <project>', 'delete cache & types-cache from <project>')
  .alias('del')
  .option('--no_types, -not', '[boolean] won\'t delete types ', {
    default: false,
  })
  .option('--no_cache, -noc', '[boolean] won\'t delete cache ', {
    default: false,
  })

  .action(async (project, options) => {
    const dubheList = await getDubheList()
    if (!(project in dubheList)) {
      log(`${project} doesn't exist`, 'yellow')
      return
    }
    if (!options.not) {
      removeLocalType(project)
      removeWorkspaceType(project)

      log('remove types')
    }
    if (!options.noc) {
      removeLocalCache(project)

      log('remove cache')
    }
  })

cli.command('dts', 'use vue-dts to generate types declaration in watch mode')
  .option('--vue, -v [v]', '[boolean] use vue-tsc ')
  .action(async (options) => {
    const { vue } = options
    const { outDir = '.dubhe' } = await getWorkSpaceConfig()
    const outTypesDir = `${outDir}/types`
    fse.removeSync(outTypesDir)
    const tscProcess = exec(`npx ${vue ? 'vue-tsc' : 'tsc'} --declaration --emitDeclarationOnly --outDir ${outTypesDir} --watch`)
    tscProcess.stdout!.on('data', (data) => {
      if (data.includes('Found 0 errors.')) {
        traverseDic(outTypesDir, (params) => {
          params.push('types.json')
          fse.outputJSONSync(
            resolve(outTypesDir, 'types.json'),
            params,
          )
        })
        log('Generate types.json')
      }
      console.log(data)
    })
    tscProcess.on('error', (err) => {
      console.error(err)
    })
  })

cli
  .command('install', 'install cache')
  .alias('i')
  .option('--force', '[boolean] force to reinstall all files', {
    default: false,
  })
  .option('--no_types, -not', '[boolean] won\'t update types', {
    default: false,
  })
  .option('--no_cache, -noc', '[boolean] won\'t update cache ', {
    default: false,
  })
  .action(async (options) => {
    const { remote: dubheList } = await getWorkSpaceConfig()

    for (const project in dubheList) {
      try {
        const remoteConfig = await getRemoteContent(`${dubheList[project].url}/core/dubheList.json`)
        const localConfig = await getLocalContent(project, 'dubheList.json').catch(() => {
          return {}
        })
        const isForceUpdate = options.force || !localConfig || !patchVersion(remoteConfig.version, localConfig.version)

        if (!options.noc) {
          log(`Install [${project}] cache`)
          await installProjectCache(dubheList[project].url, ['dubheList.json', ...remoteConfig.files.filter((file: string) => {
            if (isForceUpdate)
              return true
            return !localConfig.files.includes(file)
          })], project)
        }
        if ((!options.not) && isForceUpdate) {
          log(`Install [${project}] types`)

          installProjectTypes(dubheList[project].url, project)
          updateLocalRecord(dubheList)
        }

        updateTSconfig(project, remoteConfig.entryFileMap)
      }
      catch (e) {
        log(`Install [${project}] cache fail`, 'red')
        console.error(e)
      }
    }
  })
cli.command('link', 'link cache to workspace')
  .option('--mode [mode]', '[string] link type or cache', {
    default: 'type',
  })
  .action(async (options) => {
    const { remote: dubheList } = await getWorkSpaceConfig()
    if (options.mode === 'type') {
      for (const project in dubheList) {
        const typsFiles = await fse.readJSON(getTypePathInCache(project, 'types.json'))
        linkTypes(project, typsFiles)
        log(`Link [${project}] `)
      }
    }
    if (options.mode === 'cache') {
      for (const project in dubheList) {
        const { files } = await getLocalContent(project, 'dubheList.json')
        linkCache(project, files.map((file: string) => removeHash(file)))
        log(`Link [${project}] `)
      }
    }
  })
cli.command('transform ', 'transform esm to systemjs')
  .option('--dir <dir>', '[string] esm files dir ', {
    default: 'core',
  })
  .option('--to <to>', '[string] systemjs files output dir', {
    default: 'systemjs',
  })
  .action(async (options) => {
    const { dir, to } = options
    const cwd = resolve(root, dir)
    const entries = await fg(['**/*'], { cwd })
    const dest = resolve(root, to)
    await fse.ensureDir(dest)
    entries.forEach(async (entry) => {
      const filePath = resolve(cwd, entry)
      const destPath = resolve(root, to, entry)
      if (filePath.endsWith('.js')) {
        const source = await fse.readFile(filePath, 'utf-8')
        fse.outputFile(destPath, await esmToSystemjs(source, entry))
      }
      else {
        fse.copyFile(filePath, destPath)
      }
    })
    log(`create systemjs band  to ${dest}`)
  })

cli.command('export <project>', 'get exported methods from remote project')
  .action(async (options) => {
    const { project } = options
    const pubList = await getLocalContent(project, 'dubheList.json')
    for (const i of pubList.alias) {
      const url = removeHash(i.url)
      const text = await getLocalContent(project, url)
      log(`dubhe-${project}/${i.name}:  ${getLocalPath(project, url)}`)

      console.table(findExports(text).map(item => item.name || item.type))
    }
  })
/**
 * @experiment
 */
cli
  .command(
    'bundle ',
    'bundle external dependence for function-level treeshake',
  )
  .alias('b')

  .option('--outDir, -o [outDir]', '[string] outDir for vite output', {
    default: 'dist',
  })
  .option('--dubheList, -d [dubheList]', '[string] dubheList.sub.json path in sub', {
    default: 'dist',
  })
  .action(async (option) => {
    const localConfig = await getWorkSpaceConfig()
    const subDep = await analyseSubDep(join(option.dubheList, 'dubheList.sub.json'))
    const deps = await analysePubDep(localConfig, subDep)
    const files: string[] = []
    for (const depname in deps) {
      const pkgName = getPkgName(depname)
      const exportsStr = `${generateExports([...deps[depname]])}\n`
      log(`Create entry--${pkgName}.js`, 'grey')
      const filePath = resolve(root, 'dubhe-bundle', `${pkgName}.js`)
      files.push(filePath)
      await fse.outputFile(filePath, exportsStr, 'utf-8')
    }

    log('Bundle start')
    await buildExternal(option.outDir, files)
    log('Bundle finish')
    fse.remove(resolve(root, 'dubhe-bundle'))
    log('Remove entry dir', 'grey')
  })

cli
  .command('analyse', 'analyse pub dependence')
  .alias('a')
  .action(async () => {
    const localConfig = await getWorkSpaceConfig()

    const pubDep = await analysePubDep(localConfig)
    for (const i in pubDep)
      pubDep[i] = [...pubDep[i]] as any
    log('pub dependence')
    console.table(pubDep)
  })

cli.help()
cli.version(pkgs.version)

cli.parse()

