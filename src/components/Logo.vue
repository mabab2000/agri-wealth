<template>
  <div :class="[
    'flex items-center',
    compact ? 'space-x-2' : 'space-x-3'
  ]">
    <!-- Logo Icon -->
    <div :class="[
      'rounded-lg bg-gradient-to-br from-rwanda-blue via-rwanda-yellow to-rwanda-green flex items-center justify-center shadow-lg',
      compact ? 'h-8 w-8' : 'h-10 w-10'
    ]">
      <!-- Agricultural Symbol - Wheat/Plant Icon -->
      <svg 
        :width="compact ? '18' : '24'" 
        :height="compact ? '18' : '24'" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        class="text-white"
      >
        <!-- Stylized wheat/agriculture symbol -->
        <path d="M12 2C12 2 10 4 10 6C10 8 12 8 12 8C12 8 14 8 14 6C14 4 12 2 12 2Z" fill="currentColor"/>
        <path d="M8 6C8 6 6 8 6 10C6 12 8 12 8 12C8 12 10 12 10 10C10 8 8 6 8 6Z" fill="currentColor"/>
        <path d="M16 6C16 6 14 8 14 10C14 12 16 12 16 12C16 12 18 12 18 10C18 8 16 6 16 6Z" fill="currentColor"/>
        <path d="M6 10C6 10 4 12 4 14C4 16 6 16 6 16C6 16 8 16 8 14C8 12 6 10 6 10Z" fill="currentColor"/>
        <path d="M18 10C18 10 16 12 16 14C16 16 18 16 18 16C18 16 20 16 20 14C20 12 18 10 18 10Z" fill="currentColor"/>
        <path d="M12 8C12 8 10 10 10 12C10 14 12 14 12 14C12 14 14 14 14 12C14 10 12 8 12 8Z" fill="currentColor"/>
        <!-- Stem -->
        <line x1="12" y1="14" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <!-- Leaves -->
        <path d="M10 16C8 15 7 17 9 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <path d="M14 16C16 15 17 17 15 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      </svg>
    </div>
    
    <!-- App Name -->
    <div v-if="showText" class="flex flex-col">
      <span :class="[
        'font-bold leading-tight',
        compact ? 'text-lg' : 'text-xl'
      ]" style="color: #00A651;">Agro</span>
      <span :class="[
        'font-bold leading-tight -mt-1',
        compact ? 'text-lg' : 'text-xl'
      ]" style="color: #FAD201;">Wealth</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  showText: {
    type: Boolean,
    default: true
  }
})
</script>