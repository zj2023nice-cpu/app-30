<template>
  <div class="layout-container">
    <div class="sidebar" :class="{ collapsed: isMobile && !sidebarOpen }">
      <div class="sidebar-logo">
        <img src="/favicon.svg" alt="Logo" />
        <span v-show="!isMobile || sidebarOpen">订单管理系统</span>
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
            type="text"
            class="menu-toggle"
            @click="sidebarOpen = !sidebarOpen"
          >
            <el-icon :size="24"><Menu /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.name">{{ route.meta.title?.split(' - ')[0] }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="user-name" v-show="!isMobile">{{ displayName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout" divided>
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

    <div v-if="isMobile && sidebarOpen" class="sidebar-mask" @click="sidebarOpen = false"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataBoard, List, UserFilled, ArrowDown, SwitchButton, Menu } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isMobile = ref(false)
const sidebarOpen = ref(false)

const activeMenu = computed(() => route.path)
const displayName = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.username || '用户')

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

const handleCommand = async (command) => {
  if (command === 'logout') {
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
    }
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #001529 0%, #002140 100%);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1001;
  transition: width 0.3s, transform 0.3s;
  overflow-x: hidden;
}

.sidebar.collapsed {
  width: 0;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo img {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.sidebar-logo span {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.75);
  height: 50px;
  line-height: 50px;
}

.sidebar-menu .el-menu-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-menu .el-menu-item.is-active {
  color: #fff;
  background: linear-gradient(90deg, #1890ff 0%, #36cfc9 100%);
}

.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
}

.main-wrapper {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s;
}

.top-header {
  height: 64px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
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
  padding: 6px 12px;
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
  overflow-y: auto;
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
    width: 220px;
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .main-wrapper {
    margin-left: 0;
  }

  .top-header {
    padding: 0 16px;
  }

  .main-content {
    padding: 16px;
  }
}
</style>
