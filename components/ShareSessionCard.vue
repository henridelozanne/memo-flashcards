<template>
  <div class="share-card">
    <!-- Header -->
    <div class="share-card__header">
      <img src="/cortx_logo_transparent_background.png" class="share-card__logo" alt="Cortx" />
      <span class="share-card__brand">Cortx</span>
    </div>

    <!-- Body -->
    <div class="share-card__body">
      <div class="share-card__title">{{ $t('review.sessionFinished') }} 🎉</div>

      <div class="share-card__score">{{ goodCount }} / {{ cardsReviewedCount }}</div>
      <div class="share-card__score-label">{{ $t('review.shareCardCardsReviewed') }}</div>

      <div class="share-card__progress-track">
        <div class="share-card__progress-fill" :style="{ width: successRate + '%' }" />
      </div>

      <div class="share-card__success-rate">{{ successRate }}% {{ $t('review.shareCardSuccessRate') }}</div>

      <div v-if="xpScore > 0" class="share-card__xp">+{{ xpScore }} XP 🔥</div>
    </div>

    <!-- Footer -->
    <div class="share-card__footer">cortx.app</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  cardsReviewedCount: { type: Number, required: true },
  goodCount: { type: Number, required: true },
  successRate: { type: Number, required: true },
  xpScore: { type: Number, default: 0 },
})
</script>

<style scoped>
.share-card {
  width: 600px;
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Lexend Deca', Helvetica, sans-serif;
}

.share-card__header {
  background: linear-gradient(135deg, rgba(95, 51, 225, 1) 0%, #ab93ff 100%);
  padding: 28px 36px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.share-card__logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.share-card__brand {
  font-size: 30px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.share-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 40px 28px;
  gap: 6px;
  background: #ffffff;
}

.share-card__title {
  font-size: 22px;
  font-weight: 600;
  color: rgba(36, 37, 44, 1);
  margin-bottom: 20px;
}

.share-card__score {
  font-size: 76px;
  font-weight: 700;
  color: rgba(95, 51, 225, 1);
  line-height: 1;
}

.share-card__score-label {
  font-size: 18px;
  color: rgba(110, 106, 124, 1);
  margin-bottom: 24px;
}

.share-card__progress-track {
  width: 100%;
  height: 14px;
  background: #eee9ff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 6px;
}

.share-card__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(95, 51, 225, 1) 0%, #ab93ff 100%);
  border-radius: 8px;
}

.share-card__success-rate {
  font-size: 17px;
  color: rgba(110, 106, 124, 1);
  margin-bottom: 16px;
}

.share-card__xp {
  font-size: 30px;
  font-weight: 700;
  color: #f97316;
}

.share-card__footer {
  padding: 16px 36px;
  text-align: center;
  font-size: 15px;
  color: rgba(110, 106, 124, 1);
  border-top: 1px solid #eee9ff;
  letter-spacing: 0.5px;
}
</style>
