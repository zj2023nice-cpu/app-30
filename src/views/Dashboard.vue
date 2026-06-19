<template>
  <div class="dashboard-page">
    <div class="welcome-section">
      <h2 class="welcome-title">
        <el-icon><Sunny /></el-icon>
        欢迎回来，{{ displayName }}！
      </h2>
      <p class="welcome-desc">今天是 {{ today }}，祝您工作愉快</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ orderStore.totalOrders }}</div>
          <div class="stat-label">总订单数</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ orderStore.pendingPayment }}</div>
          <div class="stat-label">待付款订单</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ orderStore.completedOrders }}</div>
          <div class="stat-label">已完成订单</div>
        </div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon">
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ orderStore.customerCount }}</div>
          <div class="stat-label">客户数量</div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="recent-orders-card">
        <div class="card-header">
          <h3 class="card-title">最近订单</h3>
          <router-link to="/orders" class="view-all-link">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <el-table :data="recentOrders" style="width: 100%" stripe>
          <el-table-column prop="orderNo" label="订单号" min-width="150" />
          <el-table-column prop="customer" label="客户" min-width="100" />
          <el-table-column prop="amount" label="金额" min-width="100">
            <template #default="{ row }">
              <span class="amount">¥{{ Number(row.amount).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="quick-actions-card">
        <h3 class="card-title">快捷操作</h3>
        <div class="action-buttons">
          <router-link to="/orders" class="action-btn">
            <div class="action-icon">
              <el-icon><Plus /></el-icon>
            </div>
            <span>新建订单</span>
          </router-link>
          <router-link to="/orders" class="action-btn">
            <div class="action-icon">
              <el-icon><List /></el-icon>
            </div>
            <span>订单列表</span>
          </router-link>
        </div>

        <div class="status-distribution">
          <h4>订单状态分布</h4>
          <div class="status-bar">
            <div
              v-for="(item, key) in statusDistribution"
              :key="key"
              class="status-segment"
              :class="key"
              :style="{ width: item.percent + '%' }"
              :title="`${key}: ${item.count}单`"
            ></div>
          </div>
          <div class="status-legend">
            <div v-for="(item, key) in statusDistribution" :key="key" class="legend-item">
              <span class="legend-dot" :class="key"></span>
              <span>{{ key }} ({{ item.count }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Sunny,
  Document,
  Clock,
  CircleCheck,
  UserFilled,
  ArrowRight,
  Plus,
  List
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const userStore = useUserStore()
const orderStore = useOrderStore()

const displayName = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.username)
const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
})

const recentOrders = computed(() => orderStore.orders.slice(0, 5))

const statusDistribution = computed(() => {
  const distribution = {
    '待付款': { count: 0, percent: 0 },
    '处理中': { count: 0, percent: 0 },
    '已完成': { count: 0, percent: 0 },
    '已取消': { count: 0, percent: 0 }
  }
  const total = orderStore.orders.length || 1
  orderStore.orders.forEach(order => {
    if (distribution[order.status]) {
      distribution[order.status].count++
    }
  })
  Object.keys(distribution).forEach(key => {
    distribution[key].percent = Math.round((distribution[key].count / total) * 100)
  })
  return distribution
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
</script>

<style scoped>
.dashboard-page {
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
  color: #909399;
  font-size: 0.95rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
  flex-shrink: 0;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-card.info .stat-icon {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
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

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.recent-orders-card,
.quick-actions-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
  font-size: 0.9rem;
  text-decoration: none;
}

.view-all-link:hover {
  color: #66b1ff;
}

.amount {
  font-weight: 600;
  color: #f56c6c;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  background: #f5f7fa;
  border-radius: 10px;
  text-decoration: none;
  color: #606266;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #ecf5ff;
  color: #409eff;
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.status-distribution h4 {
  font-size: 0.95rem;
  color: #606266;
  margin: 0 0 12px;
}

.status-bar {
  display: flex;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f7fa;
  margin-bottom: 12px;
}

.status-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.status-segment.待付款 {
  background: #909399;
}

.status-segment.处理中 {
  background: #e6a23c;
}

.status-segment.已完成 {
  background: #67c23a;
}

.status-segment.已取消 {
  background: #f56c6c;
}

.status-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #606266;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.待付款 {
  background: #909399;
}

.legend-dot.处理中 {
  background: #e6a23c;
}

.legend-dot.已完成 {
  background: #67c23a;
}

.legend-dot.已取消 {
  background: #f56c6c;
}

@media (max-width: 992px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 1.25rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
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

  .recent-orders-card,
  .quick-actions-card {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
