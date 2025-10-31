#!/usr/bin/env node

import { createTestData } from '../lib/testData.js'

async function main() {
  try {
    console.log('Création des données de test...')
    const collectionId = await createTestData()
    console.log('✅ Données de test créées avec succès !')
    console.log(`📚 Collection ID: ${collectionId}`)
    console.log("🎯 Les cartes sont maintenant dues pour révision aujourd'hui")
  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error)
    process.exit(1)
  }
}

main()
