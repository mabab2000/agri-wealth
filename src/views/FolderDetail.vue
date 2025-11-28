<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <Navbar :collapsed="sidebarCollapsed" @toggle-sidebar="handleSidebarToggle" />

    <!-- Main Content Area -->
    <div :class="[
      'flex-1 flex flex-col transition-all duration-300 ease-in-out',
      // Desktop: sidebar margins
      'md:ml-16 md:data-[expanded]:ml-64',
      // Mobile: top margin for navbar when expanded
      sidebarCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64 max-md:mt-16'
    ]" style="margin-top: 64px;" :data-expanded="!sidebarCollapsed">
      
      <!-- Header with Back Button -->
      <Header 
      
      >
        <template #actions>
          <button
            @click="goBack"
            class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft :size="16" />
            Back to Folders
          </button>
        </template>
      </Header>

      <!-- Main Content -->
      <main class="flex-1 px-2 sm:px-4 lg:px-8 py-4 sm:py-6 overflow-y-auto">
        <div class="max-w-7xl mx-auto">
          
      <!-- Action Bar -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-4">
            <h3 class="text-lg font-semibold text-gray-900">Files</h3>
            <span class="text-sm text-gray-500">{{ totalFiles }} total files</span>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              v-if="selectedFilesForAnalysis.length > 0"
              @click="analyzeSelectedFiles"
              class="flex items-center justify-center gap-2 px-4 py-2 bg-rwanda-green text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <span>🗊</span>
              Analyze {{ selectedFilesForAnalysis.length }} file(s)
            </button>
            <button
              @click="showUploadModal = true"
              class="flex items-center justify-center gap-2 px-4 py-2 bg-rwanda-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Upload :size="16" />
              Upload Files
            </button>
          </div>
        </div>
      </div>

          <!-- Files Table -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <!-- Loading State -->
            <div v-if="isLoading && files.length === 0" class="flex items-center justify-center py-12">
              <div class="text-center">
                <div class="w-8 h-8 border-4 border-rwanda-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gray-600">Loading files...</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="files.length === 0" class="text-center py-12">
              <div class="p-3 bg-gray-100 rounded-lg mb-4 inline-block">
                <FileText :size="24" class="text-gray-400" />
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
              <p class="text-gray-500 mb-4">Upload files to get started</p>
              <button
                @click="triggerFileUpload"
                class="inline-flex items-center gap-2 px-4 py-2 bg-rwanda-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Upload :size="16" />
                Upload Files
              </button>
            </div>

            <!-- Files Table -->
            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-3 sm:px-4 py-2 text-left">
                      <input
                        type="checkbox"
                        :checked="isAllSelected"
                        @change="toggleSelectAll"
                        class="w-4 h-4 text-rwanda-blue border-gray-300 rounded focus:ring-rwanda-blue"
                      />
                    </th>
                    <th class="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th class="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th class="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th class="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th class="px-3 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr 
                    v-for="file in paginatedFiles" 
                    :key="file.id"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-3 sm:px-4 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        :value="file.id"
                        v-model="selectedFilesForAnalysis"
                        class="w-4 h-4 text-rwanda-blue border-gray-300 rounded focus:ring-rwanda-blue"
                      />
                    </td>
                    <td class="px-3 sm:px-4 py-2 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <div class="p-1 bg-gray-100 rounded">
                          <File :size="14" class="text-gray-500" />
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ file.original_name }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-3 sm:px-4 py-2 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full" :class="getFileTypeClass(file.type)">
                        {{ file.type }}
                      </span>
                    </td>
                    <td class="px-3 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {{ formatFileSize(file.size) }}
                    </td>
                    <td class="px-3 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {{ file.modifiedAt }}
                    </td>
                    <td class="px-3 sm:px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          @click="viewFile(file)"
                          class="p-1 text-rwanda-blue hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                          title="View"
                        >
                          <Eye :size="14" />
                        </button>
                        <button
                          @click="downloadFile(file)"
                          class="p-1 text-green-600 hover:text-green-700 transition-colors rounded hover:bg-green-50"
                          title="Download"
                        >
                          <Download :size="14" />
                        </button>
                        <button
                          @click="deleteFile(file)"
                          class="p-1 text-red-500 hover:text-red-700 transition-colors rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 :size="14" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Pagination -->
            <div v-if="totalPages > 1" class="bg-gray-50 px-3 sm:px-4 py-2 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <div class="text-xs sm:text-sm text-gray-700">
                  Showing {{ startIndex + 1 }} to {{ Math.min(startIndex + itemsPerPage, totalFiles) }} of {{ totalFiles }} files
                </div>
                <div class="flex items-center gap-1">
                  <button
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div class="flex gap-1">
                    <button
                      v-for="page in visiblePages"
                      :key="page"
                      @click="goToPage(page)"
                      :class="[
                        'px-2 py-1 text-xs border rounded',
                        page === currentPage 
                          ? 'bg-rwanda-blue text-white border-rwanda-blue' 
                          : 'border-gray-300 hover:bg-gray-100'
                      ]"
                    >
                      {{ page }}
                    </button>
                  </div>
                  
                  <button
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Upload Files Modal -->
    <div 
      v-if="showUploadModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      @click="closeUploadModal"
    >
      <div 
        class="bg-white rounded-xl p-4 sm:p-6 max-w-lg w-full shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4 sm:mb-6">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">Upload Files to Folder</h3>
          <button
            @click="closeUploadModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- File Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Select Files:</label>
            <input
              ref="fileInput"
              type="file"
              multiple
              class="hidden"
              @change="handleFileSelect"
              accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.txt,.jpg,.jpeg,.png,.gif"
            />
            <button
              @click="triggerFileUpload"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-rwanda-blue hover:bg-rwanda-blue/5 transition-colors text-sm"
            >
              <Upload :size="20" />
              <span>Click to select files or drag and drop</span>
            </button>
          </div>
          
          <!-- Selected Files Preview -->
          <div v-if="selectedFiles.length > 0" class="space-y-2">
            <h4 class="text-sm font-medium text-gray-700">Selected Files ({{ selectedFiles.length }}):</h4>
            <div class="max-h-48 overflow-y-auto space-y-2">
              <div 
                v-for="(file, index) in selectedFiles" 
                :key="index"
                class="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <File :size="16" class="text-gray-500 flex-shrink-0" />
                  <span class="text-sm text-gray-700 truncate">{{ file.name }}</span>
                  <span class="text-xs text-gray-500 flex-shrink-0">({{ formatFileSize(file.size) }})</span>
                </div>
                <button
                  @click="removeFile(index)"
                  class="text-red-500 hover:text-red-700 transition-colors flex-shrink-0 ml-2"
                >
                  <X :size="16" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- Upload Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              @click="closeUploadModal"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              @click="uploadFiles"
              :disabled="selectedFiles.length === 0 || isUploading"
              class="flex items-center gap-2 px-4 py-2 bg-rwanda-green text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <div v-if="isUploading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)` }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- File Preview Modal -->
  <div v-if="showPreviewModal" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="closePreviewModal"></div>

      <div class="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">{{ previewFile?.original_name }}</h3>
          <button
            @click="closePreviewModal"
            class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="mb-4">
          <div class="text-sm text-gray-600 space-y-1">
            <p><strong>Size:</strong> {{ formatFileSize(previewFile?.size) }}</p>
            <p><strong>Type:</strong> {{ previewFile?.type }}</p>
            <p><strong>Upload Date:</strong> {{ previewFile?.modifiedAt }}</p>
          </div>
        </div>

        <!-- Preview Content -->
        <div class="border rounded-lg p-4 mb-4 bg-gray-50 min-h-96 relative">
          <!-- Loading State -->
          <div v-if="isLoadingPreview" class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <div class="text-center">
              <div class="w-8 h-8 border-4 border-rwanda-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-gray-600 text-sm">Loading preview...</p>
            </div>
          </div>
          
          <!-- PDF Preview -->
          <div v-else-if="isPreviewablePdf" class="text-center">
            <iframe 
              :src="previewUrl" 
              class="w-full h-96 border rounded" 
              frameborder="0"
            ></iframe>
          </div>
          
          <!-- Image Preview -->
          <div v-else-if="isPreviewableImage" class="text-center">
            <img 
              :src="previewUrl" 
              :alt="previewFile?.original_name"
              class="max-w-full max-h-96 mx-auto rounded"
            />
          </div>
          
          <!-- Text File Preview -->
          <div v-else-if="isPreviewableText" class="">
            <pre class="whitespace-pre-wrap text-sm bg-white p-4 rounded border max-h-96 overflow-auto">{{ textContent }}</pre>
          </div>
          
          <!-- Non-previewable files -->
          <div v-else class="text-center py-12">
            <File :size="48" class="mx-auto text-gray-400 mb-4" />
            <p class="text-gray-500">Preview not available for this file type.</p>
            <p class="text-sm text-gray-400 mt-1">Click download to view the file.</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
          <button
            @click="downloadFile(previewFile)"
            class="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download :size="16" />
            Download
          </button>
          <button
            @click="closePreviewModal"
            class="px-4 py-2 text-sm bg-rwanda-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteConfirmation" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="cancelDelete"></div>

      <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 :size="20" class="text-red-600" />
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Delete File</h3>
            <p class="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>

        <div class="mb-6">
          <p class="text-sm text-gray-700">
            Are you sure you want to delete 
            <span class="font-medium text-gray-900">"{{ fileToDelete?.original_name }}"</span>?
          </p>
        </div>

        <div class="flex items-center justify-end gap-3">
          <button
            @click="cancelDelete"
            class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 :size="16" />
            Delete File
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { 
  ArrowLeft, 
  Upload, 
  File, 
  FileText, 
  Download, 
  Trash2, 
  X,
  Eye
} from 'lucide-vue-next'
import Navbar from '../components/Navbar.vue'
import Header from '../components/Header.vue'
import { apiClient } from '../services/api.js'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Component state
const sidebarCollapsed = ref(false)
const isLoading = ref(false)
const isUploading = ref(false)
const showUploadModal = ref(false)
const showPreviewModal = ref(false)
const showDeleteConfirmation = ref(false)
const fileToDelete = ref(null)
const isLoadingPreview = ref(false)
const previewFile = ref(null)
const previewUrl = ref('')
const textContent = ref('')
const folderId = ref(route.params.id)
const folderName = ref('')
const files = ref([])
const selectedFiles = ref([])
const selectedFilesForAnalysis = ref([])
const fileInput = ref(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Computed properties
const totalFiles = computed(() => files.value.length)
const totalPages = computed(() => Math.ceil(totalFiles.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const paginatedFiles = computed(() => {
  const start = startIndex.value
  const end = start + itemsPerPage.value
  return files.value.slice(start, end)
})

// File preview computed properties
const isPreviewablePdf = computed(() => {
  return previewFile.value?.type === 'PDF' || previewFile.value?.content_type?.includes('pdf')
})

const isPreviewableImage = computed(() => {
  const imageTypes = ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'WEBP']
  return imageTypes.includes(previewFile.value?.type) || 
         previewFile.value?.content_type?.startsWith('image/')
})

const isPreviewableText = computed(() => {
  const textTypes = ['TXT', 'CSV', 'JSON', 'XML', 'HTML', 'CSS', 'JS', 'MD']
  return textTypes.includes(previewFile.value?.type) || 
         previewFile.value?.content_type?.startsWith('text/') ||
         previewFile.value?.content_type?.includes('json') ||
         previewFile.value?.content_type?.includes('xml')
})
const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  // Show 5 pages max with current in center when possible
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  // Adjust start if we're near the end
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})
const isAllSelected = computed(() => {
  return paginatedFiles.value.length > 0 && 
         paginatedFiles.value.every(file => selectedFilesForAnalysis.value.includes(file.id))
})

// Authentication
const token = ref(null)
const projectId = ref(null)

const handleSidebarToggle = (collapsed) => {
  sidebarCollapsed.value = collapsed
}

const goBack = () => {
  router.push('/folders')
}

const closeUploadModal = () => {
  showUploadModal.value = false
  selectedFiles.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect all visible files
    paginatedFiles.value.forEach(file => {
      const index = selectedFilesForAnalysis.value.indexOf(file.id)
      if (index > -1) {
        selectedFilesForAnalysis.value.splice(index, 1)
      }
    })
  } else {
    // Select all visible files
    paginatedFiles.value.forEach(file => {
      if (!selectedFilesForAnalysis.value.includes(file.id)) {
        selectedFilesForAnalysis.value.push(file.id)
      }
    })
  }
}

const analyzeSelectedFiles = () => {
  if (selectedFilesForAnalysis.value.length === 0) {
    toast.error('Please select files to analyze')
    return
  }
  
  // Here you can implement the analysis functionality
  toast.success(`Starting analysis of ${selectedFilesForAnalysis.value.length} file(s)`)
  console.log('Analyzing files:', selectedFilesForAnalysis.value)
  
  // Clear selection after analysis
  selectedFilesForAnalysis.value = []
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value = files
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileTypeClass = (type) => {
  const typeClasses = {
    'PDF': 'bg-red-100 text-red-800',
    'DOC': 'bg-blue-100 text-blue-800',
    'DOCX': 'bg-blue-100 text-blue-800',
    'XLS': 'bg-green-100 text-green-800',
    'XLSX': 'bg-green-100 text-green-800',
    'CSV': 'bg-green-100 text-green-800',
    'TXT': 'bg-gray-100 text-gray-800',
    'JPG': 'bg-purple-100 text-purple-800',
    'JPEG': 'bg-purple-100 text-purple-800',
    'PNG': 'bg-purple-100 text-purple-800',
    'GIF': 'bg-purple-100 text-purple-800'
  }
  return typeClasses[type] || 'bg-gray-100 text-gray-800'
}

const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) {
    toast.error('Please select files to upload')
    return
  }

  if (!token.value || !projectId.value) {
    toast.error('Authentication required')
    return
  }

  isUploading.value = true

  try {
    const result = await apiClient.uploadFiles(
      folderId.value,
      selectedFiles.value,
      token.value
    )
    
    toast.success(result.message || `Successfully uploaded ${selectedFiles.value.length} file(s)`)
    
    // Clear selected files and close modal
    selectedFiles.value = []
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    showUploadModal.value = false
    
    // Reload files
    await loadFolderFiles()
    
  } catch (error) {
    console.error('Error uploading files:', error)
    toast.error(error.message || 'Failed to upload files. Please try again.')
  } finally {
    isUploading.value = false
  }
}

const downloadFile = async (file) => {
  try {
    if (!token.value) {
      toast.error('Authentication required')
      return
    }

    toast.info(`Downloading ${file.original_name}...`)
    
    const result = await apiClient.getFileDownloadUrl(file.id, token.value)
    
    if (!result.download_url) {
      throw new Error('Download URL not available')
    }
    
    // Create download link using the S3 signed URL
    const link = document.createElement('a')
    link.href = result.download_url
    link.download = result.file_name || file.original_name || file.file_name
    link.target = '_blank' // Open in new tab as fallback
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Downloaded ${file.original_name}`)
  } catch (error) {
    console.error('Error downloading file:', error)
    toast.error(error.message || 'Failed to download file')
  }
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  isLoadingPreview.value = false
  previewFile.value = null
  previewUrl.value = ''
  textContent.value = ''
}

const viewFile = async (file) => {
  try {
    previewFile.value = file
    showPreviewModal.value = true
    isLoadingPreview.value = true
    
    // Get preview URL from API
    const previewResponse = await apiClient.getFilePreviewUrl(file.id, token.value)
    
    if (previewResponse.preview_url) {
      previewUrl.value = previewResponse.preview_url
      
      // For text files, fetch the content to display in the preview
      if (isPreviewableText.value) {
        try {
          const textResponse = await fetch(previewResponse.preview_url)
          const text = await textResponse.text()
          textContent.value = text
        } catch (error) {
          console.warn('Could not fetch text content for preview:', error)
          textContent.value = 'Unable to load text content for preview.'
        }
      }
    } else {
      throw new Error('Preview URL not available')
    }
    
  } catch (error) {
    console.error('Error loading file preview:', error)
    toast.error('Failed to load file preview')
    // Fallback to download
    showPreviewModal.value = false
    downloadFile(file)
  } finally {
    isLoadingPreview.value = false
  }
}

const deleteFile = async (file) => {
  // Show custom confirmation modal instead of window confirm
  fileToDelete.value = file
  showDeleteConfirmation.value = true
}

const cancelDelete = () => {
  showDeleteConfirmation.value = false
  fileToDelete.value = null
}

const confirmDelete = async () => {
  const file = fileToDelete.value
  
  if (!file || !token.value) {
    toast.error('Authentication required')
    return
  }

  // Close confirmation modal
  showDeleteConfirmation.value = false
  fileToDelete.value = null

  try {
    toast.info(`Deleting ${file.original_name}...`)
    
    const result = await apiClient.deleteFile(file.id, token.value)
    
    // Remove from local array
    const index = files.value.findIndex(f => f.id === file.id)
    if (index !== -1) {
      files.value.splice(index, 1)
    }
    
    // Also remove from selected files if it was selected
    const selectedIndex = selectedFilesForAnalysis.value.indexOf(file.id)
    if (selectedIndex > -1) {
      selectedFilesForAnalysis.value.splice(selectedIndex, 1)
    }
    
    // Adjust pagination if current page is empty
    if (paginatedFiles.value.length === 0 && currentPage.value > 1) {
      currentPage.value = Math.max(1, currentPage.value - 1)
    }
    
    toast.success(result.message || `Deleted ${file.original_name}`)
    
  } catch (error) {
    console.error('Error deleting file:', error)
    toast.error(error.message || 'Failed to delete file. Please try again.')
  }
}

const loadFolderFiles = async () => {
  if (!token.value || !projectId.value) {
    return
  }

  try {
    const result = await apiClient.getFolderFiles(
      folderId.value,
      token.value
    )
    
    // Transform API response to component format
    if (result.files && Array.isArray(result.files)) {
      files.value = result.files.map(file => ({
        id: file.id,
        name: file.original_name,
        original_name: file.original_name,
        file_name: file.file_name,
        type: file.content_type ? file.content_type.split('/').pop().toUpperCase() : (file.original_name.split('.').pop()).toUpperCase(),
        size: file.file_size || 'Unknown',
        modifiedAt: file.created_at ? new Date(file.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        s3_file_path: file.s3_file_path
      }))
    } else if (Array.isArray(result)) {
      files.value = result.map(file => ({
        id: file.id,
        name: file.original_name,
        original_name: file.original_name,
        file_name: file.file_name,
        type: file.content_type ? file.content_type.split('/').pop().toUpperCase() : (file.original_name.split('.').pop()).toUpperCase(),
        size: file.file_size || 'Unknown',
        modifiedAt: file.created_at ? new Date(file.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        s3_file_path: file.s3_file_path
      }))
    } else {
      // Handle case where no files exist yet
      files.value = []
    }
    
  } catch (error) {
    console.error('Error loading files:', error)
    toast.error('Failed to load files. Using sample data.')
    
    // Fallback to sample data if API fails
    files.value = [
      {
        id: 1,
        name: 'crop_analysis_2024.xlsx',
        type: 'XLSX',
        size: '2.4 MB',
        modifiedAt: '2024-11-25',
        url: '#'
      },
      {
        id: 2,
        name: 'weather_report.pdf',
        type: 'PDF',
        size: '1.8 MB',
        modifiedAt: '2024-11-24',
        url: '#'
      }
    ]
  }
}

const loadFolderData = async () => {
  isLoading.value = true
  
  try {
    // Get folder name (you can fetch this from API later)
    folderName.value = `Folder ${folderId.value}`
    
    // Load files from API
    await loadFolderFiles()
    
  } catch (error) {
    console.error('Error loading folder data:', error)
    toast.error('Failed to load folder data')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // Check authentication
  token.value = localStorage.getItem('accessToken')
  
  if (token.value) {
    try {
      const tokenPayload = JSON.parse(atob(token.value.split('.')[1]))
      projectId.value = tokenPayload.sub || tokenPayload.user_id
    } catch (error) {
      console.error('Error decoding token:', error)
      projectId.value = localStorage.getItem('userId') || localStorage.getItem('projectId')
    }
  }
  
  if (!token.value || !projectId.value) {
    toast.error('Please log in to access this folder')
    router.push('/')
    return
  }
  
  // Load folder data
  await loadFolderData()
})
</script>