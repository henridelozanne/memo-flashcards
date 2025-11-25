<template>
  <div class="bar-chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels)

const { t } = useI18n()

const props = defineProps<{
  hourlyData: number[]
}>()

const chartData = computed(() => ({
  labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
  datasets: [
    {
      data: props.hourlyData,
      backgroundColor: 'rgba(95, 51, 225, 0.8)',
      borderColor: 'rgba(95, 51, 225, 1)',
      borderWidth: 0,
      borderRadius: 6,
      barThickness: 8,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 30,
      bottom: 10,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 13,
      },
      bodyFont: {
        size: 13,
      },
      displayColors: false,
      callbacks: {
        title: (items: { label: string }[]) => `${items[0].label}`,
        label: (item: { parsed: { y: number | null } }) => {
          const value = item.parsed.y ?? 0
          return t('stats.session', { count: value }, value)
        },
      },
    },
    datalabels: {
      display: false,
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        color: '#6e6a7c',
        font: {
          size: 10,
        },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 12,
      },
      border: {
        display: false,
      },
    },
    y: {
      display: false,
      beginAtZero: true,
    },
  },
}))

defineOptions({ name: 'HourlyReviewChart' })
</script>

<style scoped>
.bar-chart-container {
  height: 200px;
  width: 100%;
}
</style>
