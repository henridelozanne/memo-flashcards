// MOCKS IN-MEMORY pour stats utilisateur (SPA/demo)
const mockSessions = [
  { date: '2025-10-10', cardsReviewed: 12 },
  { date: '2025-10-11', cardsReviewed: 15 },
  { date: '2025-10-12', cardsReviewed: 10 }
]
const mockLogs = [
  { response: 'true' }, { response: 'true' }, { response: 'false' },
  { response: 'true' }, { response: 'false' }, { response: 'true' },
  { response: 'true' }, { response: 'true' }, { response: 'true' },
  { response: 'true' }
]

export async function getReviewSessions() {
  // Simule un appel réseau
  await new Promise((resolve) => setTimeout(resolve, 50))
  return mockSessions
}

export async function getReviewLogs() {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return mockLogs
}
