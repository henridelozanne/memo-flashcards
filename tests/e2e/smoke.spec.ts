import { test, expect } from '@playwright/test'

test('homepage shows collections heading', async ({ page }) => {
  await page.goto('/')
  // Wait for either loading or the grid to show up
  await page.waitForSelector('[data-testid="loading"], [data-testid="create-card"]', { state: 'attached' })
  const loading = page.getByTestId('loading')
  if (await loading.isVisible().catch(() => false)) {
    await loading.waitFor({ state: 'detached' })
  }
  await expect(page.getByTestId('create-card')).toBeVisible()
})
