<template>
  <header class="bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-20">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Left Side: Logo and Page Title -->
        <div class="flex items-center space-x-3">
          <img src="/agro-wealth-logo.svg" alt="Agro Wealth Logo" class="h-8 w-auto" />
          <h1 class="text-xl font-semibold text-gray-900">{{ title }}</h1>
        </div>

        <!-- Right Side Content -->
        <div class="flex items-center space-x-4">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  }
})
</script>