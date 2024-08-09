import { type Page, expect } from '@playwright/test'

export async function isSymbolExist(page: Page) {
  await expect(page.getByTestId('pub-btn')).toHaveClass('el-button')
  await expect(page.getByTestId('pub-text')).toContainText('msg')

  await page.getByTestId('update-msg').click()

  await expect(page.getByTestId('pub-text')).toContainText('new msg')
}
