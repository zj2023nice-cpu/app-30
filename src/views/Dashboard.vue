<template>
  <div class="dashboard-page">
    <div class="welcome-banner">
      <div class="welcome-text">
        <h2>
          <el-icon><Sunny /></el-icon>
          欢迎回来，{{ displayName }}！
        </h2>
        <p>今天也是充满干劲的一天，祝您工作顺利</p>
      </div>
      <div class="welcome-actions">
        <el-button type="primary" size="large" @click="$router.push('/orders')">
          <el-icon><Plus /></el-icon>
          管理订单
        </el-button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card" @click="$router.push('/orders')">
        <div class="stat-icon icon-primary">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ orderStore.stats.total }}</div>
          <div class="stat-label">总订单数</div>
        </div>
      </div>
      <div class="stat-card" @click="$router.push('/orders?status=pending')">
        <div class="stat-icon icon-warning">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ orderStore.stats.pendingPayment }}</div>
          <div class="stat-label">待付款</div>
        </div>
      </div>
      <div class="stat-card" @click="$router.push('/orders?status=completed')">
        <div class="stat-icon icon-success">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ orderStore.stats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-info">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ orderStore.stats.customers }}</div>
          <div class="stat-label">客户数</div>
        </div>
      </div>
    </div>

    <div class="content-section">
      <div class="section-header">
        <h3><el-icon><List /></el-icon> 最近订单</h3>
        <el-button text type="primary" @click="$router.push('/orders')">
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="table-card">
        <el-table :data="recentOrders" stripe style="width: 100%">
          <el-table-column prop="orderNo" label="订单号" min-width="160" />
          <el-table-column prop="customer" label="客户名称" min-width="120" />
          <el-table-column prop="amount" label="金额" min-width="120">
            <template #default="{ row }">
              <span class="amount-text">¥{{ Number(row.amount).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="160" />
        </el-table>
        <el-empty v-if="recentOrders.length === 0" description="暂无订单数据" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Sunny, Document, Clock, CircleCheck, User, List, Plus, ArrowRight } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const userStore = useUserStore()
const orderStore = useOrderStore()

const displayName = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.username || '用户')

const recentOrders = computed(() => orderStore.orders.slice(0, 5))

const statusType = (status) => {
  const map = {
    '已完成': 'success',
    '处理中': 'warning',
    '待付款': 'info',
    '已取消': 'danger'
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  flex-wrap: wrap;
  gap: 16px;
}

.welcome-text h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.welcome-text p {
  margin: 0;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
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
  font-size: 28px;
  color: #fff;
  flex-shrink: 0;
}

.icon-primary { background: linear-gradient(135deg, #667eea, #764ba2); }
.icon-warning { background: linear-gradient(135deg, #f093fb, #f5576c); }
.icon-success { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.icon-info { background: linear-gradient(135deg, #43e97b, #38f9d7); }

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

.content-section {
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

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount-text {
  font-weight: 600;
  color: #f56c6c;
}

.table-card {
  overflow-x: auto;
}

@media (max-width: 767px) {
  .welcome-banner {
    padding: 20px;
    flex-direction: column;
    text-align: center;
  }

  .welcome-text h2 {
    font-size: 1.25rem;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .content-section {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
