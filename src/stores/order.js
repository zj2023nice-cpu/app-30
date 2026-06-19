import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'oms_orders'

const defaultOrders = [
  { id: 1, orderNo: 'ORD-202401-0001', customer: '张三', amount: 1580.00, status: '已完成', remark: '首批采购订单', createTime: '2024-01-15 14:30:00' },
  { id: 2, orderNo: 'ORD-202401-0002', customer: '李四', amount: 2350.50, status: '处理中', remark: '等待发货', createTime: '2024-01-15 10:20:00' },
  { id: 3, orderNo: 'ORD-202401-0003', customer: '王五', amount: 890.00, status: '待付款', remark: '', createTime: '2024-01-14 16:45:00' },
  { id: 4, orderNo: 'ORD-202401-0004', customer: '赵六', amount: 3200.00, status: '已完成', remark: 'VIP客户订单', createTime: '2024-01-14 09:15:00' },
  { id: 5, orderNo: 'ORD-202401-0005', customer: '钱七', amount: 1120.00, status: '已取消', remark: '客户主动取消', createTime: '2024-01-13 11:30:00' }
]

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])

  const totalOrders = computed(() => orders.value.length)
  const pendingPayment = computed(() => orders.value.filter(o => o.status === '待付款').length)
  const completedOrders = computed(() => orders.value.filter(o => o.status === '已完成').length)
  const customerCount = computed(() => new Set(orders.value.map(o => o.customer)).size)

  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.value))
  }

  const initOrders = () => {
    const savedOrders = localStorage.getItem(STORAGE_KEY)
    if (savedOrders) {
      try {
        orders.value = JSON.parse(savedOrders)
      } catch (e) {
        console.error('Failed to parse orders:', e)
        orders.value = [...defaultOrders]
        saveToStorage()
      }
    } else {
      orders.value = [...defaultOrders]
      saveToStorage()
    }
  }

  const generateOrderNo = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    let orderNo = `ORD-${year}${month}${day}${hours}${minutes}${seconds}${random}`
    let suffix = 1
    while (orders.value.some(o => o.orderNo === orderNo)) {
      orderNo = `ORD-${year}${month}${day}${hours}${minutes}${seconds}${random}-${suffix}`
      suffix++
    }
    return orderNo
  }

  const addOrder = (orderData) => {
    const order = {
      id: Date.now(),
      orderNo: generateOrderNo(),
      customer: orderData.customer,
      amount: Number(orderData.amount) || 0,
      status: orderData.status || '待付款',
      remark: orderData.remark || '',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    }
    orders.value.unshift(order)
    saveToStorage()
    return order
  }

  const updateOrder = (orderNo, updates) => {
    const index = orders.value.findIndex(o => o.orderNo === orderNo)
    if (index === -1) {
      throw new Error('订单不存在')
    }

    const existingOrder = orders.value[index]
    
    if (existingOrder.status === '已完成') {
      if (updates.customer !== undefined && updates.customer !== existingOrder.customer) {
        throw new Error('已完成的订单不能修改客户信息')
      }
      if (updates.amount !== undefined && Number(updates.amount) !== Number(existingOrder.amount)) {
        throw new Error('已完成的订单不能修改金额')
      }
    }

    orders.value[index] = {
      ...existingOrder,
      ...updates,
      amount: Number(updates.amount !== undefined ? updates.amount : existingOrder.amount)
    }
    saveToStorage()
    return orders.value[index]
  }

  const deleteOrder = (orderNo) => {
    const index = orders.value.findIndex(o => o.orderNo === orderNo)
    if (index === -1) {
      throw new Error('订单不存在')
    }
    orders.value.splice(index, 1)
    saveToStorage()
    return true
  }

  const getOrderByNo = (orderNo) => {
    return orders.value.find(o => o.orderNo === orderNo)
  }

  const searchOrders = ({ customer, orderNo, status } = {}) => {
    return orders.value.filter(order => {
      const matchCustomer = !customer || order.customer.includes(customer)
      const matchOrderNo = !orderNo || order.orderNo.toLowerCase().includes(orderNo.toLowerCase())
      const matchStatus = !status || order.status === status
      return matchCustomer && matchOrderNo && matchStatus
    })
  }

  initOrders()

  return {
    orders,
    totalOrders,
    pendingPayment,
    completedOrders,
    customerCount,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrderByNo,
    searchOrders,
    generateOrderNo
  }
})
