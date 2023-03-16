import execa from 'execa'

export function sleep(ms = 2000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function SubBundle() {
  await Promise.all([execa('npm run build:cold'), execa('npm run build:hot')])
}

async function PubBundle() {
  await execa('npm run example:build')
}
function dev() {
  execa('npm run example:preview')
  execa('npm run example:dev')
}

async function start() {
  await PubBundle()
  dev()
  await sleep()
  await SubBundle()
}

start()
