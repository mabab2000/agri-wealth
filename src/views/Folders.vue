<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <Navbar :collapsed="sidebarCollapsed" @toggle-sidebar="handleSidebarToggle" />

    <!-- Main Content Area -->
    <div :class="[
      'flex-1 flex flex-col transition-all duration-300 ease-in-out',
      sidebarCollapsed ? 'ml-16' : 'ml-64'
    ]" style="margin-top: 64px;">
      <!-- Header -->
      <Header 
        title="Data Lake - Folder Management" 
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="handleSidebarToggle"
      >
        <template #actions>
        </template>
      </Header>

      <!-- Main Content -->
      <main class="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
        <div class="max-w-7xl mx-auto">
          <!-- Folders Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div 
              v-for="folder in folders" 
              :key="folder.id"
              class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 cursor-pointer group"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-rwanda-blue/10 rounded-lg group-hover:bg-rwanda-blue/20 transition-colors">
                  <FolderOpen :size="24" class="text-rwanda-blue" />
                </div>
                <button class="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="text-lg">⋮</span>
                </button>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2 truncate">{{ folder.name }}</h3>
              <div class="text-sm text-gray-500 space-y-1">
                <p>{{ folder.itemCount }} items</p>
                <p>Created: {{ folder.createdAt }}</p>
              </div>
            </div>

            <!-- Empty State for New Folder -->
            <div 
              @click="showCreateFolderModal = true"
              class="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-rwanda-blue hover:bg-rwanda-blue/5 transition-colors min-h-[180px]"
            >
              <div class="p-3 bg-gray-100 rounded-lg mb-3">
                <span class="text-2xl text-gray-400">+</span>
              </div>
              <h3 class="font-medium text-gray-600 mb-1">Create New Folder</h3>
              <p class="text-sm text-gray-500 text-center">Click to add a new folder to organize your files</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Create Folder Modal -->
    <div 
      v-if="showCreateFolderModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showCreateFolderModal = false"
    >
      <div 
        class="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-white/20"
        @click.stop
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Create New Folder</h3>
          <button
            @click="showCreateFolderModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span class="text-xl font-bold">×</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Folder Name:</label>
            <input 
              v-model="newFolderName"
              type="text"
              placeholder="Enter folder name"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent"
              @keyup.enter="handleCreateFolder"
            />
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              @click="showCreateFolderModal = false"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleCreateFolder"
              :disabled="!newFolderName.trim()"
              class="px-4 py-2 bg-rwanda-green text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Create Folder
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { FolderOpen } from 'lucide-vue-next'
import Navbar from '../components/Navbar.vue'
import Header from '../components/Header.vue'

const toast = useToast()

// Sidebar state
const sidebarCollapsed = ref(false)

// Folder management
const showCreateFolderModal = ref(false)
const newFolderName = ref('')
const folders = ref([])

const handleSidebarToggle = (collapsed) => {
  sidebarCollapsed.value = collapsed
}

const handleCreateFolder = () => {
  if (!newFolderName.value.trim()) {
    toast.error('Please enter a folder name')
    return
  }
  
  // Check if folder already exists
  if (folders.value.some(folder => folder.name.toLowerCase() === newFolderName.value.trim().toLowerCase())) {
    toast.error('A folder with this name already exists')
    return
  }
  
  const newFolder = {
    id: folders.value.length + 1,
    name: newFolderName.value.trim(),
    createdAt: new Date().toISOString().split('T')[0],
    itemCount: 0
  }
  
  folders.value.unshift(newFolder)
  
  console.log(`📁 Created folder: ${newFolder.name}`)
  toast.success(`Folder "${newFolder.name}" created successfully`)
  
  // Reset form and close modal
  newFolderName.value = ''
  showCreateFolderModal.value = false
}

onMounted(() => {
  // Initialize sample folders
  folders.value = [
    {
      id: 1,
      name: 'Crop Reports',
      createdAt: '2024-11-20',
      itemCount: 12
    },
    {
      id: 2,
      name: 'Financial Data',
      createdAt: '2024-11-18',
      itemCount: 8
    },
    {
      id: 3,
      name: 'Weather Analytics',
      createdAt: '2024-11-15',
      itemCount: 15
    },
    {
      id: 4,
      name: 'Market Insights',
      createdAt: '2024-11-10',
      itemCount: 6
    }
  ]
})
</script>