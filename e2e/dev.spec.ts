import { test } from '@playwright/test'
import { DEV_EXAMPLE } from './config'
import { isSymbolExist } from './utils'
test.describe('import component from remote [dev]', () => {
  test('component from vite-pub should exist and work in vite sub', async ({ page }) => {
    await page.goto(DEV_EXAMPLE.VITE_SUB)
    // Assertions use the expect API.
    await isSymbolExist(page)
  })
})
