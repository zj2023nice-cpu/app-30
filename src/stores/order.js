import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setStorage, getStorage } from '@/utils/storage'

const STORAGE_KEY = 'orders'

const defaultOrders = [
  { orderNo: 'ORD-2024-0001', customer: '张三', amount: 1580.00, status: '已完成', createTime: '2024-01-15 14:30:00' },
  { orderNo: 'ORD-2024-0002', customer: '李四', amount: 2350.50, status: '处理中', createTime: '2024-01-15 10:20:00' },
  { orderNo: 'ORD-2024-0003', customer: '王五', amount: 890.00, status: '待付款', createTime: '2024-01-14 16:45:00' },
  { orderNo: 'ORD-2024-0004', customer: '赵六', amount: 3200.00, status: '已完成', createTime: '2024-01-14 09:15:00' },
  { orderNo: 'ORD-2024-0005', customer: '钱七', amount: 1120.00, status: '待付款', createTime: '2024-01-13 11:30:00' }
]

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])

  const totalOrders = computed(() => orders.value.length)
  const pendingPayment = computed(() => orders.value.filter(o => o.status === '待付款').length)
  const completedOrders = computed(() => orders.value.filter(o => o.status === '已完成').length)
  const customerCount = computed(() => new Set(orders.value.map(o => o.customer)).size)

  const initOrders = () => {
    const savedOrders = getStorage(STORAGE_KEY)
    if (savedOrders && Array.isArray(savedOrders) && savedOrders.length > 0) {
      orders.value = savedOrders
    } else {
      orders.value = [...defaultOrders]
      saveOrders()
    }
  }

  const saveOrders = () => {
    setStorage(STORAGE_KEY, orders.value)
  }

  const generateOrderNo = () => {
    const year = new Date().getFullYear()
    const maxNum = orders.value.reduce((max, o) => {
      const match = o.orderNo.match(/ORD-\d{4}-(\d+)/)
      if (match) {
        const num = parseInt(match[1])
        return num > max ? num : max
      }
      return max
    }, 0)
    const newNum = (maxNum + 1).toString().padStart(4, '0')
    return `ORD-${year}-${newNum}`
  }

  const formatDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const addOrder = (orderData) => {
    const order = {
      orderNo: generateOrderNo(),
      customer: orderData.customer,
      amount: parseFloat(orderData.amount) || 0,
      status: orderData.status || '待付款',
      createTime: formatDateTime()
    }
    orders.value.unshift(order)
    saveOrders()
    return order
  }

  const updateOrder = (updatedOrder) => {
    const index = orders.value.findIndex(o => o.orderNo === updatedOrder.orderNo)
    if (index !== -1) {
      const existingOrder = orders.value[index]
      const targetStatus = updatedOrder.status
      
      if (targetStatus === '已完成') {
        orders.value[index] = {
          ...existingOrder,
          status: '已完成',
          customer: existingOrder.customer,
          amount: existingOrder.amount
        }
      } else if (existingOrder.status === '已完成') {
        orders.value[index] = {
          ...existingOrder,
          status: targetStatus,
          customer: existingOrder.customer,
          amount: existingOrder.amount
        }
      } else {
        orders.value[index] = {
          ...existingOrder,
          customer: updatedOrder.customer,
          amount: parseFloat(updatedOrder.amount) || 0,
          status: targetStatus
        }
      }
      saveOrders()
      return true
    }
    return false
  }

  const deleteOrder = (orderNo) => {
    const index = orders.value.findIndex(o => o.orderNo === orderNo)
    if (index !== -1) {
      orders.value.splice(index, 1)
      saveOrders()
      return true
    }
    return false
  }

  const getOrderByNo = (orderNo) => {
    return orders.value.find(o => o.orderNo === orderNo)
  }

  const searchOrders = (customerKeyword = '', orderNoKeyword = '', statusKeyword = '') => {
    return orders.value.filter(order => {
      const matchCustomer = !customerKeyword || order.customer.includes(customerKeyword)
      const matchOrderNo = !orderNoKeyword || order.orderNo.toLowerCase().includes(orderNoKeyword.toLowerCase())
      const matchStatus = !statusKeyword || order.status === statusKeyword
      return matchCustomer && matchOrderNo && matchStatus
    })
  }

  const isOrderLocked = (order) => {
    return order.status === '已完成'
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
    isOrderLocked,
    generateOrderNo
  }
})
