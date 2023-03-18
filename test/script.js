import { execa } from 'execa'

export function sleep(ms = 2000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function SubBundle() {
  await Promise.all([execa('npm run build:cold'), execa('npm run build:hot')])
}

async function PubBundle() {
  await execa('npm run example:pub')
}
function dev() {
  execa('npm run example:preview')
}

function SubDev() {
  execa('npm run example:sub')
}
async function start() {
  await PubBundle()
  dev()
  await sleep()
  // SubDev()
  console.log('start test')

  // await SubBundle()
}

start()
