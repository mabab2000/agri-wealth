<template>
  <!-- Sidebar -->
  <div :class="[
    'fixed left-0 h-full bg-white shadow-xl z-10 transition-all duration-300 ease-in-out border-r border-gray-200',
    sidebarCollapsed ? 'w-16' : 'w-64'
  ]" style="top: 64px;">
    <div class="flex flex-col h-full">
      <!-- Logo Section -->
      <div class="flex items-center justify-center h-16 bg-white border-b border-gray-200">
        <div v-if="!sidebarCollapsed" class="flex items-center">
          <Logo :compact="true" />
        </div>
        <div v-else>
          <Logo :compact="true" :show-text="false" />
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        <!-- Dashboard Link -->
        <router-link
          to="/dashboard"
          :class="[
            'w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            $route.path === '/dashboard' ? 'bg-rwanda-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          ]"
        >
          <BarChart3 :size="20" />
          <span v-if="!sidebarCollapsed" class="ml-3">Dashboard</span>
        </router-link>

        <!-- Folders Link -->
        <router-link
          to="/folders"
          :class="[
            'w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            $route.path === '/folders' ? 'bg-rwanda-blue text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          ]"
        >
          <FolderOpen :size="20" />
          <span v-if="!sidebarCollapsed" class="ml-3">Data Lake</span>
        </router-link>
      </nav>

      <!-- User Info and Logout -->
      <div class="p-4 border-t border-gray-200">
        <div v-if="!sidebarCollapsed" class="flex items-center space-x-3 mb-3">
          <div class="w-8 h-8 bg-rwanda-green rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-medium">{{ userInitials }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          :class="[
            'w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors',
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          ]"
        >
          <LogOut :size="20" />
          <span v-if="!sidebarCollapsed" class="ml-3">Logout</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import {
  Menu,
  BarChart3,
  FolderOpen,
  LogOut
} from 'lucide-vue-next'
import Logo from './Logo.vue'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-sidebar'])
const router = useRouter()
const toast = useToast()

const sidebarCollapsed = ref(props.collapsed)
const userInfo = ref({})

const userName = computed(() => {
  return userInfo.value?.name || userInfo.value?.fullName || 'User'
})

const userEmail = computed(() => {
  return userInfo.value?.email || 'user@example.com'
})

const userInitials = computed(() => {
  const name = userName.value
  return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2)
})

// Sidebar toggle is now handled by the Header component

const handleLogout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  
  toast.info('You have been logged out successfully')
  router.push('/')
}

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      userInfo.value = JSON.parse(userData)
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
  }
})
</script>