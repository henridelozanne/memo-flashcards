<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header with static buttons -->
    <div class="flex items-center justify-between px-4 py-2">
      <h1 class="text-xl font-bold text-center flex-1">Collections (test statique)</h1>
      <div class="flex gap-2 items-center">
        <button class="p-2 text-gray-500 hover:text-gray-700"><span>📊</span></button>
        <button class="p-2 text-yellow-500 hover:text-yellow-600"><span>👑</span></button>
        <button class="p-2 text-gray-400 hover:text-gray-600"><span>❓</span></button>
      </div>
    </div>
    <!-- Grid of collections (static mock) -->
    <div class="flex-1 overflow-y-auto px-4 pb-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="collection in collections" :key="collection.id" class="bg-white rounded-lg shadow p-4 flex flex-col items-center cursor-pointer hover:bg-gray-100 transition">
          <div class="font-semibold text-lg text-center">{{ collection.name }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ collection.cardCount }} cards</div>
        </div>
        <!-- Create Collection Card -->
        <div class="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-100 transition min-h-[96px]">
          <span class="text-3xl text-gray-400 mb-1">+</span>
          <span class="text-sm text-gray-500">Create collection</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const collections = ref([
  { id: '1', name: 'Vocabulaire', cardCount: 12 },
  { id: '2', name: 'Histoire', cardCount: 8 },
  { id: '3', name: 'Maths', cardCount: 20 }
])
</script>

<style scoped>
/* Icônes remplacées par emoji pour compatibilité immédiate */
</style>
