import { test } from '@playwright/test'
import { PROD_EXAMPLE } from './config'
import { isSymbolExist } from './utils'
test.describe('import component from remote [prod]', () => {
  test('components should exist in vite-sub in hot mode', async ({ page }) => {
    await page.goto(`${PROD_EXAMPLE.VITE_SUB}dist/hot/core/index.html`)
    await isSymbolExist(page)
  })
  test('components should exist and work in vite-sub in cold mode', async ({ page }) => {
    await page.goto(`${PROD_EXAMPLE.VITE_SUB}dist/cold/core/index.html`)
    await isSymbolExist(page)
  })
  test('components exist in vite-final in hot mode', async ({ page }) => {
    await page.goto(`${PROD_EXAMPLE.VITE_FINAL}dist/hot/index.html`)
    await isSymbolExist(page)
  })
  test('components exist in vite-final in cold mode', async ({ page }) => {
    await page.goto(`${PROD_EXAMPLE.VITE_FINAL}dist/cold/index.html`)
    await isSymbolExist(page)
  })
  // test('components exist in vue-cli in hot mode', async ({ page }) => {
  //   await page.goto(`${PROD_EXAMPLE.VUE_CLI}dist/hot/index.html`)
  //   await isSymbolExist(page)
  // })
  test('components exist in vue-cli in cold mode', async ({ page }) => {
    await page.goto(`${PROD_EXAMPLE.VUE_CLI}dist/cold/index.html`)
    await isSymbolExist(page)
  })
})
