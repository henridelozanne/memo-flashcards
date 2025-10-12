import { test, expect } from '@playwright/test'

test('homepage shows app name', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toContainText('Memo Flashcards')
})
