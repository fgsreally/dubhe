import { test } from '@playwright/test'
import { DEV_EXAMPLE } from './config'
import { isSymbolExist } from './utils'
test.describe('import component from remote in dev mode', () => {
  test('component from pub should exist and work in sub', async ({ page }) => {
    await page.goto(DEV_EXAMPLE.SUB)
    // Assertions use the expect API.
    await isSymbolExist(page)
  })
})
