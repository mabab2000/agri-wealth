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
        : 'ml-0 md:ml-64'
    ]" style="margin-top: 64px;">
      
      <!-- Header -->
      <Header 
        title="Livestock Metrics" 
        @toggle-sidebar="handleSidebarToggle"
      >
        <template #actions>
          <div class="flex items-center space-x-2">
            <button
              @click="refreshData"
              class="flex items-center gap-2 px-3 py-1.5 text-sm bg-rwanda-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              :disabled="isLoading"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </template>
      </Header>

      <!-- Main Content -->
      <main class="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
        <div class="max-w-7xl mx-auto">
          
          <!-- Loading State -->
          <div v-if="isLoading && tables.length === 0" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="w-8 h-8 border-4 border-rwanda-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-gray-600">Loading livestock metrics...</p>
            </div>
          </div>
          
          <!-- Error State -->
          <div v-else-if="error" class="text-center py-12">
            <div class="text-red-500 mb-4">
              <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p class="text-gray-600 mb-4">{{ error }}</p>
            <button
              @click="refreshData"
              class="px-4 py-2 bg-rwanda-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>

          <!-- Tables Grid -->
          <div v-else-if="tables.length > 0" class="space-y-6">
            <div 
              v-for="table in tables" 
              :key="table.id"
              class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              <!-- Table Header -->
              <div class="bg-gradient-to-r from-rwanda-blue to-rwanda-green px-6 py-4">
                <h3 class="text-lg font-semibold text-white">{{ table.name }}</h3>
                <p class="text-blue-100 text-sm">Category: {{ table.super_key?.name || 'N/A' }}</p>
              </div>

              <!-- Table Content -->
              <div class="p-6">
                <div v-if="tableData[table.id]?.loading" class="flex items-center justify-center py-8">
                  <div class="text-center">
                    <div class="w-6 h-6 border-2 border-rwanda-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p class="text-gray-600 text-sm">Loading table data...</p>
                  </div>
                </div>

                <div v-else-if="tableData[table.id]?.error" class="text-center py-8">
                  <p class="text-red-600 text-sm">{{ tableData[table.id].error }}</p>
                  <button
                    @click="loadTableData(table.id)"
                    class="mt-2 text-rwanda-blue hover:text-blue-600 text-sm underline"
                  >
                    Retry
                  </button>
                </div>

                <div v-else-if="tableData[table.id]?.data" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div 
                      v-for="(value, key) in tableData[table.id].data" 
                      :key="key"
                      class="bg-gray-50 p-4 rounded-lg"
                    >
                      <div class="text-sm font-medium text-gray-500 mb-1">{{ formatKey(key) }}</div>
                      <div class="text-lg font-semibold text-gray-900">{{ formatValue(value) }}</div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-8">
                  <button
                    @click="loadTableData(table.id)"
                    class="px-4 py-2 bg-rwanda-green text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Load Table Data
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No Tables Available</h3>
            <p class="text-gray-600">No livestock metrics tables found.</p>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import Navbar from '../components/Navbar.vue'
import Header from '../components/Header.vue'
import { API_BASE_URL } from '../services/api.js'

const router = useRouter()
const route = useRoute()
const toast = useToast()

// Sidebar state
const sidebarCollapsed = ref(true) // Start collapsed by default

// Data state
const isLoading = ref(false)
const error = ref(null)
const tables = ref([])
const tableData = ref({})

const handleSidebarToggle = (newState) => {
  console.log('Livestock: Received toggle event with:', newState)
  sidebarCollapsed.value = newState
  console.log('Livestock: Sidebar state is now:', sidebarCollapsed.value)
}

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('accessToken')
}

// Fetch super keys to find the livestock super key ID
const fetchLivestockSuperKey = async () => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/keys/super-keys`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch super keys: ${response.status} ${response.statusText}`)
    }

    const superKeys = await response.json()
    console.log('Available super keys:', superKeys)
    
    // Find livestock super key (look for livestock or similar terms)
    const livestockKey = superKeys.find(key => 
      key.name.toLowerCase().includes('livestock') || 
      key.name.toLowerCase().includes('animal') ||
      key.name.toLowerCase().includes('cattle')
    )
    
    if (!livestockKey) {
      // If no specific livestock key found, use the first available one
      // or throw an error
      if (superKeys.length > 0) {
        console.warn('No livestock-specific super key found, using first available:', superKeys[0])
        return superKeys[0].id
      } else {
        throw new Error('No super keys found')
      }
    }
    
    return livestockKey.id
  } catch (err) {
    console.error('Error fetching super keys:', err)
    throw err
  }
}

// Fetch main tables using super key ID from route or find livestock key
const fetchTables = async () => {
  const token = getAuthToken()
  if (!token) {
    error.value = 'Authentication required. Please log in.'
    return
  }

  try {
    isLoading.value = true
    error.value = null

    let superKeyId = route.params.superKeyId
    
    // If no super key ID in route, try to find livestock key
    if (!superKeyId) {
      superKeyId = await fetchLivestockSuperKey()
    }
    
    const response = await fetch(`${API_BASE_URL}/keys/main-keys/super-key/${superKeyId}`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    tables.value = Array.isArray(data) ? data : []
    
    console.log('Fetched livestock tables:', tables.value)
    
  } catch (err) {
    console.error('Error fetching tables:', err)
    error.value = err.message || 'Failed to load tables'
  } finally {
    isLoading.value = false
  }
}

// Load specific table data (placeholder for actual table data endpoint)
const loadTableData = async (tableId) => {
  const token = getAuthToken()
  if (!token) {
    return
  }

  try {
    // Set loading state for this specific table
    if (!tableData.value[tableId]) {
      tableData.value[tableId] = {}
    }
    tableData.value[tableId].loading = true
    tableData.value[tableId].error = null

    // Placeholder API call - replace with actual table data endpoint
    // const response = await fetch(`${API_BASE_URL}/tables/${tableId}/data`, {
    //   headers: {
    //     'accept': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   }
    // })

    // For now, simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data - replace with actual API response
    const mockData = {
      'total_animals': '1,850',
      'cattle_count': '650',
      'goat_count': '800',
      'sheep_count': '400',
      'health_status': 'Good',
      'vaccination_rate': '92%',
      'feed_consumption': '2.5 tons/day'
    }

    tableData.value[tableId] = {
      loading: false,
      data: mockData,
      error: null
    }
    
  } catch (err) {
    console.error('Error loading table data:', err)
    tableData.value[tableId] = {
      loading: false,
      data: null,
      error: err.message || 'Failed to load table data'
    }
  }
}

// Utility functions
const formatKey = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatValue = (value) => {
  return value || 'N/A'
}

const refreshData = () => {
  tableData.value = {}
  fetchTables()
}

// Watch for route changes to reload data when super key changes
watch(() => route.params.superKeyId, (newSuperKeyId) => {
  if (newSuperKeyId) {
    tableData.value = {}
    fetchTables()
  }
}, { immediate: false })

// Authentication check
onMounted(() => {
  const token = getAuthToken()
  if (!token) {
    toast.error('Please log in to access livestock metrics')
    router.push('/')
    return
  }
  
  fetchTables()
})
</script>