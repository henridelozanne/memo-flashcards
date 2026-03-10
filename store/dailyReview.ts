import { defineStore } from 'pinia'

interface DailyReviewState {
  answeredCardsCount: number
  totalCardsDueCount: number
  showStreakModal: boolean
}

export const useDailyReviewStore = defineStore('dailyReview', {
  state: (): DailyReviewState => ({
    answeredCardsCount: 0,
    totalCardsDueCount: 0,
    showStreakModal: false,
  }),
  actions: {
    setAnsweredCardsCount(count: number) {
      this.answeredCardsCount = count
    },
    setTotalCardsDueCount(count: number) {
      this.totalCardsDueCount = count
    },
    setShowStreakModal(value: boolean) {
      this.showStreakModal = value
    },
  },
})
