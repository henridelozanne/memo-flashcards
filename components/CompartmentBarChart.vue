<template>
  <div class="bar-chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels)

const props = defineProps<{
  compartmentData: number[]
}>()

const chartData = computed(() => ({
  labels: ['1', '2', '3', '4', '5'],
  datasets: [
    {
      data: props.compartmentData,
      backgroundColor: 'rgba(95, 51, 225, 0.8)',
      borderColor: 'rgba(95, 51, 225, 1)',
      borderWidth: 0,
      borderRadius: 8,
      barThickness: 40,
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
      enabled: false,
    },
    datalabels: {
      anchor: 'end' as const,
      align: 'end' as const,
      offset: 4,
      color: '#6e6a7c',
      font: {
        size: 12,
        weight: 600,
      },
      formatter: (value: number) => (value > 0 ? value : ''),
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
          size: 12,
          weight: 600,
        },
      },
      border: {
        display: false,
      },
    },
    y: {
      display: false,
      grid: {
        display: false,
      },
      beginAtZero: true,
    },
  },
}))
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: 220px;
}
</style>
