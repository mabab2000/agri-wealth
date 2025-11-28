<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from "vue-toastification"
import { apiClient, API_ENDPOINTS } from '../services/api.js'

const router = useRouter()
const toast = useToast()
const currentStep = ref(1)

// Step 1: Personal Information
const personalInfo = ref({
  fullName: '',
  email: '',
  phone: '+250'
})

// Step 2: Project Information
const projectInfo = ref({
  projectDescription: 'Agricultural data analysis and farm management optimization to improve crop yields and resource efficiency.',
  expectedImpact: ''
})

// Step 3: Password
const passwordInfo = ref({
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const errors = ref({})

const validateStep = (step) => {
  errors.value = {}
  
  if (step === 1) {
    if (!personalInfo.value.fullName) errors.value.fullName = 'Full name is required'
    if (!personalInfo.value.email) errors.value.email = 'Email is required'
    if (!personalInfo.value.phone) errors.value.phone = 'Phone number is required'
    else if (!/^\+250\d{9}$/.test(personalInfo.value.phone.trim())) {
      errors.value.phone = 'Phone number must be in format +250xxxxxxxxx (9 digits after +250)'
    }
  } else if (step === 2) {
    if (!projectInfo.value.projectDescription) errors.value.projectDescription = 'Project description is required'
  } else if (step === 3) {
    if (!passwordInfo.value.password) errors.value.password = 'Password is required'
    if (passwordInfo.value.password.length < 6) errors.value.password = 'Password must be at least 6 characters'
    if (passwordInfo.value.password !== passwordInfo.value.confirmPassword) {
      errors.value.confirmPassword = 'Passwords do not match'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const nextStep = () => {
  if (validateStep(currentStep.value)) {
    if (currentStep.value < 3) {
      currentStep.value++
    } else {
      handleSignup()
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleSignup = async () => {
  isLoading.value = true
  
  try {
    // Prepare API request body
    const requestBody = {
      personalInfo: {
        fullName: personalInfo.value.fullName,
        email: personalInfo.value.email,
        phone: personalInfo.value.phone
      },
      projectInfo: {
        projectDescription: projectInfo.value.projectDescription,
        expectedImpact: projectInfo.value.expectedImpact || ''
      },
      passwordInfo: {
        password: passwordInfo.value.password,
        confirmPassword: passwordInfo.value.confirmPassword
      }
    }

    // Debug: Log the request body
    console.log('Sending signup request:', requestBody)

    // Make API call
    const response = await apiClient.post(API_ENDPOINTS.SIGNUP, requestBody)

    // Handle successful signup
    if (response.success) {
      // Show success toast
      toast.success('Account created successfully! Please log in to continue.')
      
      // Don't store authentication data - user needs to log in
      // Remove any stored tokens to ensure clean state
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Clear form data on success
      personalInfo.value = { fullName: '', email: '', phone: '+250' }
      projectInfo.value = { projectDescription: 'Agricultural data analysis and farm management optimization to improve crop yields and resource efficiency.', expectedImpact: '' }
      passwordInfo.value = { password: '', confirmPassword: '' }
      currentStep.value = 1
      
      // Redirect to login page after successful signup
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  } catch (error) {
    // Handle API errors
    console.error('Signup error:', error)
    
    // Keep user on current step to fix the error
    // Don't reset form data - let them edit what's wrong
    
    // Show error toast with improved error handling
    if (error.message.includes('Network error')) {
      toast.error('Network error. Please check your internet connection and try again.')
    } else if (error.message.includes('Email already exists') || error.message.includes('already exists')) {
      toast.error('An account with this email already exists. Please try logging in or use a different email.')
      // Navigate to step 1 (personal info) to edit email
      currentStep.value = 1
    } else if (error.message.includes('valid email address') || error.message.includes('@ symbol')) {
      toast.error('Please enter a valid email address.')
      // Navigate to step 1 (personal info) to edit email
      currentStep.value = 1
    } else if (error.message.includes('phone number')) {
      toast.error('Please enter a valid phone number in Rwanda format (+250...).')
      // Navigate to step 1 (personal info) to edit phone
      currentStep.value = 1
    } else if (error.message.includes('password') && error.message.includes('requirements')) {
      toast.error('Password must be at least 6 characters long.')
      // Navigate to step 3 (password) to edit password
      currentStep.value = 3
    } else if (error.message.includes('project') || error.message.includes('description')) {
      toast.error('Please check your project information.')
      // Navigate to step 2 (project) to edit
      currentStep.value = 2
    } else {
      // Show the cleaned error message from the server
      toast.error(`${error.message || 'Please check your information and try again.'}\n\nYour data has been preserved - please review and correct any issues.`)
      
      // Stay on current step or go to step 1 if unsure where the error is
      if (currentStep.value === 3) {
        // If we're on the final step, go back to step 1 to review all data
        currentStep.value = 1
      }
    }
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/')
}

const ensurePhonePrefix = () => {
  let phoneValue = personalInfo.value.phone
  
  // Remove any non-digit characters except + at the beginning
  phoneValue = phoneValue.replace(/[^\d+]/g, '')
  
  // If user deleted the prefix, restore it
  if (!phoneValue.startsWith('+250')) {
    // Extract only the digits and limit to 9 digits
    const digits = phoneValue.replace(/^\+?250?/, '').slice(0, 9)
    personalInfo.value.phone = '+250' + digits
  } else {
    // Ensure we have exactly +250 followed by up to 9 digits
    const digits = phoneValue.slice(4).slice(0, 9)
    personalInfo.value.phone = '+250' + digits
  }
}


</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-20 left-20 w-32 h-32 bg-gray-300 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-20 w-40 h-40 bg-gray-200 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 w-24 h-24 bg-gray-400 rounded-full blur-2xl"></div>
    </div>
    
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative z-10 border border-white/20">
      <!-- Header -->
      <div class="text-center mb-6">
      
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p class="text-gray-500 text-sm">Join AgriWealth Platform</p>
      </div>

      <!-- Progress Indicator -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-gray-500">Step {{ currentStep }} of 3</span>
          <span class="text-xs text-gray-500">{{ Math.round((currentStep / 3) * 100) }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-rwanda-blue to-rwanda-green h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(currentStep / 3) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Step 1: Personal Information -->
      <div v-if="currentStep === 1" class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
        
        <div>
          <label for="fullName" class="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
          <input
            id="fullName"
            v-model="personalInfo.fullName"
            type="text"
            required
            class="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-rwanda-blue focus:border-rwanda-blue transition-colors"
            :class="{ 'border-red-500': errors.fullName }"
            placeholder="Enter your full name"
          />
          <p v-if="errors.fullName" class="text-red-500 text-xs mt-1">{{ errors.fullName }}</p>
        </div>

        <div>
          <label for="email" class="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
          <input
            id="email"
            v-model="personalInfo.email"
            type="email"
            required
            class="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-rwanda-blue focus:border-rwanda-blue transition-colors"
            :class="{ 'border-red-500': errors.email }"
            placeholder="Enter your email"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label for="phone" class="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            id="phone"
            v-model="personalInfo.phone"
            type="tel"
            required
            class="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-rwanda-blue focus:border-rwanda-blue transition-colors"
            :class="{ 'border-red-500': errors.phone }"
            placeholder="+250xxxxxxxxx"
            @input="ensurePhonePrefix"
          />
          <p v-if="errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
        </div>
      </div>

      <!-- Step 2: Project Information -->
      <div v-if="currentStep === 2" class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Project Information</h2>
        
        <div>
          <label for="projectDescription" class="block text-xs font-medium text-gray-700 mb-1">Project Description</label>
          <textarea
            id="projectDescription"
            v-model="projectInfo.projectDescription"
            rows="3"
            class="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-rwanda-blue focus:border-rwanda-blue transition-colors"
            :class="{ 'border-red-500': errors.projectDescription }"
            placeholder="Describe your specific agricultural analysis needs and goals"
          ></textarea>
          <p v-if="errors.projectDescription" class="text-red-500 text-xs mt-1">{{ errors.projectDescription }}</p>
        </div>

        <div>
          <label for="expectedImpact" class="block text-xs font-medium text-gray-700 mb-1">Expected Impact</label>
          <textarea
            id="expectedImpact"
            v-model="projectInfo.expectedImpact"
            rows="2"
            class="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-rwanda-blue focus:border-rwanda-blue transition-colors"
            placeholder="What impact do you expect from using AgriWealth?"
          ></textarea>
        </div>


      </div>

      <!-- Step 3: Password -->
      <div v-if="currentStep === 3" class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Create Password</h2>
        
        <div>
          <label for="password" class="block text-xs font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            v-model="passwordInfo.password"
            type="password"
            required
            class="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-rwanda-blue focus:border-rwanda-blue transition-colors"
            :class="{ 'border-red-500': errors.password }"
            placeholder="Enter password (min. 6 characters)"
          />
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>

        <div>
          <label for="confirmPassword" class="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="passwordInfo.confirmPassword"
            type="password"
            required
            class="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-rwanda-blue focus:border-rwanda-blue transition-colors"
            :class="{ 'border-red-500': errors.confirmPassword }"
            placeholder="Confirm your password"
          />
          <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
        </div>

        <div class="bg-gray-50 p-3 rounded-lg">
          <h3 class="text-xs font-medium text-gray-700 mb-2">Account Summary:</h3>
          <div class="text-xs text-gray-600 space-y-1">
            <p><strong>Name:</strong> {{ personalInfo.fullName }}</p>
            <p><strong>Email:</strong> {{ personalInfo.email }}</p>
            <p><strong>Focus:</strong> Agricultural Analysis</p>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between mt-6">
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Previous
        </button>
        <div v-else></div>

        <button
          @click="nextStep"
          :disabled="isLoading"
          class="px-6 py-2 bg-gradient-to-r from-rwanda-blue to-rwanda-green text-white text-sm font-semibold rounded-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <span v-if="!isLoading && currentStep < 3">Next</span>
          <span v-else-if="!isLoading && currentStep === 3">Create Account</span>
          <div v-else class="flex items-center justify-center">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </button>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-gray-500 text-xs">
          Already have an account? 
          <button @click="goToLogin" class="text-rwanda-blue hover:text-rwanda-green font-medium transition-colors">Sign in</button>
        </p>
      </div>
    </div>
  </div>
</template>