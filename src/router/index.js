import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录 - 后台订单管理系统' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册 - 后台订单管理系统' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue'),
    meta: { title: '忘记密码 - 后台订单管理系统' }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    meta: { title: '重置密码 - 后台订单管理系统' }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘 - 后台订单管理系统' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/Orders.vue'),
        meta: { title: '订单管理 - 后台订单管理系统' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const hasToken = () => {
  return !!(localStorage.getItem('oms_token') || sessionStorage.getItem('oms_token_session'))
}

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '后台订单管理系统'
  
  if (to.meta.requiresAuth) {
    if (!hasToken()) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  if (to.path === '/login' || to.path === '/register') {
    if (hasToken()) {
      next({ path: '/dashboard' })
      return
    }
  }
  
  next()
})

export default router
