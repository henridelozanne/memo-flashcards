import { defineStore } from 'pinia'

interface DailyReviewState {
  answeredCardsCount: number
  totalCardsDueCount: number
}

export const useDailyReviewStore = defineStore('dailyReview', {
  state: (): DailyReviewState => ({
    answeredCardsCount: 0,
    totalCardsDueCount: 0,
  }),
  actions: {
    setAnsweredCardsCount(count: number) {
      this.answeredCardsCount = count
    },
    setTotalCardsDueCount(count: number) {
      this.totalCardsDueCount = count
    },
  },
})
