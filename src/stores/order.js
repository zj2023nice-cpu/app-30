import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setStorage, getStorage, hasStorage } from '@/utils/storage'

const defaultOrders = [
  { id: 1, orderNo: 'ORD-2024-0001', customer: '张三', amount: 1580.00, status: '已完成', createTime: '2024-01-15 14:30:00', remark: '首批采购订单' },
  { id: 2, orderNo: 'ORD-2024-0002', customer: '李四', amount: 2350.50, status: '处理中', createTime: '2024-01-15 10:20:00', remark: '' },
  { id: 3, orderNo: 'ORD-2024-0003', customer: '王五', amount: 890.00, status: '待付款', createTime: '2024-01-14 16:45:00', remark: '待确认收货地址' },
  { id: 4, orderNo: 'ORD-2024-0004', customer: '赵六', amount: 3200.00, status: '已完成', createTime: '2024-01-14 09:15:00', remark: '' },
  { id: 5, orderNo: 'ORD-2024-0005', customer: '钱七', amount: 1120.00, status: '待付款', createTime: '2024-01-13 11:30:00', remark: '' }
]

const ORDER_STATUS = {
  PENDING_PAYMENT: '待付款',
  PROCESSING: '处理中',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])

  const totalOrders = computed(() => orders.value.length)
  const pendingPaymentCount = computed(() => orders.value.filter(o => o.status === ORDER_STATUS.PENDING_PAYMENT).length)
  const completedCount = computed(() => orders.value.filter(o => o.status === ORDER_STATUS.COMPLETED).length)
  const customerCount = computed(() => new Set(orders.value.map(o => o.customer)).size)

  const stats = computed(() => ({
    total: totalOrders.value,
    pendingPayment: pendingPaymentCount.value,
    completed: completedCount.value,
    customers: customerCount.value
  }))

  const generateOrderNo = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const count = orders.value.length + 1
    return `ORD-${year}-${count.toString().padStart(4, '0')}-${random}`
  }

  const initOrders = () => {
    if (hasStorage('orders')) {
      const savedOrders = getStorage('orders', [])
      orders.value = Array.isArray(savedOrders) ? savedOrders : []
    } else {
      orders.value = defaultOrders
      setStorage('orders', orders.value)
    }
  }

  const persistOrders = () => {
    setStorage('orders', orders.value)
  }

  const getOrderById = (id) => {
    return orders.value.find(o => o.id === id)
  }

  const getOrderByNo = (orderNo) => {
    return orders.value.find(o => o.orderNo === orderNo)
  }

  const addOrder = (orderData) => {
    const newOrder = {
      id: Date.now(),
      orderNo: generateOrderNo(),
      customer: orderData.customer,
      amount: Number(orderData.amount) || 0,
      status: orderData.status || ORDER_STATUS.PENDING_PAYMENT,
      remark: orderData.remark || '',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    }

    orders.value.unshift(newOrder)
    persistOrders()
    return newOrder
  }

  const updateOrder = (id, updateData) => {
    const index = orders.value.findIndex(o => o.id === id)
    if (index === -1) {
      throw new Error('订单不存在')
    }

    const existingOrder = orders.value[index]
    const targetStatus = updateData.status !== undefined ? updateData.status : existingOrder.status
    const isCompleted = targetStatus === ORDER_STATUS.COMPLETED

    if (isCompleted) {
      const newCustomer = updateData.customer !== undefined ? updateData.customer : existingOrder.customer
      const newAmount = updateData.amount !== undefined ? Number(updateData.amount) : Number(existingOrder.amount)

      if (newCustomer !== existingOrder.customer) {
        throw new Error('订单状态为"已完成"时不能修改客户信息')
      }
      if (newAmount !== Number(existingOrder.amount)) {
        throw new Error('订单状态为"已完成"时不能修改金额')
      }
    }

    orders.value[index] = {
      ...existingOrder,
      ...updateData,
      id: existingOrder.id,
      orderNo: existingOrder.orderNo,
      createTime: existingOrder.createTime,
      customer: isCompleted ? existingOrder.customer : (updateData.customer || existingOrder.customer),
      amount: isCompleted ? existingOrder.amount : (updateData.amount !== undefined ? Number(updateData.amount) : existingOrder.amount)
    }

    persistOrders()
    return orders.value[index]
  }

  const deleteOrder = (id) => {
    const index = orders.value.findIndex(o => o.id === id)
    if (index === -1) {
      throw new Error('订单不存在')
    }

    orders.value.splice(index, 1)
    persistOrders()
    return true
  }

  const searchOrders = ({ customer = '', orderNo = '' } = {}) => {
    return orders.value.filter(order => {
      const matchCustomer = !customer || order.customer.includes(customer)
      const matchOrderNo = !orderNo || order.orderNo.toLowerCase().includes(orderNo.toLowerCase())
      return matchCustomer && matchOrderNo
    })
  }

  const canEditOrder = (order) => {
    return order && order.status !== ORDER_STATUS.COMPLETED
  }

  const canEditField = (order, fieldName, targetStatus = null) => {
    const statusToCheck = targetStatus !== null ? targetStatus : (order?.status || '')
    if (statusToCheck === ORDER_STATUS.COMPLETED) {
      if (fieldName === 'customer' || fieldName === 'amount') {
        return false
      }
    }
    return true
  }

  initOrders()

  return {
    orders,
    stats,
    totalOrders,
    pendingPaymentCount,
    completedCount,
    customerCount,
    ORDER_STATUS,
    getOrderById,
    getOrderByNo,
    addOrder,
    updateOrder,
    deleteOrder,
    searchOrders,
    canEditOrder,
    canEditField
  }
})
