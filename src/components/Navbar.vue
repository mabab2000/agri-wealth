<template>
  <!-- Sidebar / Top Nav -->
  <div :class="[
    'fixed bg-white shadow-xl z-40 transition-all duration-300 ease-in-out border-gray-200',
    // Desktop: sidebar on left
    'md:left-0 md:h-full md:border-r',
    sidebarCollapsed ? 'md:w-16' : 'md:w-64',
    // Mobile: top navbar
    'max-md:left-0 max-md:right-0 max-md:border-b max-md:h-auto',
    sidebarCollapsed ? 'max-md:-translate-y-full max-md:opacity-0' : 'max-md:translate-y-0 max-md:opacity-100'
  ]" :style="{
    top: '64px'
  }">
    <!-- Mobile overlay -->
    <div 
      v-if="!sidebarCollapsed" 
      class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" 
      @click="toggleSidebar"
    ></div>
    <div :class="[
      'flex h-full',
      // Desktop: column layout
      'md:flex-col',
      // Mobile: column layout (same as desktop)
      'max-md:flex-col'
    ]">
      <!-- Toggle Section -->
      <div :class="[
        'flex items-center bg-white border-gray-200',
        // Desktop: top section
        'md:justify-end md:h-12 md:border-b md:pr-2',
        // Mobile: top section (same as desktop)
        'max-md:justify-end max-md:h-12 max-md:border-b max-md:pr-2'
      ]">
        <!-- Toggle Button -->
        <button
          @click="toggleSidebar"
          class="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <Menu :size="16" class="text-gray-600" />
        </button>
      </div>

      <!-- Navigation -->
      <nav :class="[
        'px-2 py-2 overflow-y-auto',
        // Desktop: vertical layout
        'md:flex-1 md:space-y-2',
        // Mobile: vertical layout (same as desktop)
        'max-md:flex-1 max-md:space-y-2'
      ]">
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
          <span v-if="!sidebarCollapsed" class="ml-3">Folders</span>
        </router-link>
      </nav>

      <!-- User Info and Logout -->
      <div :class="[
        'p-2 border-gray-200',
        // Desktop: bottom section
        'md:border-t md:mb-12',
        // Mobile: bottom section (same as desktop)
        'max-md:border-t max-md:mb-4'
      ]">
        <div 
          @click="showUserModal = true"
          :class="[
            'flex items-center space-x-3 mb-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors',
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          ]"
        >
          <div class="w-8 h-8 bg-rwanda-green rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-medium">{{ userInitials }}</span>
          </div>
          <div v-if="!sidebarCollapsed" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
          </div>
        </div>
        <!-- Quick logout button for collapsed sidebar -->
        <button
          v-if="sidebarCollapsed"
          @click="handleLogout"
          class="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          title="Logout"
        >
          <LogOut :size="20" />
        </button>
      </div>
    </div>
  </div>

  <!-- Small User Settings Modal -->
  <div 
    v-if="showUserModal"
    class="fixed inset-0 z-50"
    @click="showUserModal = false"
  >
    <div 
      :class="[
        'absolute bg-white rounded-lg shadow-xl border border-gray-200 w-48 p-3',
        sidebarCollapsed ? 'bottom-20 left-2' : 'bottom-20 left-4'
      ]"
      @click.stop
    >
      <!-- User Info -->
      <div class="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-100">
        <div class="w-8 h-8 bg-rwanda-green rounded-full flex items-center justify-center">
          <span class="text-white text-xs font-medium">{{ userInitials }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-gray-900 truncate">{{ userName }}</p>
          <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
        </div>
      </div>

      <!-- Quick Settings -->
      <div class="space-y-1 mb-3">
        <button class="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded flex items-center">
          <svg class="w-3 h-3 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          Profile
        </button>
        <button class="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded flex items-center">
          <svg class="w-3 h-3 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
          Settings
        </button>
      </div>

      <!-- Logout -->
      <button
        @click="handleLogout"
        class="w-full flex items-center justify-center px-2 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
      >
        <LogOut :size="12" class="mr-1" />
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
const showUserModal = ref(false)

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

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  emit('toggle-sidebar', sidebarCollapsed.value)
}

// Watch for prop changes
watch(() => props.collapsed, (newVal) => {
  sidebarCollapsed.value = newVal
})

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