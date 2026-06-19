import { defineStore } from 'pinia'
import { ref } from 'vue'

const mockOrders = [
  { orderNo: 'ORD-2024-001', customer: '张三', amount: 1580.00, status: '已完成', createTime: '2024-01-15 14:30' },
  { orderNo: 'ORD-2024-002', customer: '李四', amount: 2350.50, status: '处理中', createTime: '2024-01-15 10:20' },
  { orderNo: 'ORD-2024-003', customer: '王五', amount: 890.00, status: '待付款', createTime: '2024-01-14 16:45' },
  { orderNo: 'ORD-2024-004', customer: '赵六', amount: 3200.00, status: '已完成', createTime: '2024-01-14 09:15' },
  { orderNo: 'ORD-2024-005', customer: '钱七', amount: 1120.00, status: '已取消', createTime: '2024-01-13 11:30' }
]

export const useOrderStore = defineStore('order', () => {
    const orders = ref([])

    const initOrders = () => {
        const savedOrders = localStorage.getItem('orders')
        if (savedOrders) {
            try {
                orders.value = JSON.parse(savedOrders)
            } catch (e) {
                console.error('Failed to parse orders:', e)
                orders.value = mockOrders
                localStorage.setItem('orders', JSON.stringify(orders.value))
            }
        } else {
            orders.value = mockOrders
            localStorage.setItem('orders', JSON.stringify(orders.value))
        }
    }

    const addOrder = (order) => {
        orders.value.unshift(order)
        localStorage.setItem('orders', JSON.stringify(orders.value))
    }

    const updateOrder = (updatedOrder) => {
        const index = orders.value.findIndex(o => o.orderNo === updatedOrder.orderNo)
        if (index !== -1) {
            orders.value[index] = updatedOrder
            localStorage.setItem('orders', JSON.stringify(orders.value))
        }
    }

    const deleteOrder = (orderNo) => {
        orders.value = orders.value.filter(o => o.orderNo !== orderNo)
        localStorage.setItem('orders', JSON.stringify(orders.value))
    }

    initOrders()

    return {
        orders,
        addOrder,
        updateOrder,
        deleteOrder
    }
})
