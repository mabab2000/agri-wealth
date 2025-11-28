<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <Navbar :collapsed="sidebarCollapsed" @toggle-sidebar="handleSidebarToggle" />

    <!-- Main Content Area -->
    <div :class="[
      'flex-1 flex flex-col transition-all duration-300 ease-in-out',
      // Responsive margins based on sidebar state
      sidebarCollapsed 
        ? 'ml-0 md:ml-16' 
        : 'ml-0 md:ml-64 max-md:mt-16'
    ]" style="margin-top: 64px;">
      <!-- Header -->
      <Header 
        title="Data Lake - Folder Management" 
      >
        <template #actions>
        </template>
      </Header>

      <!-- Main Content -->
      <main class="flex-1 px-2 sm:px-4 lg:px-8 py-4 sm:py-6 overflow-y-auto">
        <div class="max-w-7xl mx-auto">
          <!-- Loading State -->
          <div v-if="isLoading && folders.length === 0" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="w-8 h-8 border-4 border-rwanda-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-gray-600">Loading folders...</p>
            </div>
          </div>
          
          <!-- Folders Grid -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <div 
              v-for="folder in folders" 
              :key="folder.id"
              @click="openFolder(folder)"
              class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-3 sm:p-6 border border-gray-200 cursor-pointer group"
            >
              <div class="flex items-start justify-between mb-3 sm:mb-4">
                <div class="p-2 sm:p-3 bg-rwanda-blue/10 rounded-lg group-hover:bg-rwanda-blue/20 transition-colors">
                  <FolderOpen :size="20" class="text-rwanda-blue sm:w-6 sm:h-6" />
                </div>
                <button class="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="text-base sm:text-lg">⋮</span>
                </button>
              </div>
              <h3 class="font-semibold text-gray-900 mb-1 sm:mb-2 truncate text-sm sm:text-base">{{ folder.name }}</h3>
              <div class="text-xs sm:text-sm text-gray-500 space-y-1">
                <p>{{ folder.itemCount }} items</p>
                <p>Created: {{ folder.createdAt }}</p>
              </div>
            </div>

            <!-- Empty State for New Folder -->
            <div 
              @click="showCreateFolderModal = true"
              class="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-3 sm:p-6 flex flex-col items-center justify-center cursor-pointer hover:border-rwanda-blue hover:bg-rwanda-blue/5 transition-colors min-h-[140px] sm:min-h-[180px]"
            >
              <div class="p-2 sm:p-3 bg-gray-100 rounded-lg mb-2 sm:mb-3">
                <span class="text-xl sm:text-2xl text-gray-400">+</span>
              </div>
              <h3 class="font-medium text-gray-600 mb-1 text-sm sm:text-base">Create New Folder</h3>
              <p class="text-xs sm:text-sm text-gray-500 text-center px-2">Click to add a new folder to organize your files</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Create Folder Modal -->
    <div 
      v-if="showCreateFolderModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      @click="showCreateFolderModal = false"
    >
      <div 
        class="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full shadow-2xl border border-white/20"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4 sm:mb-6">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">Create New Folder</h3>
          <button
            @click="showCreateFolderModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span class="text-lg sm:text-xl font-bold">×</span>
          </button>
        </div>

        <div class="space-y-3 sm:space-y-4">
          <div>
            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Folder Name:</label>
            <input 
              v-model="newFolderName"
              type="text"
              placeholder="Enter folder name"
              class="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent"
              @keyup.enter="handleCreateFolder"
            />
          </div>
          
          <div class="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4">
            <button
              @click="showCreateFolderModal = false"
              class="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              @click="handleCreateFolder"
              :disabled="!newFolderName.trim() || isLoading"
              class="px-3 sm:px-4 py-1.5 sm:py-2 bg-rwanda-green text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm flex items-center gap-2"
            >
              <div v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ isLoading ? 'Creating...' : 'Create Folder' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { FolderOpen } from 'lucide-vue-next'
import Navbar from '../components/Navbar.vue'
import Header from '../components/Header.vue'
import { apiClient } from '../services/api.js'

const router = useRouter()
const toast = useToast()

// Authentication state
const isLoading = ref(false)
const token = ref(null)
const projectId = ref(null)

// Sidebar state
const sidebarCollapsed = ref(false)

// Folder management
const showCreateFolderModal = ref(false)
const newFolderName = ref('')
const folders = ref([])

const handleSidebarToggle = (collapsed) => {
  sidebarCollapsed.value = collapsed
}

const openFolder = (folder) => {
  router.push(`/folders/${folder.id}`)
}

const loadFolders = async () => {
  if (!token.value || !projectId.value) {
    console.log('No authentication data available')
    return
  }
  
  try {
    isLoading.value = true
    console.log('Loading folders from API...')
    
    const result = await apiClient.getFolders(projectId.value, token.value)
    
    // Transform API response to component format
    if (Array.isArray(result)) {
      folders.value = result.map(folder => ({
        id: folder.id,
        name: folder.folder_name,
        createdAt: folder.created_at ? new Date(folder.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        itemCount: folder.file_count || 0
      }))
    } else if (result.folders && Array.isArray(result.folders)) {
      folders.value = result.folders.map(folder => ({
        id: folder.id,
        name: folder.folder_name,
        createdAt: folder.created_at ? new Date(folder.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        itemCount: folder.file_count || 0
      }))
    } else {
      // Handle case where no folders exist yet
      folders.value = []
    }
    
    console.log(`Loaded ${folders.value.length} folders`)
    
  } catch (error) {
    console.error('Error loading folders:', error)
    toast.error('Failed to load folders. Using sample data.')
    
    // Fallback to sample folders if API fails
    folders.value = [
      {
        id: 'sample-1',
        name: 'Crop Reports',
        createdAt: '2024-11-20',
        itemCount: 12
      },
      {
        id: 'sample-2',
        name: 'Financial Data',
        createdAt: '2024-11-18',
        itemCount: 8
      },
      {
        id: 'sample-3',
        name: 'Weather Analytics',
        createdAt: '2024-11-15',
        itemCount: 15
      },
      {
        id: 'sample-4',
        name: 'Market Insights',
        createdAt: '2024-11-10',
        itemCount: 6
      }
    ]
  } finally {
    isLoading.value = false
  }
}

const handleCreateFolder = async () => {
  if (!newFolderName.value.trim()) {
    toast.error('Please enter a folder name')
    return
  }
  
  // Check if folder already exists
  if (folders.value.some(folder => folder.name.toLowerCase() === newFolderName.value.trim().toLowerCase())) {
    toast.error('A folder with this name already exists')
    return
  }
  
  // Check authentication
  if (!token.value || !projectId.value) {
    toast.error('Please log in to create folders')
    router.push('/')
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await apiClient.createFolder(
      projectId.value, 
      newFolderName.value.trim(), 
      token.value
    )
    
    // Create folder object with API response
    const newFolder = {
      id: result.folder_id,
      name: newFolderName.value.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      itemCount: 0
    }
    
    folders.value.unshift(newFolder)
    
    console.log(`📁 Created folder: ${newFolder.name} with ID: ${result.folder_id}`)
    toast.success(result.message || `Folder "${newFolder.name}" created successfully`)
    
    // Reset form and close modal
    newFolderName.value = ''
    showCreateFolderModal.value = false
    
    // Refresh folder list to get updated data from server
    await loadFolders()
    
  } catch (error) {
    console.error('Error creating folder:', error)
    toast.error(error.message || 'Failed to create folder. Please try again.')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // Check authentication
  token.value = localStorage.getItem('accessToken')
  
  // Get project ID from token or localStorage
  if (token.value) {
    try {
      // Decode JWT token to get project ID (from sub field)
      const tokenPayload = JSON.parse(atob(token.value.split('.')[1]))
      projectId.value = tokenPayload.sub || tokenPayload.user_id
      console.log('Project ID from token:', projectId.value)
    } catch (error) {
      console.error('Error decoding token:', error)
      // Try to get from localStorage as fallback
      projectId.value = localStorage.getItem('userId') || localStorage.getItem('projectId')
    }
  }
  
  // Redirect to login if not authenticated
  if (!token.value || !projectId.value) {
    toast.error('Please log in to access folders')
    router.push('/')
    return
  }
  
  // Load folders from API
  await loadFolders()
})
</script>