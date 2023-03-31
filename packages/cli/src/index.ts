import { resolve } from 'path'
import { CACHE_ROOT, TYPE_ROOT, esmToSystemjs, getLocalContent, getLocalPath, getPkgName, getRemoteContent, getTypePathInCache, linkTypes, log, patchVersion, removeLocalCache, removeLocalType, updateLocalRecord } from 'dubhe-lib'
/* eslint-disable no-console */
import cac from 'cac'
import fse from 'fs-extra'
import { findExports } from 'mlly'
import fg from 'fast-glob'
import pkgs from '../package.json'
import { buildExternal } from './build'

import { analyseDep, downloadFile, generateExports, getRemoteList, getWorkSpaceConfig, installProjectCache, installProjectTypes, isExist, updateTsConfig } from './utils'
const root = process.cwd()

const cli = cac()

cli.command('root', 'show dubhe CACHE_ROOT/TYPE_ROOT path').action(() => {
  log(`CACHE_ROOT:${CACHE_ROOT}`)
  log(`TYPE_ROOT:${TYPE_ROOT}`)
})

cli.command('clear', 'clear dubhe cache').action(() => {
  fse.remove(CACHE_ROOT)
})

cli
  .command('detect', 'contrast cache version & remote version')
  .alias('det')
  .action(async () => {
    const remoteList = await getRemoteList()
    for (const project in remoteList) {
      const PubConfig = await getRemoteContent(`${remoteList[project].url}/core/remoteList.json`)

      try {
        // const localConfig = fse.readJSONSync(
        //   resolve(root, '.dubhe', 'cache', project, 'remoteList.json'),
        // )
        const localConfig = await getLocalContent(project, 'remoteList.json')
        if (!localConfig) {
          log(`project:${project} cache doesn't exist`, 'yellow')
          continue
        }
        if (!patchVersion(localConfig.version, PubConfig.version)) {
          log(
            `[versions-diff] project:${project}  (local:${localConfig.version}|remote:${PubConfig.version})`,
            'red',
          )
          continue
        }

        if (localConfig.timestamp !== PubConfig.timestamp)
          log(`[${project}] cache may be out of date`, 'yellow')
      }
      catch (e) {
        log(`[${project}] doesn't exist local cache`, 'red')
      }
    }
    log('Detect finish')
  })

cli
  .command('import <projectId>', 'import source code from <projectId>')
  .option('--path, -p [p]', '[string] dir path ', {
    default: '.dubhe-source',
  })
  .action(async (projectId, option) => {
    if (!projectId)
      return
    const remoteList = await getRemoteList()

    const [project, id] = projectId.split('/')

    if (!(project in remoteList)) {
      log(`Project:${project} does't exist in local records`, 'red')
      return
    }
    const { data: PubConfig } = await getRemoteContent(`${remoteList[project].url}/core/remoteList.json`)

    if (PubConfig.from === 'vite') {
      const file = PubConfig.entryFileMap[id]
      if (!file) {
        log(`Id:${id} does't exist in ${project}`, 'red')
        return
      }

      log(`Import [${projectId}] source code`)
      for (const i of PubConfig.sourceGraph[file]) {
        const outputPath = resolve(root, option.path, project, i)

        if (!isExist(outputPath)) {
          try {
            downloadFile(
              `${remoteList[project].url}/source/${i}`,
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
    if (PubConfig.from === 'esbuild') {
      PubConfig.entryFileMap.files.forEach((item: string) => {
        downloadFile(
          `${remoteList[project].url}/source/${item}`,
          resolve(root, option.path, project, item),
        )
      })
    }
  })

cli
  .command('delete <project>', 'delete cache from <project>')
  .alias('del')
  // .option('--cache, -c [c]', '[boolean] remove cache or not', {
  //   default: false,
  // })
  // .option('--types, -t [t]', '[boolean] remove types or not', {
  //   default: false,
  // })
  .action(async (project) => {
    const remoteList = await getRemoteList()
    if (!(project in remoteList))
      return
    removeLocalCache(project)
    removeLocalType(project)
  })

cli
  .command('install', 'install cache')
  .alias('i')
  .option('--force', '[boolean] force to reinstall ', {
    default: false,
  })
  .action(async (options) => {
    const { remote: remoteList } = await getWorkSpaceConfig()

    // const dubheConfig = await getConfig()

    for (const project in remoteList) {
      try {
        const remoteConfig = await getRemoteContent(`${remoteList[project].url}/core/remoteList.json`)
        const localConfig = await getLocalContent(project, 'remoteList.json').catch(() => {
          return {}
        })

        if (options.force || !localConfig.version || !patchVersion(remoteConfig.version, localConfig.version)) {
          log(`Install [${project}] cache`)
          await installProjectCache(remoteList[project].url, ['remoteList.json', ...remoteConfig.files], project)
          log(`Install [${project}] types`)
          installProjectTypes(remoteList[project].url, project)
          updateTsConfig(project, remoteConfig.entryFileMap)
          updateLocalRecord(remoteList)
        }
      }
      catch (e) {
        log(`Install [${project}] cache fail`, 'red')
        console.error(e)
      }
    }
  })
cli.command('link', 'link types cache to workspace').action(async () => {
  const { remote: remoteList } = await getWorkSpaceConfig()
  for (const project in remoteList) {
    const typsFiles = await fse.readJSON(getTypePathInCache(project, 'types.json'))
    linkTypes(project, typsFiles)
    log('Link success')
  }
})
cli.command('transform <dir> <to>', 'transform esm to systemjs').action(async (dir = '', to = 'system') => {
  const cwd = resolve(root, dir)
  const entries = await fg(['**/*'], { cwd })

  await fse.ensureDir(resolve(root, to))
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
})

cli.command('export', 'get remote module exports')
  .option('--project, -p [p]', '[string] project name')
  .action(async (options) => {
    const { project } = options
    const PubConfig = await getLocalContent(project, 'remoteList.json')
    for (const i of PubConfig.alias) {
      const text = await getLocalContent(project, `${i.url}.js`)
      log(`dubhe-${project}/${i.name}:`)
      log(`--${getLocalPath(project, `${i.url}.js`)}--`)
      console.table(findExports(text).map(item => item.name || item.type))
    }
  })
/**
 * experiment
 */
cli
  .command(
    'bundle ',
    'bundle external dependence for function-level treeshake',
  )
  .alias('b')
  .option('--outDir, -o [o]', '[string] outDir for vite output', {
    default: 'dist',
  })
  .action(async (option) => {
    const localConfig = await getWorkSpaceConfig()

    const deps = await analyseDep(localConfig)

    // const dependencies = deps.split('+')
    const files: string[] = []
    for (const depname in deps) {
      const pkgName = getPkgName(depname)
      const exportsStr = `${generateExports([...deps[depname]])}\n`
      log(`Create ${pkgName}.js`, 'grey')
      const filePath = resolve(root, 'dubhe-bundle', `${pkgName}.js`)
      files.push(filePath)
      await fse.outputFile(filePath, exportsStr, 'utf-8')
    }

    log('Bundle start')
    await buildExternal(option.outDir, files)
    log('Bundle finish')
    fse.remove(resolve(root, 'dubhe-bundle'))
    log('Remove dir', 'grey')
  })
// https://bundlephobia.com/api/size?package=vue@3.2.1&record=true

cli
  .command('analyse', 'analyse remote dependence')
  .alias('a')
  .action(async () => {
    const localConfig = await getWorkSpaceConfig()

    const dep = await analyseDep(localConfig)

    console.log(dep)
  })

cli.help()
cli.version(pkgs.version)

cli.parse()

