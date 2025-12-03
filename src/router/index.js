import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import Dashboard from '../views/Dashboard.vue'
import Folders from '../views/Folders.vue'
import FolderDetail from '../views/FolderDetail.vue'
import Agriculture from '../views/Agriculture.vue'
import Livestock from '../views/Livestock.vue'
import Review from '../views/Review.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/folders',
    name: 'Folders',
    component: Folders,
    meta: { requiresAuth: true }
  },
  {
    path: '/folders/:id',
    name: 'FolderDetail',
    component: FolderDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/agriculture/:superKeyId?',
    name: 'Agriculture',
    component: Agriculture,
    meta: { requiresAuth: true }
  },
  {
    path: '/livestock/:superKeyId?',
    name: 'Livestock',
    component: Livestock,
    meta: { requiresAuth: true }
  },
  {
    path: '/metrics/:superKeyId',
    name: 'Metrics',
    component: Agriculture,
    meta: { requiresAuth: true }
  },
  {
    path: '/review',
    name: 'Review',
    component: Review,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard for authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  
  if (to.meta.requiresAuth && !token) {
    // Redirect to login if accessing protected route without token
    next('/')
  } else if (to.path === '/' && token) {
    // Redirect to dashboard if accessing login while already authenticated
    next('/dashboard')
  } else {
    next()
  }
})

export default router