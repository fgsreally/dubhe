import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 100000,
    globals: true,
    globalSetup: [
      './test/globalSetup/setup.ts',
    ],
  },
})
