import { useDatabase } from '~/composables/useDatabase'
import { v4 as uuidv4 } from 'uuid'

export const createTestData = async () => {
  const { getDbConnection } = useDatabase()
  const db = await getDbConnection()
  const now = Date.now()
  const userId = 'default-user'

  try {
    // Créer une collection de test
    const collectionId = uuidv4()
    await db.run(`INSERT INTO collections (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`, [
      collectionId,
      userId,
      'Collection Test - Cartes Dues',
      now,
      now,
    ])

    console.log('Collection créée:', collectionId)

    // Créer des cartes dues aujourd'hui (compartment 1-4, next_review_at <= now)
    const testCards = [
      {
        question: 'Quelle est la capitale de la France ?',
        answer: 'Paris',
        compartment: 1,
        nextReviewAt: now - 1000 * 60 * 60, // 1 heure dans le passé
      },
      {
        question: 'Combien font 2 + 2 ?',
        answer: '4',
        compartment: 2,
        nextReviewAt: now - 1000 * 60 * 30, // 30 minutes dans le passé
      },
      {
        question: 'Quelle est la couleur du ciel par temps clair ?',
        answer: 'Bleu',
        compartment: 3,
        nextReviewAt: now - 1000 * 60 * 15, // 15 minutes dans le passé
      },
      {
        question: 'Quel est le plus grand océan du monde ?',
        answer: "L'océan Pacifique",
        compartment: 4,
        nextReviewAt: now, // exactement maintenant
      },
      {
        question: 'En quelle année a eu lieu la Révolution française ?',
        answer: '1789',
        compartment: 1,
        nextReviewAt: now - 1000 * 60 * 45, // 45 minutes dans le passé
      },
      {
        question: "Quelle est la formule chimique de l'eau ?",
        answer: 'H₂O',
        compartment: 2,
        nextReviewAt: now - 1000 * 60 * 20, // 20 minutes dans le passé
      },
      {
        question: 'Combien y a-t-il de continents sur Terre ?',
        answer: '7',
        compartment: 3,
        nextReviewAt: now - 1000 * 60 * 10, // 10 minutes dans le passé
      },
      {
        question: 'Quel est le langage de programmation utilisé pour cette app ?',
        answer: 'TypeScript',
        compartment: 1,
        nextReviewAt: now - 1000 * 60 * 60 * 2, // 2 heures dans le passé
      },
    ]

    for (const card of testCards) {
      const cardId = uuidv4()
      await db.run(
        `INSERT INTO cards (
          id, user_id, collection_id, question, answer, compartment,
          next_review_at, created_at, updated_at, correct_answers, total_reviews
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cardId,
          userId,
          collectionId,
          card.question,
          card.answer,
          card.compartment,
          card.nextReviewAt,
          now,
          now,
          Math.floor(Math.random() * 5), // correct_answers aléatoires
          Math.floor(Math.random() * 10), // total_reviews aléatoires
        ]
      )
      console.log('Carte créée:', card.question)
    }

    console.log(`Données de test créées avec succès ! Collection ID: ${collectionId}`)
    console.log(`Nombre de cartes dues aujourd'hui: ${testCards.length}`)

    return collectionId
  } catch (error) {
    console.error('Erreur lors de la création des données de test:', error)
    throw error
  }
}
