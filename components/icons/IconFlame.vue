<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="4.5 2.5 15 20" fill="none" v-bind="$attrs">
    <defs>
      <linearGradient id="icon-flame-g" x1="12" y1="24" x2="12" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#c0380a" />
        <stop offset="15%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#fde047" />
      </linearGradient>
    </defs>
    <path
      :fill="fillColor"
      stroke="none"
      d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ color?: string }>()
const fillColor = computed(() => props.color ?? 'url(#icon-flame-g)')
</script>
