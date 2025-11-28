// API configuration
export const API_BASE_URL = 'https://agri-wealth-api.onrender.com'

// API endpoints
export const API_ENDPOINTS = {
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  FOLDERS: '/folders'
}

// HTTP client with base configuration
export const apiClient = {
  async post(endpoint, data) {
    try {
      console.log(`🌐 Making POST request to: ${API_BASE_URL}${endpoint}`)
      console.log('📤 Request data:', data)
      
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      console.log(`📈 Response status: ${response.status} ${response.statusText}`)
      
      const result = await response.json()
      console.log('📥 Response data:', result)

      if (!response.ok) {
        // Handle specific error codes with different formats
        if (response.status === 422) {
          // Validation error - handle new format
          const errorCode = result.error_code || result.error?.code
          const errorMessage = result.message || result.error?.message || 'Validation failed'
          
          console.log('Validation error details:', { errorCode, errorMessage, fullResponse: result })
          
          // Handle specific validation error codes
          if (errorCode === 'VALIDATION_ERROR') {
            // Extract meaningful part of the validation message
            let cleanMessage = errorMessage
            
            // Clean up technical validation messages
            if (errorMessage.includes('value is not a valid email address')) {
              cleanMessage = 'Please enter a valid email address'
            } else if (errorMessage.includes('@-sign')) {
              cleanMessage = 'Email must contain exactly one @ symbol'
            } else if (errorMessage.includes('phone')) {
              cleanMessage = 'Please enter a valid phone number'
            } else if (errorMessage.includes('password')) {
              cleanMessage = 'Password does not meet requirements'
            }
            
            throw new Error(cleanMessage)
          }
          
          throw new Error(errorMessage)
        }
        
        if (response.status === 401) {
          // Authentication error - handle nested detail format
          const errorDetail = result.detail || result
          const errorData = errorDetail.error || errorDetail
          const errorMessage = errorData.message || 'Invalid credentials'
          throw new Error(errorMessage)
        }
        
        if (response.status === 409) {
          // Conflict error (email already exists)
          const errorMessage = result.message || result.error?.message || 'Email already exists'
          throw new Error(errorMessage)
        }
        
        // Generic error - handle both old and new formats
        const errorDetail = result.detail || result
        const errorData = errorDetail.error || errorDetail
        const errorMessage = errorData.message || result.message || `Server error (${response.status})`
        throw new Error(errorMessage)
      }

      return result
    } catch (error) {
      console.error('❌ API Error:', error)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      // Re-throw the error as-is if it's already our custom error
      throw error
    }
  },

  async get(endpoint, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'An error occurred')
      }

      return result
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      throw error
    }
  },

  async createFolder(projectId, folderName, token) {
    try {
      console.log(`🌐 Creating folder for project: ${projectId}`)
      console.log('📤 Folder data:', { folder_name: folderName })
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`${API_BASE_URL}/folders/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        },
        body: JSON.stringify({ folder_name: folderName }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      console.log(`📈 Response status: ${response.status} ${response.statusText}`)
      
      const result = await response.json()
      console.log('📥 Response data:', result)

      if (!response.ok) {
        const errorMessage = result.message || result.error?.message || `Server error (${response.status})`
        throw new Error(errorMessage)
      }

      return result
    } catch (error) {
      console.error('❌ Create Folder API Error:', error)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      
      throw error
    }
  },

  async getFolders(projectId, token) {
    try {
      console.log(`🌐 Getting folders for project: ${projectId}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`${API_BASE_URL}/folders/${projectId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      console.log(`📈 Response status: ${response.status} ${response.statusText}`)
      
      const result = await response.json()
      console.log('📥 Response data:', result)

      if (!response.ok) {
        const errorMessage = result.message || result.error?.message || `Server error (${response.status})`
        throw new Error(errorMessage)
      }

      return result
    } catch (error) {
      console.error('❌ Get Folders API Error:', error)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      
      throw error
    }
  },

  async uploadFiles(folderId, files, token) {
    try {
      console.log(`🌐 Uploading ${files.length} files to folder: ${folderId}`)
      
      const formData = new FormData()
      
      // Add folder_id to FormData
      formData.append('folder_id', folderId)
      
      // Add files to FormData
      files.forEach((file) => {
        formData.append('files', file)
      })
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout for uploads
      
      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        },
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      console.log(`📈 Response status: ${response.status} ${response.statusText}`)
      
      const result = await response.json()
      console.log('📥 Response data:', result)

      if (!response.ok) {
        const errorMessage = result.message || result.error?.message || `Server error (${response.status})`
        throw new Error(errorMessage)
      }

      return result
    } catch (error) {
      console.error('❌ Upload Files API Error:', error)
      
      if (error.name === 'AbortError') {
        throw new Error('Upload timeout. Please check your connection and try again.')
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      
      throw error
    }
  },

  async getFolderFiles(folderId, token) {
    try {
      console.log(`🌐 Getting files for folder: ${folderId}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`${API_BASE_URL}/files/folder/${folderId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      console.log(`📈 Response status: ${response.status} ${response.statusText}`)
      
      const result = await response.json()
      console.log('📥 Response data:', result)

      if (!response.ok) {
        const errorMessage = result.message || result.error?.message || `Server error (${response.status})`
        throw new Error(errorMessage)
      }

      return result
    } catch (error) {
      console.error('❌ Get Folder Files API Error:', error)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      
      throw error
    }
  },

  async deleteFile(fileId, token) {
    try {
      console.log(`🌐 Deleting file: ${fileId}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      console.log(`📈 Response status: ${response.status} ${response.statusText}`)
      
      const result = await response.json()
      console.log('📥 Response data:', result)

      if (!response.ok) {
        const errorMessage = result.message || result.error?.message || `Server error (${response.status})`
        throw new Error(errorMessage)
      }

      return result
    } catch (error) {
      console.error('❌ Delete File API Error:', error)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      
      throw error
    }
  },

  async getFileDownloadUrl(fileId, token) {
    try {
      console.log(`🌐 Getting download URL for file: ${fileId}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      console.log(`📈 Response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const result = await response.json()
        const errorMessage = result.message || result.error?.message || `Server error (${response.status})`
        throw new Error(errorMessage)
      }

      // Parse JSON response to get download_url
      const result = await response.json()
      console.log('📥 Download URL response:', result)
      
      return result
    } catch (error) {
      console.error('❌ Get File Download URL API Error:', error)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      
      throw error
    }
  },

  async getFilePreviewUrl(fileId, token) {
    try {
      console.log(`🌐 Getting preview URL for file: ${fileId}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      console.log(`📈 Response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const result = await response.json()
        const errorMessage = result.message || result.error?.message || `Server error (${response.status})`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('📥 Preview URL response:', result)
      
      return result
    } catch (error) {
      console.error('❌ Get File Preview URL API Error:', error)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      
      throw error
    }
  }
}