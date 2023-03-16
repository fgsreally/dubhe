import { expect, test } from '@playwright/test'

test.describe('should import component from remote [dev]', () => {
  test.beforeAll(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('http://localhost:4100/')
  })

  test('component from vite-pub should exist and work', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page.getByTestId('vite-pub-btn')).toHaveClass('el-button')
    await expect(page.getByTestId('vite-pub-text')).toContainText('substring')
  })
  test('component from esbuild-pub should exist and work', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page.getByTestId('esbuild-pub-btn')).toHaveClass('el-button')
    await expect(page.getByTestId('esbuild-pub-text')).toHaveClass('el-button')
  })
})
