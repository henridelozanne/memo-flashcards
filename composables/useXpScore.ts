import { ref } from 'vue'

const POINTS_PER_COMPARTMENT = 10
const STREAK_THRESHOLD = 5
const BOOST_MULTIPLIER = 2

export function useXpScore() {
  const xpScore = ref(0)
  const showBanner = ref(false)
  const isBoost = ref(false)
  const boostMilestone = ref(0)
  const earnedCompartment = ref(0)
  let streakCount = 0
  let bannerTimer: ReturnType<typeof setTimeout> | null = null

  function onCorrectAnswer(compartment: number) {
    streakCount += 1
    const boost = streakCount % STREAK_THRESHOLD === 0
    const multiplier = boost ? BOOST_MULTIPLIER : 1
    const earned = compartment * POINTS_PER_COMPARTMENT * multiplier

    earnedCompartment.value = compartment
    isBoost.value = boost
    if (boost) boostMilestone.value = streakCount
    xpScore.value += earned

    showBanner.value = true
    if (bannerTimer) clearTimeout(bannerTimer)
    bannerTimer = setTimeout(
      () => {
        showBanner.value = false
        bannerTimer = null
      },
      boost ? 2500 : 2000
    )
  }

  function onWrongAnswer() {
    streakCount = 0
  }

  return { xpScore, showBanner, isBoost, boostMilestone, earnedCompartment, onCorrectAnswer, onWrongAnswer }
}
