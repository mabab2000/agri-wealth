<template>
  <header class="bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-20">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Left Side: Menu Button, Logo, and Page Title -->
        <div class="flex items-center space-x-4">
          <button
            @click="$emit('toggle-sidebar')"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu :size="20" class="text-gray-600" />
          </button>
          <!-- App Logo -->
          <Logo :compact="true" :show-text="false" />
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
import { Menu } from 'lucide-vue-next'
import Logo from './Logo.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  },
  sidebarCollapsed: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-sidebar'])
</script>