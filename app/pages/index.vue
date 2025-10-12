<template><template>

  <div class="min-h-screen bg-gray-50 p-6">  <div class="min-h-screen bg-gray-50 p-6">

    <div class="flex items-center justify-between mb-6">    <div class="flex items-center justify-between mb-6">

      <h1 class="text-2xl font-bold">Collections</h1>      <h1 class="text-2xl font-bold">Collections</h1>

      <div class="flex gap-2">      <div class="flex gap-2">

        <button class="bg-blue-100 text-blue-700 rounded px-3 py-1 text-sm">Stats</button>        <button class="bg-blue-100 text-blue-700 rounded px-3 py-1 text-sm">Stats</button>

        <button class="bg-yellow-100 text-yellow-700 rounded px-3 py-1 text-sm">Premium</button>        <button class="bg-yellow-100 text-yellow-700 rounded px-3 py-1 text-sm">Premium</button>

        <button class="bg-gray-200 text-gray-700 rounded px-3 py-1 text-sm">Aide</button>        <button class="bg-gray-200 text-gray-700 rounded px-3 py-1 text-sm">Aide</button>

      </div>      </div>

    </div>    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

      <!-- Carte +Créer une collection -->      <!-- Carte +Créer une collection -->

      <div class="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-6 bg-white cursor-pointer hover:bg-blue-50 transition">      <div class="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-6 bg-white cursor-pointer hover:bg-blue-50 transition">

        <span class="text-4xl text-blue-400 mb-2">+</span>        <span class="text-4xl text-blue-400 mb-2">+</span>

        <span class="font-medium text-blue-700">Créer une collection</span>        <span class="font-medium text-blue-700">Créer une collection</span>

      </div>      </div>

      <!-- Collections statiques pour test -->      <!-- Collections statiques pour test -->

      <div v-for="col in 3" :key="col" class="flex flex-col border rounded-lg p-4 bg-white shadow hover:shadow-md transition cursor-pointer">      <div v-for="col in 3" :key="col" class="flex flex-col border rounded-lg p-4 bg-white shadow hover:shadow-md transition cursor-pointer">

        <div class="font-semibold text-lg mb-2">Collection {{ col }}</div>        <div class="font-semibold text-lg mb-2">Collection {{ col }}</div>

        <div class="text-gray-500 text-sm mb-4">{{ 12 * col }} cartes</div>        <div class="text-gray-500 text-sm mb-4">{{ 12 * col }} cartes</div>

        <div class="flex gap-2 mt-auto">        <div class="flex gap-2 mt-auto">

          <button class="text-xs text-blue-600 hover:underline">Modifier</button>          <button class="text-xs text-blue-600 hover:underline">Modifier</button>

          <button class="text-xs text-red-500 hover:underline">Supprimer</button>          <button class="text-xs text-red-500 hover:underline">Supprimer</button>

        </div>        </div>

      </div>      </div>

    </div>    </div>

  </div>  </div>

</template></template>
