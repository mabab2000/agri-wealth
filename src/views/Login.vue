<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from "vue-toastification"
import { apiClient, API_ENDPOINTS } from '../services/api.js'

const router = useRouter()
const toast = useToast()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const rememberMe = ref(false)
const showSystemInfo = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  
  try {
    // Validate form data
    if (!email.value || !password.value) {
      toast.error('Please enter both email and password')
      return
    }

    // Prepare API request body
    const requestBody = {
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value
    }

    console.log('Sending login request:', { email: email.value, rememberMe: rememberMe.value })
    console.log('Full request body:', requestBody)

    // Make API call
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, requestBody)

    console.log('Login response received:', response)

    // Handle successful login
    if (response && (response.success || response.data || response.token || response.access_token)) {
      // Handle different response formats
      let userData, tokens
      
      if (response.data) {
        userData = response.data.user || response.data
        tokens = response.data.tokens || response.data
      } else if (response.user) {
        userData = response.user
        tokens = { accessToken: response.token || response.accessToken }
      } else {
        userData = response
        tokens = { accessToken: response.token || response.access_token || response.accessToken }
      }
      
      // Store tokens and user data
      const accessToken = tokens.accessToken || tokens.access_token || tokens.token
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
        console.log('✅ Access token stored:', accessToken.substring(0, 20) + '...')
      }
      
      if (tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken)
      }
      
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('✅ User data stored')
      }

      // Show success toast
      const userName = userData?.fullName || userData?.name || userData?.email || 'User'
      toast.success(`Welcome back, ${userName}!`)
      
      // Clear form
      email.value = ''
      password.value = ''
      rememberMe.value = false
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else {
      // If we get here, the response format is unexpected
      console.warn('⚠️ Unexpected response format:', response)
      console.warn('Response keys:', Object.keys(response || {}))
      toast.error('Login response received but format is unexpected. Check console for details.')
    }
  } catch (error) {
    // Handle API errors
    console.error('Login error:', error)
    
    // Show error toast
    if (error.message.includes('Network error')) {
      toast.error('Network error. Please check your internet connection.')
    } else if (error.message.includes('Invalid email or password') || error.message.includes('INVALID_CREDENTIALS')) {
      toast.error('Invalid email or password. Please try again.')
      // Clear password field but keep email
      password.value = ''
    } else if (error.message.includes('valid email address')) {
      toast.error('Please enter a valid email address.')
    } else {
      toast.error(error.message || 'Login failed. Please try again.')
    }
  } finally {
    isLoading.value = false
  }
}

const toggleSystemInfo = () => {
  showSystemInfo.value = !showSystemInfo.value
  console.log('System info toggled:', showSystemInfo.value)
}

const goToSignup = () => {
  router.push('/signup')
}

const systemFeatures = [
  {
    icon: '🌱',
    title: 'Crop Analysis',
    description: 'Advanced AI-powered analysis of crop health, growth patterns, and yield predictions'
  },
  {
    icon: '📊',
    title: 'Data Analytics',
    description: 'Comprehensive agricultural data processing and predictive modeling for better decision making'
  },
  {
    icon: '🚜',
    title: 'Farm Management',
    description: 'Integrated farm management tools for resource optimization and operational efficiency'
  },
  {
    icon: '💡',
    title: 'Smart Insights',
    description: 'Real-time insights and recommendations based on weather, soil, and market conditions'
  }
]

const objectives = [
  'Increase agricultural productivity through data-driven insights',
  'Optimize resource utilization and reduce farming costs',
  'Provide predictive analytics for better crop planning',
  'Enable sustainable farming practices',
  'Connect farmers with modern agricultural technologies'
]
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100 p-2 sm:p-4 relative overflow-hidden">
    <!-- Background pattern -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Large circles with Rwanda colors -->
      <div class="absolute top-10 left-10 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-r from-rwanda-blue/40 to-rwanda-blue/25 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
      <div class="absolute bottom-10 right-10 w-56 sm:w-[28rem] h-56 sm:h-[28rem] bg-gradient-to-r from-rwanda-green/45 to-rwanda-green/30 rounded-full blur-2xl sm:blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/4 w-36 sm:w-72 h-36 sm:h-72 bg-gradient-to-r from-rwanda-yellow/50 to-rwanda-yellow/35 rounded-full blur-xl sm:blur-2xl animate-pulse" style="animation-delay: 2s;"></div>
      
      <!-- Medium circles -->
      <div class="absolute top-1/3 right-1/4 w-24 sm:w-48 h-24 sm:h-48 bg-gradient-to-r from-rwanda-blue/35 to-blue-300/25 rounded-full blur-xl sm:blur-2xl animate-pulse" style="animation-delay: 0.5s;"></div>
      <div class="absolute bottom-1/3 left-1/3 w-28 sm:w-56 h-28 sm:h-56 bg-gradient-to-r from-rwanda-green/40 to-green-300/30 rounded-full blur-xl sm:blur-2xl animate-pulse" style="animation-delay: 1.5s;"></div>
    </div>
    
    <div class="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-8 lg:p-10 w-full max-w-md relative z-10 border border-white/50">
      <!-- Header -->
      <div class="text-center mb-6 sm:mb-8">
        
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">AgriWealth Platform</h1>
        <p class="text-sm sm:text-base text-gray-500">Agricultural Analysis & Management System</p>
        <button 
          @click="toggleSystemInfo"
          class="mt-3 text-rwanda-blue hover:text-rwanda-green text-xs sm:text-sm font-semibold transition-all duration-200 underline hover:no-underline px-2 py-1 rounded hover:bg-rwanda-blue/10 cursor-pointer"
        >
          📖 Learn about our system
        </button>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-rwanda-blue focus:border-rwanda-blue transition-colors"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label for="password" class="block text-xs font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-rwanda-blue focus:border-rwanda-blue transition-colors"
            placeholder="Enter your password"
          />
        </div>

        <div class="flex items-center justify-between text-xs">
          <label class="flex items-center text-gray-700 cursor-pointer">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="mr-1 accent-rwanda-blue"
            />
            Remember me
          </label>
          <a href="#" class="text-rwanda-blue hover:text-rwanda-green font-medium transition-colors">Forgot password?</a>
        </div>

        <button
          type="submit"
          class="w-full bg-gradient-to-r from-rwanda-blue to-rwanda-green text-white text-sm font-semibold py-2 px-4 rounded-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">Sign In</span>
          <div v-else class="flex items-center justify-center">
            <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </button>
      </form>

      <!-- Footer -->
      <div class="text-center mt-4">
        <p class="text-gray-500 text-xs">
          Don't have an account? 
          <button @click="goToSignup" class="text-rwanda-blue hover:text-rwanda-green font-medium transition-colors">Sign up</button>
        </p>
        <p class="text-gray-400 text-xs mt-2">
          Empowering Rwanda's Agricultural Future
        </p>
      </div>
    </div>

    <!-- System Information Modal -->
    <div 
      v-if="showSystemInfo"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="toggleSystemInfo"
    >
      <div 
        class="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">AgriWealth System</h2>
          <button 
            @click="toggleSystemInfo"
            class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <!-- System Overview -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">How Our System Works</h3>
          <div class="bg-gradient-to-r from-rwanda-blue/10 to-rwanda-green/10 p-4 rounded-lg mb-4">
            <p class="text-gray-700 text-sm leading-relaxed">
              AgriWealth is a comprehensive agricultural analysis platform that leverages modern technology 
              to revolutionize farming practices in Rwanda. Our system combines data analytics, AI-powered 
              insights, and practical tools to help farmers make informed decisions and maximize their yields.
            </p>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Key Features</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div 
              v-for="feature in systemFeatures" 
              :key="feature.title"
              class="border border-gray-200 rounded-lg p-4 hover:border-rwanda-blue/30 transition-colors"
            >
              <div class="flex items-start space-x-3">
                <span class="text-2xl">{{ feature.icon }}</span>
                <div>
                  <h4 class="font-semibold text-gray-800 text-sm">{{ feature.title }}</h4>
                  <p class="text-gray-600 text-xs mt-1">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Objectives -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Our Objectives</h3>
          <div class="space-y-2">
            <div 
              v-for="(objective, index) in objectives" 
              :key="index"
              class="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <span class="text-rwanda-green font-bold text-sm mt-1">✓</span>
              <p class="text-gray-700 text-sm">{{ objective }}</p>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="bg-gray-50 p-4 rounded-lg text-center">
          <p class="text-gray-600 text-sm mb-3">
            Join thousands of Rwandan farmers already using AgriWealth to transform their agricultural practices.
          </p>
          <button 
            @click="toggleSystemInfo"
            class="bg-gradient-to-r from-rwanda-blue to-rwanda-green text-white text-sm font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  </div>
</template>