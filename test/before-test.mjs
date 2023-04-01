#!/usr/bin/env zx
import { $ } from 'zx'

process.env.PATH = `/usr/local/bin:${process.env.PATH}`

export function sleep(ms = 5000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function HotBundle() {
  return $`npm run example:hot`
}

function ColdBundle() {
  return $`npm run example:cold`
}

async function PubBundle() {
  await $`npm run example:pub`
}
function Serve() {
  $`npm run example:serve`
}

function SubDev() {
  $`npm run example:sub`
}
async function start() {
  await PubBundle()
  Serve()
  await sleep()
  SubDev()
  await HotBundle()
  await ColdBundle()
  $`npm run test:unit`
  $`npm run test:e2e`
}

start()
