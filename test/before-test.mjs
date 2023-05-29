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
  $`pnpm --filter=sub-vite run dev`
}
async function FinalBuild() {
  await $`pnpm --filter final-vite run hot`
  await $`pnpm --filter final-vite run cold`
}
async function start() {
  await PubBundle()
  Serve()
  await waitOn(createOpts([8080, 8081]))
  SubDev()
  await HotBundle()
  await ColdBundle()
  await waitOn(createOpts([4100, 8082, 8083, 8085]))
  await FinalBuild()
  await $`npm run test:unit`
  await $`npm run test:e2e`
  process.exit(0)
}

start()
