import { type Page, expect } from '@playwright/test'

export async function isSymbolExist(page: Page) {
  await expect(page.getByTestId('vite-pub-btn')).toHaveClass('el-button')
  await expect(page.getByTestId('vite-pub-text')).toContainText('remote app component from viteout')
}
