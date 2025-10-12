import { test, expect } from '@playwright/test'

test.describe('Session de révision', () => {
  test('Le bouton réviser est désactivé si aucune carte', async ({ page }) => {
    await page.goto('/')
    // Crée une collection sans carte
    await page.getByTestId('create-card').click()
    await page.getByLabel('Nom').fill('Collection vide')
    await page.getByText('Créer').click()
    await page.getByText('Collection vide').click()
    // Le bouton doit être désactivé
    await expect(page.getByTestId('review-collection-btn')).toBeDisabled()
  })

  test('Parcours complet de révision', async ({ page }) => {
    await page.goto('/')
    // Crée une collection et une carte
    await page.getByTestId('create-card').click()
    await page.getByLabel('Nom').fill('Collection test')
    await page.getByText('Créer').click()
    await page.getByText('Collection test').click()
    await page.getByTestId('add-card-btn').click()
    await page.getByLabel('Question').fill('Q1')
    await page.getByLabel('Réponse').fill('A1')
    await page.getByText('Ajouter').click()
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
