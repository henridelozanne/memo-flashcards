import { test, expect } from '@playwright/test'

test.describe('Session de révision', () => {
    test('Le bouton réviser est désactivé sans carte puis activé après ajout', async ({ page }) => {
      await page.goto('/')
      // Crée une collection vide
      await page.getByTestId('create-card').click()
      await page.getByLabel('Nom').fill('Collection vide')
      await page.getByTestId('create-btn').click()
      await page.getByText('Collection vide').click()
      // Bouton désactivé tant qu'il n'y a aucune carte
      await expect(page.getByTestId('review-collection-btn')).toBeDisabled()
      // Ajoute une carte
      await page.getByTestId('add-card-btn').click()
      await page.getByTestId('front-input').fill('Q1')
      await page.getByTestId('back-input').fill('A1')
      await page.getByTestId('add-card-submit').click()
      // Bouton activé après ajout d'au moins une carte
      await expect(page.getByTestId('review-collection-btn')).toBeEnabled()
    })

  test('Parcours complet de révision', async ({ page }) => {
    await page.goto('/')
    // Crée une collection et une carte
    await page.getByTestId('create-card').click()
    await page.getByLabel('Nom').fill('Collection test')
  await page.getByTestId('create-btn').click()
    await page.getByText('Collection test').click()
  await page.getByTestId('add-card-btn').click()
  await page.getByTestId('front-input').fill('Q1')
  await page.getByTestId('back-input').fill('A1')
  await page.getByTestId('add-card-submit').click()
    // Lance la révision
    await page.getByTestId('review-collection-btn').click()
    await expect(page.getByText('Q1')).toBeVisible()
    await page.getByText('Afficher la réponse').click()
    await expect(page.getByText('A1')).toBeVisible()
    // Clique sur une réponse
    await page.getByText('Bien retenu').click()
    await expect(page.getByText('Session terminée !')).toBeVisible()
    await page.getByText('Retour à mes collections').click()
    await expect(page.getByText('Collections')).toBeVisible()
  })
})
