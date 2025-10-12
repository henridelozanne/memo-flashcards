<template>
  <div :class="orientation === 'horizontal' ? 'flex flex-row gap-1' : 'flex flex-col gap-1'">
    <div
      v-for="day in days"
      :key="day"
      :title="day"
      class="w-6 h-6 rounded border flex items-center justify-center"
      :class="{
        'bg-blue-500 border-blue-600 text-white': streakDays.has(day),
        'bg-gray-200 border-gray-300': !streakDays.has(day)
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  days: string[]
  streakDays: Set<string>
  orientation?: 'horizontal' | 'vertical'
}>()

</script>
