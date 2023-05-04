#!/usr/bin/env zx
import { $ } from 'zx'
import waitOn from 'wait-on'

const createOpts = ports => ({
  resources: ports.map(port => `http-get://localhost:${port}`),
  log: true,
  // vite project need to accept headers
  headers: {
    accept: '*/*',
  },
  validateStatus(status) {
    return status >= 200 && status < 300 // default if not provided
  },
})

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
  await waitOn(createOpts([8080, 8081]))
  SubDev()
  await HotBundle()
  await ColdBundle()
  await waitOn(createOpts([4100]))

  $`npm run test:e2e`
  $`npm run test:unit`
}

start()
