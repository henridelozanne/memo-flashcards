#!/usr/bin/env node

import { createTestData } from '../lib/testData.js'

async function main() {
  try {
    const collectionId = await createTestData()
  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error)
    process.exit(1)
  }
}

main()
