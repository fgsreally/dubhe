import { test } from '@playwright/test'
import { PROD_EXAMPLE } from './config'
import { isSymbolExist } from './utils'
test.describe('import component from remote in prod mode', () => {
  test('components should exist in dynamic mode', async ({ page }) => {
    await page.goto(`${PROD_EXAMPLE.DYNAMIC}`)
    await isSymbolExist(page)
  })
  test('components should exist in static mode', async ({ page }) => {
    await page.goto(`${PROD_EXAMPLE.STATIC}`)
    await isSymbolExist(page)
  })
})
