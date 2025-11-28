<template>
  <header class="bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-20">
    <div class="px-2 sm:px-4 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Left Side: Mobile Menu + Logo and Page Title -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          <!-- Mobile Menu Toggle (only visible on mobile) -->
          <button
            @click="$emit('toggle-sidebar')"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu :size="20" class="text-gray-600" />
          </button>
          <img src="/agro-wealth-logo.svg" alt="Agro Wealth Logo" class="h-6 sm:h-8 w-auto" />
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 truncate">{{ title }}</h1>
        </div>

        <!-- Right Side Content -->
        <div class="flex items-center space-x-2 sm:space-x-4">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Menu } from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    default: 'Analyzer'
  }
})
</script>