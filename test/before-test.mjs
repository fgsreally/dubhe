#!/usr/bin/env zx
import { $ } from 'zx'
import waitOn from 'wait-on'

const opts = {
  resources: [4100].map(port => `http-get://localhost:${port}`),
  log: true,
  // vite project need to accept headers
  headers: {
    accept: '*/*',
  },
  validateStatus(status) {
    return status >= 200 && status < 300 // default if not provided
  },
}

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
  await waitOn(opts)

  $`npm run test:unit`
  $`npm run test:e2e`
}

start()
