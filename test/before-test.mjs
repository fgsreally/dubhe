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

export function stop(timeout) {
  return new Promise(resolve => setTimeout(() => resolve(), timeout))
}

async function start() {
  await Promise.all([
    $`pnpm --filter=pub run dev`,
    $`pnpm --filter=pub run build`,
    $`pnpm --filter=pub run preview`,
  ])

  //    $`pnpm --filter=pub run  '/(build|preview|dev)/'`,

  //    $`pnpm --filter=sub run  '/^(dev|build:(dynamic|static)|preview:(dynamic|static))$/'`,

  await Promise.all([
    $`pnpm --filter=sub run dev`,
    $`pnpm --filter=sub run build:dynamic`,
    $`pnpm --filter=sub run build:static`,
    $`pnpm --filter=sub run preview:dynamic`,
    $`pnpm --filter=sub run preview:static`,
  ])
  await waitOn(createOpts([4000, 4001, 5000, 5001, 5002]))

  await stop(10000)

  await $`npm run test:unit`
  await $`npm run test:e2e`

  process.exit(0)
}

start()
