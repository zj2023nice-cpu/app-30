<template>
  <div class="orders-page">
    <div class="page-header">
      <h2><el-icon><List /></el-icon> 订单管理</h2>
    </div>

    <div class="filter-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.customer"
            placeholder="输入客户名搜索"
            clearable
            prefix-icon="User"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="输入订单号搜索"
            clearable
            prefix-icon="Document"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 140px;">
            <el-option label="待付款" value="待付款" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>新建订单
      </el-button>
    </div>

    <div class="table-card">
      <el-table
        :data="filteredOrders"
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="orderNo" label="订单号" min-width="170" />
        <el-table-column prop="customer" label="客户名称" min-width="120" />
        <el-table-column prop="amount" label="订单金额" min-width="120">
          <template #default="{ row }">
            <span class="amount-text">¥{{ Number(row.amount).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="openEditDialog(row)"
            >编辑</el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无订单数据" />
        </template>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '新建订单' : '编辑订单'"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="orderForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="订单号">
          <el-input v-model="orderForm.orderNo" disabled placeholder="系统自动生成" />
        </el-form-item>
        <el-form-item label="客户名称" prop="customer">
          <el-input
            v-model="orderForm.customer"
            placeholder="请输入客户名称"
            :disabled="isFieldLocked('customer')"
          />
          <div v-if="isFieldLocked('customer')" class="field-tip">
            <el-icon><Warning /></el-icon>
            {{ lockTipText }}
          </div>
        </el-form-item>
        <el-form-item label="订单金额" prop="amount">
          <el-input-number
            v-model="orderForm.amount"
            :min="0"
            :precision="2"
            :step="100"
            style="width: 100%;"
            :disabled="isFieldLocked('amount')"
          />
          <div v-if="isFieldLocked('amount')" class="field-tip">
            <el-icon><Warning /></el-icon>
            {{ lockTipText }}
          </div>
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="orderForm.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="待付款" value="待付款" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="orderForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  List, Search, Refresh, Plus, Warning
} from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const orderStore = useOrderStore()

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('add')
const formRef = ref(null)
const editingOrder = ref(null)
const originalOrder = ref(null)

const searchForm = reactive({
  customer: '',
  orderNo: '',
  status: ''
})

const orderForm = reactive({
  id: null,
  orderNo: '',
  customer: '',
  amount: 0,
  status: '待付款',
  remark: ''
})

const formRules = {
  customer: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入订单金额', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择订单状态', trigger: 'change' }
  ]
}

const filteredOrders = computed(() => {
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
  return result
})

const isFieldLocked = (fieldName) => {
  if (dialogMode.value === 'add') return false
  return !orderStore.canEditField(editingOrder.value, fieldName, orderForm.status)
}

const lockTipText = computed(() => {
  if (editingOrder.value?.status === '已完成') {
    return '已完成订单不可修改客户和金额'
  }
  if (orderForm.status === '已完成') {
    return '设为已完成时不能修改客户和金额'
  }
  return ''
})

watch(() => orderForm.status, (newStatus, oldStatus) => {
  if (dialogMode.value === 'edit' && newStatus === '已完成' && oldStatus !== '已完成' && originalOrder.value) {
    orderForm.customer = originalOrder.value.customer
    orderForm.amount = originalOrder.value.amount
  }
})

const statusType = (status) => {
  const map = {
    '已完成': 'success',
    '处理中': 'warning',
    '待付款': 'info',
    '已取消': 'danger'
  }
  return map[status] || 'info'
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
}

const handleReset = () => {
  searchForm.customer = ''
  searchForm.orderNo = ''
  searchForm.status = ''
}

const resetForm = () => {
  orderForm.id = null
  orderForm.orderNo = ''
  orderForm.customer = ''
  orderForm.amount = 0
  orderForm.status = '待付款'
  orderForm.remark = ''
  editingOrder.value = null
  originalOrder.value = null
}

const openAddDialog = () => {
  resetForm()
  dialogMode.value = 'add'
  orderForm.orderNo = '保存后自动生成'
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  resetForm()
  dialogMode.value = 'edit'
  editingOrder.value = row
  originalOrder.value = { ...row }
  orderForm.id = row.id
  orderForm.orderNo = row.orderNo
  orderForm.customer = row.customer
  orderForm.amount = row.amount
  orderForm.status = row.status
  orderForm.remark = row.remark || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitLoading.value = true

    if (dialogMode.value === 'add') {
      orderStore.addOrder({
        customer: orderForm.customer,
        amount: orderForm.amount,
        status: orderForm.status,
        remark: orderForm.remark
      })
      ElMessage.success('订单创建成功')
    } else {
      orderStore.updateOrder(orderForm.id, {
        customer: orderForm.customer,
        amount: orderForm.amount,
        status: orderForm.status,
        remark: orderForm.remark
      })
      ElMessage.success('订单更新成功')
    }

    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.message || '操作失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除订单 "${row.orderNo}" 吗？删除后不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    orderStore.deleteOrder(row.id)
    ElMessage.success('订单已删除')
  } catch {
  }
}

onMounted(() => {
  if (route.query.status) {
    searchForm.status = route.query.status === 'pending' ? '待付款' : '已完成'
  }
})
</script>

<style scoped>
.orders-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.search-form {
  margin: 0;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

.action-bar {
  margin-bottom: 16px;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
}

.amount-text {
  font-weight: 600;
  color: #f56c6c;
}

.field-tip {
  font-size: 12px;
  color: #e6a23c;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 767px) {
  .filter-card {
    padding: 16px;
  }

  .search-form {
    display: block;
  }

  .search-form .el-form-item {
    display: block;
    margin-bottom: 12px;
  }

  .search-form .el-form-item .el-form-item__content {
    margin-left: 0 !important;
  }

  .table-card {
    padding: 12px;
  }
}
</style>
