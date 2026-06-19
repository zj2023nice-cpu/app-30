<template>
  <div class="layout-container">
    <div class="sidebar" :class="{ collapsed: isMobile && !sidebarOpen }">
      <div class="sidebar-header">
        <img src="/favicon.svg" alt="Logo" class="sidebar-logo" />
        <h1 v-show="!isMobile || sidebarOpen" class="sidebar-title">订单管理系统</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
        :collapse="isMobile && !sidebarOpen"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
      </el-menu>
    </div>

    <div class="main-wrapper">
      <header class="top-header">
        <div class="header-left">
          <el-button
            v-if="isMobile"
            text
            @click="sidebarOpen = !sidebarOpen"
            class="menu-toggle"
          >
            <el-icon :size="24"><Menu /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="36" :icon="UserFilled" />
              <span class="user-name">{{ displayName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <el-dialog v-model="showProfileDialog" title="个人中心" width="400px">
      <div class="profile-content">
        <div class="profile-header">
          <el-avatar :size="80" :icon="UserFilled" />
          <h3>{{ displayName }}</h3>
          <p>{{ userStore.userInfo?.role === 'admin' ? '系统管理员' : '普通用户' }}</p>
        </div>
        <el-divider />
        <el-form label-position="left" label-width="80px">
          <el-form-item label="用户名">
            <span>{{ userStore.userInfo?.username }}</span>
          </el-form-item>
          <el-form-item label="邮箱">
            <span>{{ userStore.userInfo?.email || '未设置' }}</span>
          </el-form-item>
          <el-form-item label="注册时间">
            <span>{{ userStore.userInfo?.createdAt }}</span>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>

    <div v-if="isMobile && sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataBoard,
  List,
  Menu,
  UserFilled,
  ArrowDown,
  User,
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isMobile = ref(window.innerWidth < 768)
const sidebarOpen = ref(false)
const showProfileDialog = ref(false)

const activeMenu = computed(() => route.path)
const displayName = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.username)
const currentPageTitle = computed(() => {
  const titleMap = {
    '/dashboard': '仪表盘',
    '/orders': '订单管理'
  }
  return titleMap[route.path] || '首页'
})

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      showProfileDialog.value = true
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      } catch {
        // 用户取消
      }
      break
  }
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  background: #f5f7fa;
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #304156 0%, #1f2d3d 100%);
  color: #bfcbd9;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 1001;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background: transparent;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar-menu .el-menu-item {
  color: #bfcbd9;
  height: 50px;
  line-height: 50px;
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.sidebar-menu .el-menu-item.is-active {
  background: #409eff;
  color: #fff;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 220px;
  transition: margin-left 0.3s ease;
}

.main-wrapper.full-width {
  margin-left: 64px;
}

.top-header {
  height: 64px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  padding: 8px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f7fa;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.main-content {
  flex: 1;
  padding: 24px;
}

.profile-content {
  text-align: center;
}

.profile-header {
  margin-bottom: 20px;
}

.profile-header h3 {
  margin: 10px 0 5px;
  font-size: 1.2rem;
}

.profile-header p {
  color: #909399;
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
    width: 220px;
  }

  .main-wrapper {
    margin-left: 0;
  }

  .main-content {
    padding: 16px;
  }

  .top-header {
    padding: 0 16px;
  }

  .user-name {
    display: none;
  }
}
</style>
