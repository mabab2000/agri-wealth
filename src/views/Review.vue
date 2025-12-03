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
      <Header @toggle-sidebar="handleSidebarToggle">
          <template #actions>
            <div class="flex items-center space-x-2">
              <button @click="bulkApprove" :disabled="selectedCount === 0" class="inline-flex items-center px-3 py-1 bg-rwanda-green text-white rounded disabled:opacity-50">Approve Selected</button>
              <button @click="bulkReject" :disabled="selectedCount === 0" class="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50">Reject Selected</button>
            </div>
          </template>
        </Header>

      <main class="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-semibold text-gray-900">Review Page</h1>
            <div class="flex items-center space-x-3">
              <label class="text-sm text-gray-600">Rows per page</label>
              <select v-model.number="itemsPerPage" @change="changeItemsPerPage(itemsPerPage)" class="border rounded px-2 py-1 text-sm">
                <option v-for="opt in pageOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-2 py-2 text-left text-sm font-semibold text-gray-900 w-12">
                      <input type="checkbox" @change="toggleSelectAll" :checked="allSelected" />
                    </th>
                    <th scope="col" class="px-3 py-2 text-left text-sm font-semibold text-gray-900">Element</th>
                    <th scope="col" class="px-3 py-2 text-left text-sm font-semibold text-gray-900">Value</th>
                    <th scope="col" class="px-3 py-2 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="(row, index) in paginatedRows" :key="row.key">
                    <td class="px-2 py-2 text-sm text-gray-500">
                      <input type="checkbox" :value="row.key" v-model="selectedRows" />
                    </td>
                    <td class="px-3 py-2 text-sm text-gray-500">{{ row.element }}</td>
                    <td class="px-3 py-2 text-sm text-gray-500">{{ row.value }}</td>
                    <td class="px-3 py-2 text-sm text-gray-500">{{ row.status }}</td>
                  </tr>
                </tbody>
              </table>
          </div>

          <!-- Pagination -->
          <div class="mt-4 flex justify-between items-center">
            <div class="text-sm text-gray-700">
              Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} results
            </div>
            <div class="flex space-x-2">
              <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Previous</button>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import Header from '../components/Header.vue';
import { apiClient } from '../services/api.js';
import { useToast } from 'vue-toastification';

// Sidebar state
const sidebarCollapsed = ref(false); // Start expanded by default

const toast = useToast();
const router = useRouter();

// Authentication check
const checkAuth = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    router.push('/')
    return false
  }
  return true
}

const rows = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Selection for bulk actions
const selectedRows = ref([]);
const selectedCount = computed(() => selectedRows.value.length);
const allSelected = computed(() => {
  // Check only visible (paginated) rows
  const visibleKeys = paginatedRows.value.map(r => String(r.key));
  return visibleKeys.length > 0 && visibleKeys.every(k => selectedRows.value.includes(k));
});

const toggleSelectAll = (event) => {
  const checked = event.target.checked;
  const visibleKeys = paginatedRows.value.map(r => String(r.key));
  if (checked) {
    // add visible keys that aren't already selected
    selectedRows.value = Array.from(new Set([...selectedRows.value, ...visibleKeys]));
  } else {
    // remove visible keys from selection
    selectedRows.value = selectedRows.value.filter(k => !visibleKeys.includes(k));
  }
};

const bulkApprove = () => {
  if (selectedRows.value.length === 0) return;
  rows.value.forEach(r => {
    if (selectedRows.value.includes(String(r.key))) {
      r.status = 'Approved';
    }
  });
  // clear selection after action
  selectedRows.value = [];
};

const bulkReject = () => {
  if (selectedRows.value.length === 0) return;
  rows.value.forEach(r => {
    if (selectedRows.value.includes(String(r.key))) {
      r.status = 'Rejected';
    }
  });
  selectedRows.value = [];
};

// Fetch pending review results from API
const fetchPendingResults = async () => {
  if (!checkAuth()) return
  
  const token = localStorage.getItem('accessToken')
  
  try {
    isLoading.value = true
    error.value = null
    const data = await apiClient.get('/documents/results/pending', token)
    // Expecting an array of result objects
    if (Array.isArray(data)) {
      rows.value = data.map(item => ({
        key: item.id,
        element: item.extracted_label,
        value: item.extracted_value,
        status: item.status || 'pending',
        year: item.year,
        raw: item
      }))
    } else {
      rows.value = []
    }
  } catch (err) {
    console.error('Error fetching pending results:', err)
    // Check if it's an authentication error
    if (err.message.includes('401') || err.message.includes('Unauthorized') || err.message.includes('token')) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      router.push('/')
      return
    }
    error.value = err.message || 'Failed to load pending results'
    toast.error(error.value)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (checkAuth()) {
    fetchPendingResults()
  }
})

const currentPage = ref(1);
const itemsPerPage = ref(10); // Default number of rows per page set to 10
const pageOptions = [5, 10, 25, 50];

const totalItems = computed(() => rows.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const startItem = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1);
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value));

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return rows.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const changeItemsPerPage = (newSize) => {
  itemsPerPage.value = newSize;
  currentPage.value = 1;
};

const handleSidebarToggle = (newState) => {
  console.log('Review: Received toggle-sidebar event with state:', newState);
  sidebarCollapsed.value = newState;
  console.log('Review: Sidebar state is now:', sidebarCollapsed.value);
}
</script>

<style scoped>
/* Add any custom styles here */
</style>