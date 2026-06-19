<template>
  <div class="dashboard-container">
    <!-- 顶部导航 -->
    <header class="dashboard-header">
      <div class="header-left">
        <img src="/favicon.svg" alt="Logo" class="header-logo" />
        <h1 class="header-title">后台订单管理系统</h1>
      </div>
      <div class="header-right">
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="36" :icon="UserFilled" />
            <span class="user-name">{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
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

    <!-- 主内容区 -->
    <main class="dashboard-main">
      <div class="welcome-section">
        <h2 class="welcome-title">
          <el-icon><Sunny /></el-icon>
          欢迎回来，{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}！
        </h2>
        <p class="welcome-desc">您已成功登录后台订单管理系统</p>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ orderStore.orders.length }}</div>
            <div class="stat-label">总订单数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ orderStore.orders.filter(o => o.status === '待付款').length }}</div>
            <div class="stat-label">待付款订单</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ orderStore.orders.filter(o => o.status === '已完成').length }}</div>
            <div class="stat-label">已完成订单</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b, #38f9d7);">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ new Set(orderStore.orders.map(o => o.customer)).size }}</div>
            <div class="stat-label">客户数量</div>
          </div>
        </div>
      </div>

      <!-- 快捷操作 / 搜索 -->
      <div class="quick-actions">
        <h3 class="section-title">订单管理</h3>
        <div class="actions-header">
           <div class="actions-left">
            <el-button type="primary" size="large" @click="showAddOrderDialog = true">
                <el-icon><Plus /></el-icon>
                新建订单
            </el-button>
           </div>
           <div class="actions-right search-area">
             <el-input
                v-model="searchForm.customer"
                placeholder="请输入客户名"
                class="search-input"
                prefix-icon="User"
                clearable
                @keyup.enter="handleSearch"
              />
              <el-input
                v-model="searchForm.orderNo"
                placeholder="请输入订单号"
                class="search-input"
                prefix-icon="Document"
                clearable
                @keyup.enter="handleSearch"
              />
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
              <el-button @click="handleReset">
                重置
              </el-button>
           </div>
        </div>
      </div>

      <!-- 最近订单 -->
      <div class="recent-orders">
        <h3 class="section-title">订单列表</h3>
        <el-table :data="filteredOrders" style="width: 100%" stripe>
          <el-table-column prop="orderNo" label="订单号" width="180" />
          <el-table-column prop="customer" label="客户名称" />
          <el-table-column prop="amount" label="金额">
            <template #default="{ row }">
              ¥{{ row.amount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </main>

    <!-- 新建订单弹窗 -->
    <el-dialog v-model="showAddOrderDialog" title="新建订单" width="500px">
      <el-form :model="newOrderForm" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="newOrderForm.orderNo" placeholder="系统自动生成" disabled />
        </el-form-item>
        <el-form-item label="客户名称">
           <el-input v-model="newOrderForm.customer" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="订单金额">
           <el-input-number v-model="newOrderForm.amount" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="订单状态">
           <el-select v-model="newOrderForm.status">
             <el-option label="已完成" value="已完成" />
             <el-option label="处理中" value="处理中" />
             <el-option label="待付款" value="待付款" />
             <el-option label="已取消" value="已取消" />
           </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddOrderDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAddOrder">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑订单弹窗 -->
    <el-dialog v-model="showEditOrderDialog" title="编辑订单" width="500px">
      <el-alert
        v-if="isEditingCompleted"
        type="warning"
        :closable="false"
        show-icon
        title="已完成状态的订单不允许修改客户名称和订单金额"
        style="margin-bottom: 16px;"
      />
      <el-form :model="editOrderForm" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="editOrderForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="客户名称">
           <el-input v-model="editOrderForm.customer" :disabled="isEditingCompleted" />
        </el-form-item>
        <el-form-item label="订单金额">
           <el-input-number v-model="editOrderForm.amount" :min="0" :precision="2" :disabled="isEditingCompleted" />
        </el-form-item>
        <el-form-item label="订单状态">
           <el-select v-model="editOrderForm.status">
             <el-option label="已完成" value="已完成" />
             <el-option label="处理中" value="处理中" />
             <el-option label="待付款" value="待付款" />
             <el-option label="已取消" value="已取消" />
           </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditOrderDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmEditOrder">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 个人中心弹窗 -->
    <el-dialog v-model="showProfileDialog" title="个人中心" width="400px">
      <div class="profile-content">
         <div class="profile-header">
            <el-avatar :size="80" :icon="UserFilled" />
            <h3>{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</h3>
            <p>{{ userStore.userInfo?.role === 'admin' ? '系统管理员' : '普通用户' }}</p>
         </div>
         <el-divider />
         <el-form label-position="left" label-width="80px">
            <el-form-item label="用户名">
               <span>{{ userStore.userInfo?.username }}</span>
            </el-form-item>
            <el-form-item label="邮箱">
               <span>{{ userStore.userInfo?.email }}</span>
            </el-form-item>
            <el-form-item label="注册时间">
               <span>{{ userStore.userInfo?.createdAt }}</span>
            </el-form-item>
         </el-form>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UserFilled,
  ArrowDown,
  User,
  SwitchButton,
  Sunny,
  Document,
  Clock,
  CircleCheck,
  Plus,
  Search
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

// 搜索表单
const searchForm = reactive({
  customer: '',
  orderNo: ''
})

const filteredOrders = ref(orderStore.orders)

watch(() => orderStore.orders, (newVal) => {
  handleSearch()
}, { deep: true })

const handleSearch = () => {
  filteredOrders.value = orderStore.orders.filter(order => {
    const matchCustomer = !searchForm.customer || order.customer.includes(searchForm.customer)
    const matchOrderNo = !searchForm.orderNo || order.orderNo.toLowerCase().includes(searchForm.orderNo.toLowerCase())
    return matchCustomer && matchOrderNo
  })
}

const handleReset = () => {
    searchForm.customer = ''
    searchForm.orderNo = ''
    handleSearch()
}

// 状态标签类型
const statusType = (status) => {
  const typeMap = {
    '已完成': 'success',
    '处理中': 'warning',
    '待付款': 'info',
    '已取消': 'danger'
  }
  return typeMap[status] || 'info'
}

// 个人中心
const showProfileDialog = ref(false)

// 新建订单
const showAddOrderDialog = ref(false)
const newOrderForm = reactive({
    orderNo: '',
    customer: '',
    amount: 0,
    status: '待付款'
})
// 每次打开新建弹窗自动生成订单号
watch(showAddOrderDialog, (val) => {
    if (val) {
        newOrderForm.orderNo = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
        newOrderForm.customer = ''
        newOrderForm.amount = 0
        newOrderForm.status = '待付款'
    }
})

const confirmAddOrder = () => {
    if (!newOrderForm.customer) {
        ElMessage.warning('请输入客户名称')
        return
    }
    const order = {
        ...newOrderForm,
        createTime: new Date().toLocaleString().replace(/\//g, '-')
    }
    orderStore.addOrder(order)
    ElMessage.success('新建订单成功')
    showAddOrderDialog.value = false
}

// 编辑订单
const showEditOrderDialog = ref(false)
const editOrderForm = reactive({
    orderNo: '',
    customer: '',
    amount: 0,
    status: ''
})

// 编辑前的原始状态：用于判定是否为「已完成」订单
const editOriginalStatus = ref('')
// 锁定条件：原始状态或当前选中状态任一为「已完成」时，禁用金额和客户字段
// 防止用户通过先切换状态来绕过限制，或将非完成订单改成已完成时同时改金额/客户
const isEditingCompleted = computed(
    () => editOriginalStatus.value === '已完成' || editOrderForm.status === '已完成'
)

const openEditDialog = (row) => {
    Object.assign(editOrderForm, row)
    editOriginalStatus.value = row.status
    showEditOrderDialog.value = true
}

const confirmEditOrder = () => {
    try {
        orderStore.updateOrder({ ...editOrderForm })
        ElMessage.success('更新订单成功')
        showEditOrderDialog.value = false
    } catch (error) {
        ElMessage.error(error.message || '更新订单失败')
    }
}

// 删除订单
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定要删除该订单吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        orderStore.deleteOrder(row.orderNo)
        ElMessage.success('删除成功')
    } catch {
       // cancel
    }
}

// 下拉菜单命令处理
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
.dashboard-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-logo {
  width: 36px;
  height: 36px;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

.dashboard-main {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.5rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.welcome-title .el-icon {
  color: #f7ba2a;
}

.welcome-desc {
  color: #606266;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.9rem;
  color: #909399;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.quick-actions {
  margin-bottom: 32px;
}

.actions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-area {
    display: flex;
    gap: 10px;
}
.search-input {
    width: 200px;
}

@media (max-width: 900px) {
  .actions-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .search-area {
      flex-wrap: wrap;
      width: 100%;
  }
  .search-input {
      width: 100%;
      max-width: none;
  }
}

.recent-orders {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 0 16px;
  }

  .header-title {
    display: none;
  }

  .dashboard-main {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 1.5rem;
  }
    .actions-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .search-input {
      width: 100%;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .user-name {
    display: none;
  }
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
</style>
