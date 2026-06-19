<template>
  <div class="dashboard-container">
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

    <main class="dashboard-main">
      <div class="welcome-section">
        <h2 class="welcome-title">
          <el-icon><Sunny /></el-icon>
          欢迎回来，{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}！
        </h2>
        <p class="welcome-desc">今天是 {{ currentDate }}，祝您工作愉快</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card" @click="filterByStatus('')">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ orderStore.totalOrders }}</div>
            <div class="stat-label">总订单数</div>
          </div>
        </div>
        <div class="stat-card" @click="filterByStatus('待付款')">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ orderStore.pendingPayment }}</div>
            <div class="stat-label">待付款订单</div>
          </div>
        </div>
        <div class="stat-card" @click="filterByStatus('已完成')">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ orderStore.completedOrders }}</div>
            <div class="stat-label">已完成订单</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b, #38f9d7);">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ orderStore.customerCount }}</div>
            <div class="stat-label">客户数量</div>
          </div>
        </div>
      </div>

      <div class="order-section">
        <div class="section-header">
          <h3 class="section-title">订单管理</h3>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            新建订单
          </el-button>
        </div>

        <div class="search-bar">
          <el-input
            v-model="searchForm.customer"
            placeholder="搜索客户名"
            :prefix-icon="User"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <el-input
            v-model="searchForm.orderNo"
            placeholder="搜索订单号"
            :prefix-icon="Document"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <el-select
            v-model="searchForm.status"
            placeholder="订单状态"
            clearable
            class="search-select"
          >
            <el-option label="待付款" value="待付款" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <div class="table-container">
          <el-table
            :data="displayOrders"
            style="width: 100%"
            stripe
            :row-class-name="tableRowClassName"
          >
            <el-table-column prop="orderNo" label="订单号" min-width="160" />
            <el-table-column prop="customer" label="客户名称" min-width="120" />
            <el-table-column prop="amount" label="金额" min-width="120">
              <template #default="{ row }">
                <span class="amount-text">¥{{ row.amount.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" min-width="160" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="openEditDialog(row)"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="handleDelete(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-empty
            v-if="displayOrders.length === 0"
            description="暂无订单数据"
            class="empty-state"
          />
        </div>
      </div>
    </main>

    <el-dialog
      v-model="showAddDialog"
      title="新建订单"
      width="500px"
      :close-on-click-modal="false"
      class="order-dialog"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="orderFormRules"
        label-width="90px"
      >
        <el-form-item label="订单号">
          <el-input :model-value="newOrderNo" disabled placeholder="系统自动生成" />
        </el-form-item>
        <el-form-item label="客户名称" prop="customer">
          <el-input v-model="addForm.customer" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="订单金额" prop="amount">
          <el-input-number
            v-model="addForm.amount"
            :min="0"
            :precision="2"
            :step="100"
            controls-position="right"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="addForm.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="待付款" value="待付款" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="confirmAdd">
          确定创建
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showEditDialog"
      title="编辑订单"
      width="500px"
      :close-on-click-modal="false"
      class="order-dialog"
    >
      <el-alert
        v-if="isEditingCompletedOrder"
        title="订单状态设为已完成"
        type="warning"
        :closable="false"
        show-icon
        class="edit-warning"
      >
        订单状态设为已完成后，金额和客户信息将保持原值不变，不可再修改。
      </el-alert>

      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="orderFormRules"
        label-width="90px"
      >
        <el-form-item label="订单号">
          <el-input v-model="editForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="客户名称" prop="customer">
          <el-input
            v-model="editForm.customer"
            :disabled="isEditingCompletedOrder"
            placeholder="请输入客户名称"
          />
        </el-form-item>
        <el-form-item label="订单金额" prop="amount">
          <el-input-number
            v-model="editForm.amount"
            :min="0"
            :precision="2"
            :step="100"
            :disabled="isEditingCompletedOrder"
            controls-position="right"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择状态" style="width: 100%;" @change="handleStatusChange">
            <el-option label="待付款" value="待付款" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="confirmEdit">
          保存修改
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showProfileDialog" title="个人中心" width="420px">
      <div class="profile-content">
        <div class="profile-header">
          <el-avatar :size="80" :icon="UserFilled" class="profile-avatar" />
          <h3>{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</h3>
          <el-tag :type="userStore.userInfo?.role === 'admin' ? 'danger' : 'info'" size="small">
            {{ userStore.userInfo?.role === 'admin' ? '系统管理员' : '普通用户' }}
          </el-tag>
        </div>
        <el-divider />
        <el-form label-position="left" label-width="80px" class="profile-form">
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

const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${year}年${month}月${day}日 ${weekDays[now.getDay()]}`
})

const searchForm = reactive({
  customer: '',
  orderNo: '',
  status: ''
})

const displayOrders = ref([])

const updateDisplayOrders = () => {
  let result = orderStore.orders
  if (searchForm.customer) {
    result = result.filter(o => o.customer.includes(searchForm.customer))
  }
  if (searchForm.orderNo) {
    result = result.filter(o => o.orderNo.toLowerCase().includes(searchForm.orderNo.toLowerCase()))
  }
  if (searchForm.status) {
    result = result.filter(o => o.status === searchForm.status)
  }
  displayOrders.value = result
}

watch(() => orderStore.orders, () => {
  updateDisplayOrders()
}, { deep: true, immediate: true })

const filterByStatus = (status) => {
  searchForm.status = status
  updateDisplayOrders()
}

const handleSearch = () => {
  updateDisplayOrders()
}

const handleReset = () => {
  searchForm.customer = ''
  searchForm.orderNo = ''
  searchForm.status = ''
  updateDisplayOrders()
}

const getStatusType = (status) => {
  const typeMap = {
    '已完成': 'success',
    '处理中': 'warning',
    '待付款': 'info',
    '已取消': 'danger'
  }
  return typeMap[status] || 'info'
}

const tableRowClassName = ({ row }) => {
  if (row.status === '已完成') {
    return 'completed-row'
  }
  return ''
}

const showProfileDialog = ref(false)

const showAddDialog = ref(false)
const addFormRef = ref(null)
const submitLoading = ref(false)
const newOrderNo = computed(() => orderStore.generateOrderNo())

const addForm = reactive({
  customer: '',
  amount: 0,
  status: '待付款'
})

const orderFormRules = {
  customer: [
    { required: true, message: '请输入客户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '客户名称长度为 2-50 个字符', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入订单金额', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择订单状态', trigger: 'change' }
  ]
}

watch(showAddDialog, (val) => {
  if (val) {
    addForm.customer = ''
    addForm.amount = 0
    addForm.status = '待付款'
  }
})

const confirmAdd = async () => {
  if (!addFormRef.value) return
  try {
    const valid = await addFormRef.value.validate()
    if (!valid) return

    submitLoading.value = true
    orderStore.addOrder({ ...addForm })
    ElMessage.success('订单创建成功')
    showAddDialog.value = false
  } catch (error) {
    ElMessage.error(error.message || '创建失败')
  } finally {
    submitLoading.value = false
  }
}

const showEditDialog = ref(false)
const editFormRef = ref(null)
const originalOrder = ref(null)
const editForm = reactive({
  orderNo: '',
  customer: '',
  amount: 0,
  status: ''
})

const isEditingCompletedOrder = computed(() => editForm.status === '已完成')

const openEditDialog = (row) => {
  originalOrder.value = { ...row }
  Object.assign(editForm, { ...row })
  showEditDialog.value = true
}

const handleStatusChange = (newStatus) => {
  if (newStatus === '已完成' && originalOrder.value) {
    editForm.customer = originalOrder.value.customer
    editForm.amount = originalOrder.value.amount
  }
}

const confirmEdit = async () => {
  if (!editFormRef.value) return
  try {
    if (!isEditingCompletedOrder.value) {
      const valid = await editFormRef.value.validate()
      if (!valid) return
    }

    submitLoading.value = true
    orderStore.updateOrder({ ...editForm })
    ElMessage.success('订单更新成功')
    showEditDialog.value = false
  } catch (error) {
    ElMessage.error(error.message || '更新失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除订单 ${row.orderNo} 吗？删除后不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    orderStore.deleteOrder(row.orderNo)
    ElMessage.success('订单已删除')
  } catch {
    // 用户取消
  }
}

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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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
  margin: 0;
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
  margin: 0 0 8px 0;
}

.welcome-title .el-icon {
  color: #f7ba2a;
}

.welcome-desc {
  color: #909399;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s;
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
  flex-shrink: 0;
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
  margin-top: 4px;
}

.order-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  width: 200px;
}

.search-select {
  width: 140px;
}

.table-container {
  position: relative;
  overflow-x: auto;
}

.amount-text {
  font-weight: 600;
  color: #f56c6c;
}

.empty-state {
  padding: 60px 0;
}

:deep(.completed-row) {
  background-color: #f0f9eb;
}

:deep(.completed-row:hover) > td {
  background-color: #e1f3d8 !important;
}

.edit-warning {
  margin-bottom: 20px;
}

.profile-content {
  text-align: center;
}

.profile-header {
  margin-bottom: 16px;
}

.profile-avatar {
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.profile-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #303133;
}

.profile-form {
  text-align: left;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 0 16px;
  }

  .header-title {
    font-size: 1rem;
  }

  .dashboard-main {
    padding: 16px;
  }

  .welcome-title {
    font-size: 1.2rem;
  }

  .stat-card {
    padding: 16px;
    gap: 12px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .order-section {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .section-header .el-button {
    width: 100%;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-input,
  .search-select {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .user-name {
    display: none;
  }

  :deep(.el-dialog) {
    width: 95% !important;
    margin: 10px auto !important;
  }
}
</style>
