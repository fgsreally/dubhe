/* eslint-disable no-console */
const { resolve } = require('path')
const axios = require('axios')
const cli = require('cac')()
const colors = require('colors')
const root = process.cwd()
const fse = require('fs-extra')
const dubheConfig = require(resolve(root, 'dubhe.cjs'))
const pkgs = require(resolve(root, 'package.json'))
const { getPackageInfo } = require('local-pkg')
const { buildExternal } = require('./build')

cli
  .command('detect', 'contrast cache version & remote version').alias('det')
  .action(async () => {
    for (const project in dubheConfig.remote) {
      const remoteConfig = await connectProject(dubheConfig.remote[project], project)

      try {
        const localConfig = fse.readJSONSync(resolve(root, '.dubhe', 'cache', project, 'remoteList.json'))
        if (localConfig.version !== remoteConfig.version) {
          log(`[${project}] is not the latest version(${localConfig.version}|${remoteConfig.version})`, 'yellow')
          continue
        }
        if (localConfig.timestamp !== remoteConfig.timestamp)
          log(`[${project}] cache may be out of date`, 'yellow')
      }
      catch (e) {
        log(`[${project}] remoteList.json doesn't exist`, 'red')
      }
    }
    log('Detect finish')
  })

cli
  .command('import <projectId>', 'import source code from <projectId>')
  .option('--path, -p [p]', '[string] dir path ', {
    default: '',
  }).action(async (projectId, option) => {
    if (!projectId)
      return
    const [project, id] = projectId.split('/')

    if (!dubheConfig.remote[project])
      log(`Project:${project} does't exist in dubhe.cjs`, 'red')

    const { data: remoteConfig } = await axios.get(
      `${dubheConfig.remote[project]}/core/remoteList.json`,
    )
    const file = remoteConfig.entryFileMap[id]
    if (!file)
      log(`Id:${id} does't exist in ${project}`, 'red')
    for (const i of remoteConfig.sourceGraph[file]) {
      const outputPath = resolve(root, option.path, project, i)

      if (!isExist(outputPath)) {
        try {
          downloadFile(
            `${dubheConfig.remote[project]}/source/${i}`,
            outputPath,
          )
        }
        catch (e) {
          log(`${i} doesn't exist`, 'red')
        }
      }
    }
  })

cli
  .command('delete <project>', 'delete cache from <project>').alias('del')
  .option('--cache, -c [c]', '[boolean] remove cache or not', {
    default: false,
  })
  .option('--types, -t [t]', '[boolean] remove types or not', {
    default: false,
  })
  .action(async (project, option) => {
    if (option.cache) {
      log(`Remove ${project} cache`)
      fse.remove(getCachePath(project))
    }

    if (option.types) {
      log(`Remove ${project} types`)
      fse.remove(getTypesPath(project))
    }
  })

cli
  .command('update <project>', 'force update <project>').alias('u')
  .option('--cache, -c [c]', '[boolean] update cache or not', {
    default: false,
  })
  .option('--types, -t [t]', '[boolean] update types or not', {
    default: false,
  })
  .action(async (project, option) => {
    if (option.cache) {
      log(`Update [${project}] cache`)
      await fse.remove(getCachePath(project))
      installProjectCache(dubheConfig.remote[project], project)
    }

    if (option.types) {
      log(`Update [${project}] types`)
      await fse.remove(getTypesPath(project))
      installProjectTypes(dubheConfig.remote[project], project)
    }
  })

cli
  .command('install', 'install cache').alias('i')
  .option('--types, -t [t]', '[boolean] install types', {
    default: false,
  })

  .action(async (option) => {
    for (const project in dubheConfig.remote) {
      try {
        installProjectCache(dubheConfig.remote[project], project)

        log(`Install [${project}] cache`)
      }
      catch (e) {
        log(`Install [${project}] cache fail`, 'red')
        console.error(e)
      }

      if (option.types) {
        try {
          installProjectTypes(dubheConfig.remote[project], project)

          log(`Install [${project}] types`)
        }
        catch (e) {
          log(`Install [${project}] types fail`, 'red')
          console.error(e)
        }
      }
    }
  })

/**
 * experiment
 */
cli
  .command('bundle <dependence>', 'bundle external dependence for function-level treeshake').alias('b')
  .option('--outDir, -o [o]', '[string] outDir for vite output', {
    default: 'dist',
  })
  .action(async (dependence, option) => {
    const dep = await analyseDep()
    if (dependence in dep) {
      if (dependence in pkgs.dependencies) {
        log(`Find ${dependence}@${pkgs.dependencies[dependence]}`)
        const filePath = getDubheDepJS()
        log('Create dubhe.dep.js', 'grey')
        await fse.outputFile(filePath, `export {${[...dep[dependence]].reduce((arr, cur) => `${arr}${cur},`, '')}} from '${dependence}'`)
        log('Bundle start')
        await buildExternal(dependence, option.outDir)
        log('Bundle finsih')
        fse.remove(filePath)
        log('Remove dubhe.dep.js', 'grey')
      }
      else {
        log(`${dependence} doesn't exist in package.json`, 'red')
      }
    }

    else { log(`${dependence} doesn't exist in dubhe-external`, 'red') }
  })
  // https://bundlephobia.com/api/size?package=vue@3.2.1&record=true

cli
  .command('analyse', 'analyse remote dependence').alias('a')
  .action(async () => {
    const dep = await analyseDep()

    console.log(dep)
  })
cli
  .command('size <size>', 'get dependence which is less than <size>').alias('s')
  .option('--entire, -e [e]', '[boolean]  show entire pkgs info ', {
    default: false,
  })
  .action(async (size, option) => {
    size = Number(size)
    if (typeof size !== 'number') {
      log('size should be a number', 'red')
      return
    }
    const ret = []
    for (const i in pkgs.dependencies) {
      try {
        const { version } = await getPackageInfo(i)
        const { data } = await axios.get(`https://bundlephobia.com/api/size?package=${i}@${version}`)
        if (data.gzip < size)
          ret.push(i)
        if (option.entire)
          log(`${i}@${version} cost ${data.gzip}`, 'grey')
      }
      catch (e) {
        log(`find package:${i} fail`, 'red')
      }
    }
    log('There are mini pkg-dependencies:')
    console.log(ret)
  })
cli.help()
cli.version(require('../package.json').version)

cli.parse()

function log(str, color = 'green') {
  console.log(colors[color](`${colors.cyan('[dubhe]')} ${str}`))
}

function isExist(p) {
  return fse.existsSync(p)
}

function getCachePath(project, file = '') {
  return resolve(root, '.dubhe', 'cache', project, file)
}

function getTypesPath(project, file = '') {
  return resolve(root, '.dubhe', 'types', project, file)
}

async function downloadFile(url, output) {
  const { data: code } = await axios.get(url)
  fse.outputFile(output, typeof code === 'string' ? code : JSON.stringify(code))
}

async function installProjectCache(baseUrl, project) {
  const remoteConfig = await connectProject(baseUrl, project)

  for (const file of remoteConfig.files) {
    const cachePath = getCachePath(project, file)
    installFile(`${baseUrl}/core/${file}`, cachePath)
  }
}

async function installProjectTypes(baseUrl, project) {
  const { data: typesConfig } = await axios.get(
    `${baseUrl}/types/types.json`,
  )
  for (const file of typesConfig) {
    const typesPath = getTypesPath(project, file)
    installFile(`${baseUrl}/types/${file}`, typesPath)
  }
}

function installFile(url, path) {
  if (!isExist(path)) {
    downloadFile(
      url,
      path,
    )
  }
}

async function connectProject(baseUrl, project) {
  const { data: remoteConfig } = await axios.get(
    `${baseUrl}/core/remoteList.json`,
  ).catch(() => {
    log(`can't connect [${project}]`, 'red')
    process.exit(0)
  })
  const listPath = getCachePath(project, 'remoteList.json')
  if (!isExist(listPath))
    fse.outputJSON(getCachePath(project, 'remoteList.json'), remoteConfig)

  return remoteConfig
}

async function getList(baseUrl, project) {
  const listPath = getCachePath(project, 'remoteList.json')

  if (isExist(listPath))
    return require(listPath)

  const { data } = await axios.get(`${baseUrl}/core/remoteList.json`)
  return data
}

async function analyseDep() {
  const ret = {}
  for (const project in dubheConfig.remote) {
    const listData = await getList(dubheConfig.remote[project], project)
    for (const dep in listData.importsGraph) {
      if (!ret[dep])
        ret[dep] = new Set()
      listData.importsGraph[dep].forEach(item => ret[dep].add(item))
    }
  }
  return ret
}

function getDubheDepJS() {
  return resolve(root, 'dubhe.dep.js')
}
