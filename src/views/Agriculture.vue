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
        title="Key Metrics" 
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
          <div v-if="isLoading && mainKeys.length === 0" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="w-8 h-8 border-4 border-rwanda-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-gray-600">Loading metrics...</p>
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

          <!-- Main Content with Tabs -->
          <div v-else-if="mainKeys.length > 0" class="space-y-6">
            <!-- Tab Navigation -->
            <div class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div class="border-b border-gray-200">
                <div class="relative">
                  <!-- Left scroll button -->
                  <button
                    v-if="showScrollButtons"
                    @click="scrollTabs('left')"
                    class="absolute left-0 top-0 h-full w-8 flex items-center justify-center bg-white border-r border-gray-200 text-gray-400 hover:text-gray-600 z-10"
                    :class="{ 'opacity-50 cursor-not-allowed': !canScrollLeft }"
                    :disabled="!canScrollLeft"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <!-- Right scroll button -->
                  <button
                    v-if="showScrollButtons"
                    @click="scrollTabs('right')"
                    class="absolute right-0 top-0 h-full w-8 flex items-center justify-center bg-white border-l border-gray-200 text-gray-400 hover:text-gray-600 z-10"
                    :class="{ 'opacity-50 cursor-not-allowed': !canScrollRight }"
                    :disabled="!canScrollRight"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <!-- Tabs container -->
                  <div 
                    ref="tabsContainer"
                    class="overflow-hidden"
                    :class="{ 'pl-8 pr-8': showScrollButtons }"
                  >
                    <nav 
                      ref="tabsNav"
                      class="flex space-x-8 px-6 transition-transform duration-300 ease-in-out"
                      :style="{ transform: `translateX(${scrollOffset}px)` }"
                      aria-label="Tabs"
                    >
                      <button
                        v-for="mainKey in mainKeys"
                        :key="mainKey.id"
                        @click="selectTab(mainKey.id)"
                        :class="[
                          'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0',
                          activeTab === mainKey.id
                            ? 'border-rwanda-blue text-rwanda-blue'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        ]"
                      >
                        {{ mainKey.name }}
                      </button>
                    </nav>
                  </div>
                </div>
              </div>

              <!-- Tab Content -->
              <div class="p-6">
                <div v-if="activeTab && getActiveMainKey()">
                  <!-- Tab Header -->
                  <div class="mb-6 flex justify-between items-center">
                    <div>
                      <h3 class="text-xl font-semibold text-gray-900">{{ getActiveMainKey().name }}</h3>
                      <p class="text-sm text-gray-500 mt-1">
                        Category: {{ getActiveMainKey().super_key?.name || 'N/A' }}
                      </p>
                    </div>
                    <button
                      @click="openAddParameterModal"
                      class="flex items-center gap-2 px-3 py-1.5 bg-rwanda-green text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Parameter
                    </button>
                  </div>

                  <!-- Tab Data -->
                  <div v-if="tabData[activeTab]?.loading" class="flex items-center justify-center py-12">
                    <div class="text-center">
                      <div class="w-6 h-6 border-2 border-rwanda-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p class="text-gray-600 text-sm">Loading data...</p>
                    </div>
                  </div>

                  <div v-else-if="tabData[activeTab]?.error" class="text-center py-12">
                    <p class="text-red-600 text-sm">{{ tabData[activeTab].error }}</p>
                    <button
                      @click="loadTabData(activeTab)"
                      class="mt-2 text-rwanda-blue hover:text-blue-600 text-sm underline"
                    >
                      Retry
                    </button>
                  </div>

                  <div v-else-if="tabData[activeTab]?.data" class="space-y-4">
                    <!-- Search and Controls -->
                    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div class="flex-1 max-w-sm">
                        <div class="relative">
                          <input
                            v-model="searchQuery"
                            @input="onSearchChange"
                            type="text"
                            placeholder="Search parameters..."
                            class="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:ring-rwanda-blue focus:border-rwanda-blue"
                          >
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <button
                            v-if="searchQuery"
                            @click="clearSearch"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            <svg class="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <label class="text-sm text-gray-700">Show:</label>
                        <select 
                          v-model="itemsPerPage" 
                          @change="changeItemsPerPage(itemsPerPage)"
                          class="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-rwanda-blue focus:border-rwanda-blue"
                        >
                          <option v-for="option in pageOptions" :key="option" :value="option">
                            {{ option }}
                          </option>
                        </select>
                        <span class="text-sm text-gray-700">entries</span>
                      </div>
                    </div>

                    <!-- Parameters Table -->
                    <div v-if="Array.isArray(tabData[activeTab].data) && tabData[activeTab].data.length > 0" class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                      <table class="min-w-full divide-y divide-gray-300">
                        <thead class="bg-gray-50">
                          <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Parameter Name
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created Date
                            </th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="(parameter, index) in paginatedParameters" :key="parameter.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
                            <td class="px-6 py-2 text-sm font-medium text-gray-900">
                              {{ parameter.parameter_name }}
                            </td>
                            <td class="px-6 py-2 text-sm text-gray-500">
                              {{ formatDate(parameter.created_at) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <!-- Pagination -->
                      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div class="flex-1 flex justify-between sm:hidden">
                          <!-- Mobile pagination -->
                          <button
                            @click="prevPage"
                            :disabled="currentPage === 1"
                            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            @click="nextPage"
                            :disabled="currentPage === totalPages"
                            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p class="text-sm text-gray-700">
                              Showing
                              <span class="font-medium">{{ startItem }}</span>
                              to
                              <span class="font-medium">{{ endItem }}</span>
                              of
                              <span class="font-medium">{{ totalItems }}</span>
                              results
                            </p>
                          </div>
                          <div>
                            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              <!-- Previous button -->
                              <button
                                @click="prevPage"
                                :disabled="currentPage === 1"
                                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span class="sr-only">Previous</span>
                                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                              </button>
                              
                              <!-- Page numbers -->
                              <template v-for="page in Math.min(totalPages, 7)" :key="page">
                                <button
                                  @click="goToPage(page)"
                                  :class="[
                                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                                    page === currentPage
                                      ? 'z-10 bg-rwanda-blue border-rwanda-blue text-white'
                                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  ]"
                                >
                                  {{ page }}
                                </button>
                              </template>
                              
                              <!-- Next button -->
                              <button
                                @click="nextPage"
                                :disabled="currentPage === totalPages"
                                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span class="sr-only">Next</span>
                                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                </svg>
                              </button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Empty parameters state -->
                    <div v-else-if="searchQuery && filteredParameters.length === 0" class="text-center py-8">
                      <div class="text-gray-400 mb-4">
                        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-medium text-gray-900 mb-2">No Results Found</h4>
                      <p class="text-gray-600">No parameters match your search "{{ searchQuery }}". Try adjusting your search terms.</p>
                      <button
                        @click="clearSearch"
                        class="mt-3 text-rwanda-blue hover:text-blue-600 text-sm underline"
                      >
                        Clear Search
                      </button>
                    </div>
                    
                    <!-- Empty parameters state -->
                    <div v-else-if="!Array.isArray(tabData[activeTab].data) || tabData[activeTab].data.length === 0" class="text-center py-8">
                      <div class="text-gray-400 mb-4">
                        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-medium text-gray-900 mb-2">No Parameters Found</h4>
                      <p class="text-gray-600">No parameters are available for this category.</p>
                    </div>
                  </div>

                  <div v-else class="text-center py-12">
                    <div class="w-6 h-6 border-2 border-rwanda-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p class="text-gray-600 text-sm">Loading data...</p>
                  </div>
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
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p class="text-gray-600">No metrics found for this category.</p>
          </div>

        </div>
      </main>
    </div>

    <!-- Add Parameter Modal -->
    <div 
      v-if="showAddParameterModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click="closeAddParameterModal"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- Modal panel -->
        <div 
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
          @click.stop
        >
          <!-- Modal Header -->
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-rwanda-green sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Add New Parameter
              </h3>
              <p class="mt-2 text-sm text-gray-500">
                Add a new parameter to "{{ getActiveMainKey()?.name }}"
              </p>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="addParameter" class="mt-5">
            <div class="mb-4">
              <label for="parameterName" class="block text-sm font-medium text-gray-700 mb-2">
                Parameter Name
              </label>
              <input
                id="parameterName"
                v-model="newParameterName"
                type="text"
                placeholder="e.g., Total available land (ha)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-rwanda-blue focus:border-rwanda-blue"
                :disabled="isAddingParameter"
                required
              >
            </div>

            <!-- Modal Actions -->
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-rwanda-green text-base font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isAddingParameter"
              >
                <svg v-if="isAddingParameter" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isAddingParameter ? 'Adding...' : 'Add Parameter' }}
              </button>
              <button
                type="button"
                @click="closeAddParameterModal"
                class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
                :disabled="isAddingParameter"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import Navbar from '../components/Navbar.vue'
import Header from '../components/Header.vue'
import { API_BASE_URL } from '../services/api.js'

const router = useRouter()
const route = useRoute()
const toast = useToast()

// Sidebar state
const sidebarCollapsed = ref(false) // Start expanded by default

// Data state
const isLoading = ref(false)
const error = ref(null)
const mainKeys = ref([]) // Renamed from tables to mainKeys
const activeTab = ref(null) // Currently selected tab
const tabData = ref({}) // Data for each tab

// Modal and form state
const showAddParameterModal = ref(false)
const isAddingParameter = ref(false)
const newParameterName = ref('')

// Search and pagination state
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const pageOptions = [5, 10, 25, 50]

// Tab scrolling state
const tabsContainer = ref(null)
const tabsNav = ref(null)
const scrollOffset = ref(0)
const showScrollButtons = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const handleSidebarToggle = (newState) => {
  console.log('Agriculture: Received toggle-sidebar event with state:', newState);
  sidebarCollapsed.value = newState;
  console.log('Agriculture: Sidebar state is now:', sidebarCollapsed.value);
}

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('accessToken')
}

// Fetch super keys to find the agriculture super key ID
const fetchAgricultureSuperKey = async () => {
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
    
    // Find agriculture super key (look for agriculture or similar terms)
    const agricultureKey = superKeys.find(key => 
      key.name.toLowerCase().includes('agriculture') || 
      key.name.toLowerCase().includes('crop') ||
      key.name.toLowerCase().includes('farm')
    )
    
    if (!agricultureKey) {
      // If no specific agriculture key found, use the first available one
      // or throw an error
      if (superKeys.length > 0) {
        console.warn('No agriculture-specific super key found, using first available:', superKeys[0])
        return superKeys[0].id
      } else {
        throw new Error('No super keys found')
      }
    }
    
    return agricultureKey.id
  } catch (err) {
    console.error('Error fetching super keys:', err)
    throw err
  }
}

// Fetch main keys using super key ID from route or find agriculture key
const fetchMainKeys = async () => {
  const token = getAuthToken()
  if (!token) {
    router.push('/')
    return
  }

  try {
    isLoading.value = true
    error.value = null

    let superKeyId = route.params.superKeyId
    
    // If no super key ID in route, try to find agriculture key
    if (!superKeyId) {
      superKeyId = await fetchAgricultureSuperKey()
    }
    
    const response = await fetch(`${API_BASE_URL}/keys/main-keys/super-key/${superKeyId}`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      // Check if it's an authentication error
      if (response.status === 401) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        router.push('/')
        return
      }
      throw new Error(`Failed to fetch main keys: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    mainKeys.value = Array.isArray(data) ? data : []
    
    // Set first tab as active if we have main keys and load its data
    if (mainKeys.value.length > 0 && !activeTab.value) {
      activeTab.value = mainKeys.value[0].id
      // Auto-load data for the first tab
      loadTabData(mainKeys.value[0].id)
    }
    
    console.log('Fetched main keys:', mainKeys.value)
    
  } catch (err) {
    console.error('Error fetching main keys:', err)
    // Check if it's an authentication error
    if (err.message.includes('401') || err.message.includes('Unauthorized') || err.message.includes('token')) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      router.push('/')
      return
    }
    error.value = err.message || 'Failed to load main keys'
  } finally {
    isLoading.value = false
  }
}

// Load specific tab data using the parameters endpoint
const loadTabData = async (mainKeyId) => {
  const token = getAuthToken()
  if (!token) {
    return
  }

  try {
    // Set loading state for this specific tab
    if (!tabData.value[mainKeyId]) {
      tabData.value[mainKeyId] = {}
    }
    tabData.value[mainKeyId].loading = true
    tabData.value[mainKeyId].error = null

    // Fetch parameters for the main key
    const response = await fetch(`${API_BASE_URL}/keys/parameters/main-key/${mainKeyId}`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch parameters: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Fetched parameters for main key:', mainKeyId, data)

    tabData.value[mainKeyId] = {
      loading: false,
      data: Array.isArray(data) ? data : [],
      error: null
    }
    
  } catch (err) {
    console.error('Error loading tab data:', err)
    tabData.value[mainKeyId] = {
      loading: false,
      data: null,
      error: err.message || 'Failed to load tab data'
    }
  }
}

// Select a tab and load its data
const selectTab = (mainKeyId) => {
  activeTab.value = mainKeyId
  // Reset search and pagination when switching tabs
  searchQuery.value = ''
  currentPage.value = 1
  
  // Always load data when tab is selected
  loadTabData(mainKeyId)
}

// Get the currently active main key object
const getActiveMainKey = () => {
  return mainKeys.value.find(key => key.id === activeTab.value)
}

// Computed properties for search and pagination
const filteredParameters = computed(() => {
  if (!activeTab.value || !tabData.value[activeTab.value]?.data) {
    return []
  }
  
  const data = tabData.value[activeTab.value].data
  if (!Array.isArray(data)) return []
  
  if (!searchQuery.value.trim()) {
    return data
  }
  
  return data.filter(parameter => 
    parameter.parameter_name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const paginatedParameters = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredParameters.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredParameters.value.length / itemsPerPage.value)
})

const totalItems = computed(() => {
  return filteredParameters.value.length
})

const startItem = computed(() => {
  if (totalItems.value === 0) return 0
  return (currentPage.value - 1) * itemsPerPage.value + 1
})

const endItem = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, totalItems.value)
})

// Add new parameter
const addParameter = async () => {
  if (!newParameterName.value.trim() || !activeTab.value) {
    toast.error('Please enter a parameter name')
    return
  }

  const token = getAuthToken()
  if (!token) {
    toast.error('Authentication required')
    return
  }

  try {
    isAddingParameter.value = true
    
    const response = await fetch(`${API_BASE_URL}/keys/parameters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        parameter_name: newParameterName.value.trim(),
        main_key_id: activeTab.value
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Server error (${response.status})`)
    }

    const result = await response.json()
    console.log('Parameter created:', result)
    
    // Show success toast
    toast.success(`Parameter "${result.parameter_name}" created successfully!`)
    
    // Close modal and reset form
    showAddParameterModal.value = false
    newParameterName.value = ''
    
    // Refresh the current tab data
    loadTabData(activeTab.value)
    
  } catch (err) {
    console.error('Error adding parameter:', err)
    toast.error(err.message || 'Failed to add parameter')
  } finally {
    isAddingParameter.value = false
  }
}

// Open add parameter modal
const openAddParameterModal = () => {
  if (!activeTab.value) {
    toast.error('Please select a tab first')
    return
  }
  showAddParameterModal.value = true
}

// Close add parameter modal
const closeAddParameterModal = () => {
  showAddParameterModal.value = false
  newParameterName.value = ''
}

// Pagination functions
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const changeItemsPerPage = (newSize) => {
  itemsPerPage.value = newSize
  currentPage.value = 1 // Reset to first page
}

// Search functions
const onSearchChange = () => {
  currentPage.value = 1 // Reset to first page when searching
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

// Tab scrolling functions
const checkScrollButtons = () => {
  if (!tabsContainer.value || !tabsNav.value) return
  
  const container = tabsContainer.value
  const nav = tabsNav.value
  
  const containerWidth = container.offsetWidth - (showScrollButtons.value ? 64 : 0) // Subtract arrow button widths
  const navWidth = nav.scrollWidth
  
  showScrollButtons.value = navWidth > containerWidth
  
  if (showScrollButtons.value) {
    canScrollLeft.value = scrollOffset.value < 0
    canScrollRight.value = Math.abs(scrollOffset.value) < navWidth - containerWidth
  } else {
    canScrollLeft.value = false
    canScrollRight.value = false
    scrollOffset.value = 0
  }
}

const scrollTabs = (direction) => {
  if (!tabsContainer.value || !tabsNav.value) return
  
  const container = tabsContainer.value
  const nav = tabsNav.value
  const containerWidth = container.offsetWidth - 64 // Subtract arrow button widths
  const navWidth = nav.scrollWidth
  const scrollStep = containerWidth * 0.8 // Scroll 80% of visible width
  
  if (direction === 'left') {
    scrollOffset.value = Math.min(scrollOffset.value + scrollStep, 0)
  } else {
    const maxScroll = -(navWidth - containerWidth)
    scrollOffset.value = Math.max(scrollOffset.value - scrollStep, maxScroll)
  }
  
  checkScrollButtons()
}

// Utility functions
const formatKey = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatValue = (value) => {
  return value || 'N/A'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

const refreshData = () => {
  tabData.value = {}
  activeTab.value = null
  fetchMainKeys()
}

// Watch for route changes to reload data when super key changes
watch(() => route.params.superKeyId, (newSuperKeyId) => {
  if (newSuperKeyId) {
    tabData.value = {}
    activeTab.value = null
    fetchMainKeys()
  }
}, { immediate: false })

// Authentication check
onMounted(() => {
  const token = getAuthToken()
  if (!token) {
    router.push('/')
    return
  }
  
  fetchMainKeys()
  
  // Check scroll buttons after component is mounted
  nextTick(() => {
    checkScrollButtons()
  })
  
  // Add resize listener to update scroll buttons
  window.addEventListener('resize', checkScrollButtons)
})

// Watch mainKeys to update scroll buttons when tabs change
watch(mainKeys, () => {
  nextTick(() => {
    checkScrollButtons()
  })
}, { deep: true })

// Cleanup resize listener
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScrollButtons)
})
</script>