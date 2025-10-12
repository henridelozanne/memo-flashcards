import { test, expect } from '@playwright/test'

test.describe('Collections Grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

    test('should display empty state when no collections exist', async ({ page }) => {
      // Attendre qu'au moins un des éléments soit présent
      await page.waitForSelector('[data-testid="loading"], [data-testid="create-card"]', { state: 'attached' })
      const loading = page.getByTestId('loading')
      if (await loading.isVisible().catch(() => false)) {
        await loading.waitFor({ state: 'detached' })
      }

      // Vérifier la carte de création
      await expect(page.getByTestId('create-card')).toBeVisible()
  })

  test('should navigate to create collection page', async ({ page }) => {
    // Cliquer sur la carte de création
      await page.getByTestId('create-card').click()
    
    // Vérifier la navigation
    await expect(page).toHaveURL('/collections/create')
      await expect(page.getByTestId('heading-create')).toBeVisible()
    await expect(page.getByPlaceholder('Ex: Vocabulaire anglais')).toBeVisible()
  })

  test('should create a new collection and display it in grid', async ({ page }) => {
    // Aller à la page de création
      await page.getByTestId('create-card').click()
    
    // Remplir le formulaire
  await page.getByPlaceholder('Ex: Vocabulaire anglais').fill('Ma première collection')
  await page.getByTestId('create-btn').click()
    
  // Attendre la redirection automatique
  await expect(page).toHaveURL('/')
    
    // Vérifier que la collection apparaît dans la grille
  await expect(page.getByText('Ma première collection')).toBeVisible()
  await expect(page.getByText(/0 carte/)).toBeVisible()
  })

  test('should edit an existing collection', async ({ page }) => {
    // Créer d'abord une collection
      await page.getByTestId('create-card').click()
    await page.getByPlaceholder('Ex: Vocabulaire anglais').fill('Collection à modifier')
    await page.getByRole('button', { name: 'Créer' }).click()
    await page.waitForURL('/')
    
    // Cliquer sur modifier (utiliser le bouton spécifiquement)
    await page.getByRole('button', { name: 'Modifier' }).click()
    
    // Vérifier la navigation vers la page d'édition
      await expect(page.getByTestId('heading-edit')).toBeVisible()
    
    // Le champ devrait être pré-rempli
    const input = page.getByPlaceholder('Ex: Vocabulaire anglais')
    await expect(input).toHaveValue('Collection à modifier')
    
    // Modifier le nom
    await input.fill('Collection modifiée')
  const saveBtn = page.getByRole('button', { name: 'Enregistrer' })
  await expect(saveBtn).toBeEnabled()
  await saveBtn.click()
    
    // Attendre la redirection
    await page.waitForURL('/')
    
    // Vérifier que le nom a été mis à jour
    await expect(page.getByText('Collection modifiée')).toBeVisible()
    await expect(page.getByText('Collection à modifier')).not.toBeVisible()
  })

  test('should delete a collection with confirmation', async ({ page }) => {
    // Créer une collection
      await page.getByTestId('create-card').click()
    await page.getByPlaceholder('Ex: Vocabulaire anglais').fill('Collection à supprimer')
    await page.getByRole('button', { name: 'Créer' }).click()
    await page.waitForURL('/')
    
    // Cliquer sur supprimer (utiliser le bouton spécifiquement)
    await page.getByRole('button', { name: 'Supprimer' }).click()
    
    // Vérifier que la modal de confirmation s'ouvre
  await expect(page.getByRole('heading', { name: 'Supprimer la collection' })).toBeVisible()
    await expect(page.getByText('Êtes-vous sûr de vouloir supprimer la collection "Collection à supprimer" ?')).toBeVisible()
    await expect(page.getByText('Cette action est irréversible.')).toBeVisible()
    
    // Annuler d'abord
    await page.getByRole('button', { name: 'Annuler' }).click()
    
    // Vérifier que la collection est toujours là
    await expect(page.getByText('Collection à supprimer')).toBeVisible()
    
    // Supprimer pour de vrai
    await page.getByRole('button', { name: 'Supprimer' }).first().click()
    await page.getByRole('button', { name: 'Supprimer' }).last().click()
    
    // Vérifier que la collection a disparu
    await expect(page.getByText('Collection à supprimer')).not.toBeVisible()
  })

  test('should display multiple collections', async ({ page }) => {
    // Créer plusieurs collections
    const collections = ['Anglais', 'Espagnol', 'Mathématiques']
    
    for (const name of collections) {
        await page.getByTestId('create-card').click()
      await page.getByPlaceholder('Ex: Vocabulaire anglais').fill(name)
      await page.getByRole('button', { name: 'Créer' }).click()
      await page.waitForURL('/')
    }
    
    // Vérifier que toutes les collections sont affichées
    for (const name of collections) {
      await expect(page.getByText(name)).toBeVisible()
    }
    
    // Vérifier qu'il n'y a pas d'état vide
    await expect(page.getByText('Aucune collection')).not.toBeVisible()
  })

  test('should validate collection name uniqueness', async ({ page }) => {
    // Créer une première collection
      await page.getByTestId('create-card').click()
    await page.getByPlaceholder('Ex: Vocabulaire anglais').fill('Collection unique')
    await page.getByRole('button', { name: 'Créer' }).click()
    await page.waitForURL('/')
    
    // Essayer de créer une collection avec le même nom
      await page.getByTestId('create-card').click()
    await page.getByPlaceholder('Ex: Vocabulaire anglais').fill('Collection unique')
    await page.getByRole('button', { name: 'Créer' }).click()
    
    // Vérifier l'erreur
    await expect(page.getByText('Collection with this name already exists')).toBeVisible()
    
    // La redirection ne devrait pas avoir lieu
    await expect(page).toHaveURL('/collections/create')
  })

  test('should show loading state during operations', async ({ page }) => {
    // Vérifier l'état de chargement initial
    await expect(page.getByText('Chargement des collections...')).toBeVisible()
    
    // Attendre que le chargement se termine
    await expect(page.getByText('Chargement des collections...')).not.toBeVisible()
  })

  test('should handle navigation between pages', async ({ page }) => {
    // Créer une collection
      await page.getByTestId('create-card').click()
    await page.getByPlaceholder('Ex: Vocabulaire anglais').fill('Test Navigation')
    await page.getByRole('button', { name: 'Créer' }).click()
    await page.waitForURL('/')
    
    // Aller à la page d'édition
    await page.getByText('Modifier').click()
    await expect(page).toHaveURL(/\/collections\/.+\/edit/)
    
    // Utiliser le bouton retour
    await page.getByLabel('Retour').click()
    await expect(page).toHaveURL('/')
    
    // La collection devrait toujours être visible
    await expect(page.getByText('Test Navigation')).toBeVisible()
  })
})