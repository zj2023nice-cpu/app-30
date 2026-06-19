<template>
  <div class="orders-page">
    <div class="page-header">
      <h2 class="page-title">订单管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        新建订单
      </el-button>
    </div>

    <div class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.customer"
            placeholder="请输入客户名"
            clearable
            prefix-icon="User"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            prefix-icon="Document"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="待付款" value="待付款" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <el-table
        :data="displayOrders"
        style="width: 100%"
        stripe
        v-loading="loading"
      >
        <el-table-column prop="orderNo" label="订单号" min-width="160" />
        <el-table-column prop="customer" label="客户名称" min-width="120" />
        <el-table-column prop="amount" label="金额" min-width="120">
          <template #default="{ row }">
            <span class="amount-text">¥{{ Number(row.amount).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
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

      <div class="pagination-wrapper" v-if="displayOrders.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredOrders.length"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑订单' : '新建订单'"
      width="500px"
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
            :disabled="isEdit && orderForm.status === '已完成'"
          />
          <div v-if="isEdit && orderForm.status === '已完成'" class="form-tip warning">
            已完成订单不可修改客户信息
          </div>
        </el-form-item>
        <el-form-item label="订单金额" prop="amount">
          <el-input-number
            v-model="orderForm.amount"
            :min="0"
            :precision="2"
            :step="100"
            style="width: 100%"
            :disabled="isEdit && orderForm.status === '已完成'"
          />
          <div v-if="isEdit && orderForm.status === '已完成'" class="form-tip warning">
            已完成订单不可修改金额
          </div>
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="orderForm.status" placeholder="请选择状态" style="width: 100%">
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
            placeholder="请输入备注（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/order'

const orderStore = useOrderStore()

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

const searchForm = reactive({
  customer: '',
  orderNo: '',
  status: ''
})

const orderForm = reactive({
  orderNo: '',
  customer: '',
  amount: 0,
  status: '待付款',
  remark: ''
})

const editingOrderNo = ref('')

const filteredOrders = computed(() => {
  return orderStore.searchOrders({
    customer: searchForm.customer,
    orderNo: searchForm.orderNo,
    status: searchForm.status
  })
})

const displayOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

const statusType = (status) => {
  const typeMap = {
    '已完成': 'success',
    '处理中': 'warning',
    '待付款': 'info',
    '已取消': 'danger'
  }
  return typeMap[status] || 'info'
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  searchForm.customer = ''
  searchForm.orderNo = ''
  searchForm.status = ''
  currentPage.value = 1
}

const openAddDialog = () => {
  isEdit.value = false
  editingOrderNo.value = ''
  Object.assign(orderForm, {
    orderNo: orderStore.generateOrderNo(),
    customer: '',
    amount: 0,
    status: '待付款',
    remark: ''
  })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  editingOrderNo.value = row.orderNo
  Object.assign(orderForm, {
    orderNo: row.orderNo,
    customer: row.customer,
    amount: row.amount,
    status: row.status,
    remark: row.remark || ''
  })
  dialogVisible.value = true
}

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

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitting.value = true

    if (isEdit.value) {
      await orderStore.updateOrder(editingOrderNo.value, {
        customer: orderForm.customer,
        amount: orderForm.amount,
        status: orderForm.status,
        remark: orderForm.remark
      })
      ElMessage.success('订单更新成功')
    } else {
      await orderStore.addOrder({
        customer: orderForm.customer,
        amount: orderForm.amount,
        status: orderForm.status,
        remark: orderForm.remark
      })
      ElMessage.success('订单创建成功')
    }

    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.message || (isEdit.value ? '更新失败' : '创建失败'))
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除订单 ${row.orderNo} 吗？删除后不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    await orderStore.deleteOrder(row.orderNo)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.orders-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.search-form .el-form-item {
  margin-bottom: 0;
  margin-right: 16px;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.amount-text {
  font-weight: 600;
  color: #f56c6c;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.form-tip {
  font-size: 0.8rem;
  margin-top: 4px;
}

.form-tip.warning {
  color: #e6a23c;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .search-card {
    padding: 16px;
  }

  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 12px;
    width: 100%;
  }

  .search-form .el-form-item .el-input,
  .search-form .el-form-item .el-select {
    width: 100%;
  }

  .table-card {
    padding: 12px;
  }

  .pagination-wrapper {
    justify-content: center;
  }
}
</style>
