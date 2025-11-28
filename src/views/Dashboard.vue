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
        title="Dashboard Overview" 
        @toggle-sidebar="handleSidebarToggle"
      >
        <template #actions>
          <!-- Year Selector -->
          <div class="flex items-center space-x-1 sm:space-x-2">
            <label class="text-xs sm:text-sm font-medium text-gray-700 hidden sm:block">Year:</label>
            <select 
              v-model="selectedYear"
              class="border border-gray-300 rounded-md px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent"
            >
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          
          <!-- Compare Button -->
          <button
            @click="showCompareModal = true"
            class="bg-rwanda-blue hover:bg-blue-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 sm:space-x-2"
          >
            <span class="hidden sm:inline">Compare</span>
            <span class="sm:hidden">📊</span>
          </button>
        </template>
      </Header>

      <!-- Main Content -->
      <main class="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
        <div class="max-w-7xl mx-auto">
       

          <!-- Chart Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Crop Distribution Pie Chart -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Crop Distribution by Area</h3>
              <div class="relative h-64">
                <Pie :data="cropDistributionData" :options="chartOptions" />
              </div>
            </div>

            <!-- Revenue Growth Bar Chart -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Growth (RWF)</h3>
              <div class="relative h-64">
                <Bar :data="revenueGrowthData" :options="chartOptions" />
              </div>
            </div>
          </div>

          <!-- Second Row Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Seasonal Yield Analysis Line Chart -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Seasonal Yield Analysis (Tons)</h3>
              <div class="relative h-64">
                <Line :data="seasonalYieldData" :options="chartOptions" />
              </div>
            </div>

            <!-- Investment Portfolio Doughnut Chart -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Investment Portfolio</h3>
              <div class="relative h-64">
                <Doughnut :data="investmentPortfolioData" :options="chartOptions" />
              </div>
            </div>
          </div>

          <!-- Third Row Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Market Price Trends -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Market Price Trends (RWF/Kg)</h3>
              <div class="relative h-64">
                <Line :data="marketPriceData" :options="chartOptions" />
              </div>
            </div>

            <!-- Farm Efficiency Radar Chart -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Farm Efficiency Metrics</h3>
              <div class="relative h-64">
                <Radar :data="farmEfficiencyData" :options="radarChartOptions" />
              </div>
            </div>
          </div>

          <!-- Summary Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white rounded-lg shadow p-6 border-l-4 border-rwanda-blue">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-500">Total Portfolio Value</p>
                  <p class="text-2xl font-semibold text-gray-900">2.4M RWF</p>
                  <p class="text-sm text-green-600">+12.5% from last month</p>
                </div>
                <div class="w-8 h-8 bg-rwanda-blue rounded-full flex items-center justify-center">
                  <DollarSign :size="16" class="text-white" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6 border-l-4 border-rwanda-green">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-500">Average Yield</p>
                  <p class="text-2xl font-semibold text-gray-900">8.5 Tons/Ha</p>
                  <p class="text-sm text-green-600">+18.2% improvement</p>
                </div>
                <div class="w-8 h-8 bg-rwanda-green rounded-full flex items-center justify-center">
                  <ArrowUpRight :size="16" class="text-white" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6 border-l-4 border-rwanda-yellow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-500">Profit Margin</p>
                  <p class="text-2xl font-semibold text-gray-900">32.8%</p>
                  <p class="text-sm text-green-600">+5.4% increase</p>
                </div>
                <div class="w-8 h-8 bg-rwanda-yellow rounded-full flex items-center justify-center">
                  <Percent :size="16" class="text-white" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6 border-l-4 border-rwanda-blue">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-500">Risk Score</p>
                  <p class="text-2xl font-semibold text-gray-900">Low (2.1)</p>
                  <p class="text-sm text-green-600">Optimal diversification</p>
                </div>
                <div class="w-8 h-8 bg-rwanda-blue rounded-full flex items-center justify-center">
                  <CheckCircle :size="16" class="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Compare Years Modal -->
    <div 
      v-if="showCompareModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 pt-16"
      @click="showCompareModal = false"
    >
      <div 
        class="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-white/20"
        @click.stop
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Compare Years</h3>
          <button
            @click="showCompareModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span class="text-xl font-bold">×</span>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Base Year -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">From Year:</label>
            <select 
              v-model="selectedYear"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent"
            >
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>

          <!-- Compare To Year -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Compare To:</label>
            <select 
              v-model="compareToYear"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent"
            >
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-6">
          <button
            @click="showCompareModal = false"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleCompareYears"
            class="px-4 py-2 bg-rwanda-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Pie, Bar, Line, Doughnut, Radar } from 'vue-chartjs'
import {
  DollarSign,
  ArrowUpRight,
  Percent,
  CheckCircle
} from 'lucide-vue-next'
import Navbar from '../components/Navbar.vue'
import Header from '../components/Header.vue'

const router = useRouter()
const toast = useToast()

// Authentication check
onMounted(() => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    toast.error('Please log in to access the dashboard')
    router.push('/')
    return
  }
})

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
)

// Sidebar state - initialize based on screen size
const sidebarCollapsed = ref(true) // Start collapsed by default

// Year comparison
const showCompareModal = ref(false)
const selectedYear = ref(2024)
const compareToYear = ref(2023)
const availableYears = ref([2024, 2023, 2022, 2021, 2020])

const handleSidebarToggle = (newState) => {
  console.log('Dashboard: Received toggle event with:', newState)
  sidebarCollapsed.value = newState
  console.log('Dashboard: Sidebar state is now:', sidebarCollapsed.value)
}

const handleCompareYears = () => {
  console.log(`🔍 Comparing ${selectedYear.value} vs ${compareToYear.value}`)
  
  toast.info(`Comparing data: ${selectedYear.value} vs ${compareToYear.value}`)
  
  console.log('Comparison Data:', {
    baseYear: selectedYear.value,
    compareYear: compareToYear.value,
    charts: 'Updated with comparative data'
  })
  
  showCompareModal.value = false
}

// Chart Options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
    title: {
      display: false,
    },
  },
}

const radarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
    title: {
      display: false,
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
    },
  },
}

// Chart Data
const cropDistributionData = {
  labels: ['Coffee', 'Maize', 'Rice', 'Beans', 'Tea'],
  datasets: [
    {
      label: 'Crop Distribution',
      data: [30, 25, 20, 15, 10],
      backgroundColor: [
        '#00A1DE',
        '#FAD201', 
        '#00A651',
        '#0080B7',
        '#E6C200'
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    },
  ],
}

const revenueGrowthData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue (RWF)',
      data: [120000, 135000, 148000, 162000, 178000, 195000],
      backgroundColor: '#00A651',
      borderColor: '#00A651',
      borderWidth: 1,
    },
  ],
}

const seasonalYieldData = {
  labels: ['Season A 2023', 'Season B 2023', 'Season A 2024', 'Season B 2024'],
  datasets: [
    {
      label: 'Coffee (Tons)',
      data: [125, 110, 145, 135],
      borderColor: '#00A1DE',
      backgroundColor: 'rgba(0, 161, 222, 0.1)',
      tension: 0.4,
    },
    {
      label: 'Maize (Tons)',
      data: [200, 180, 220, 210],
      borderColor: '#FAD201',
      backgroundColor: 'rgba(250, 210, 1, 0.1)',
      tension: 0.4,
    },
  ],
}

const investmentPortfolioData = {
  labels: ['Land', 'Equipment', 'Seeds & Fertilizers', 'Livestock', 'Technology'],
  datasets: [
    {
      label: 'Investment Distribution',
      data: [40, 25, 15, 12, 8],
      backgroundColor: [
        '#00A1DE',
        '#FAD201',
        '#00A651',
        '#0080B7',
        '#E6C200'
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    },
  ],
}

const marketPriceData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Coffee (RWF/Kg)',
      data: [800, 820, 850, 830, 860, 880],
      borderColor: '#00A1DE',
      backgroundColor: 'rgba(0, 161, 222, 0.1)',
      tension: 0.4,
    },
    {
      label: 'Maize (RWF/Kg)',
      data: [200, 210, 195, 205, 215, 220],
      borderColor: '#FAD201',
      backgroundColor: 'rgba(250, 210, 1, 0.1)',
      tension: 0.4,
    },
  ],
}

const farmEfficiencyData = {
  labels: ['Water Usage', 'Soil Health', 'Crop Rotation', 'Pest Control', 'Technology Adoption'],
  datasets: [
    {
      label: 'Efficiency Score',
      data: [85, 92, 78, 88, 75],
      backgroundColor: 'rgba(0, 166, 81, 0.2)',
      borderColor: '#00A651',
      borderWidth: 2,
    },
  ],
}
</script>