import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 模拟用户数据库
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    email: 'admin@example.com',
    nickname: '系统管理员',
    avatar: '',
    role: 'admin',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    username: 'zhangsan',
    password: 'user123',
    email: 'zhangsan@example.com',
    nickname: '张三',
    avatar: '',
    role: 'user',
    createdAt: '2024-01-05'
  },
  {
    id: 3,
    username: 'lisi',
    password: 'user123',
    email: 'lisi@example.com',
    nickname: '李四',
    avatar: '',
    role: 'user',
    createdAt: '2024-01-10'
  }
]

// 统一的鉴权信息读取：优先 localStorage（记住我），回退到 sessionStorage（仅本次会话）
const readAuth = () => {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token') || ''
  const userStr =
    localStorage.getItem('currentUser') ||
    sessionStorage.getItem('currentUser') ||
    ''
  return { token, userStr }
}

// 清除两个 storage 中的登录信息，避免残留
const clearAuthStorage = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('currentUser')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('currentUser')
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref(null)
  const token = ref('')
  const rememberMe = ref(localStorage.getItem('rememberMe') === 'true')
  const savedUsername = ref(localStorage.getItem('savedUsername') || '')

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!currentUser.value)
  const userInfo = computed(() => currentUser.value)

  // 初始化：检查是否已登录（同时兼容 localStorage 与 sessionStorage）
  const initUser = () => {
    const { token: savedToken, userStr } = readAuth()
    if (savedToken && userStr) {
      token.value = savedToken
      try {
        currentUser.value = JSON.parse(userStr)
      } catch (e) {
        logout()
      }
    }
  }

  // 登录
  const login = async (username, password, remember = false) => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 查找用户（包括新注册的用户）
    let registeredUsers = []
    try {
        registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    } catch (e) {
        registeredUsers = []
    }

    const allUsers = [...mockUsers, ...registeredUsers]
    const user = allUsers.find(u => u.username === username && u.password === password)

    if (!user) {
      throw new Error('用户名或密码错误')
    }

    // 生成模拟token
    const newToken = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2)

    // 更新内存中的状态
    token.value = newToken
    currentUser.value = { ...user, password: undefined }

    // 持久化策略：
    // - 勾选「记住我」：写入 localStorage，关闭浏览器后仍保持登录
    // - 未勾选：仅写入 sessionStorage，浏览器关闭/新开窗口即失效
    // 写入前先清除两个 storage，避免上次会话的残留干扰
    clearAuthStorage()
    const storage = remember ? localStorage : sessionStorage
    storage.setItem('token', newToken)
    storage.setItem('currentUser', JSON.stringify(currentUser.value))

    // 「记住我」勾选状态本身始终持久化在 localStorage（用于回填用户名）
    rememberMe.value = remember
    if (remember) {
      localStorage.setItem('rememberMe', 'true')
      localStorage.setItem('savedUsername', username)
      savedUsername.value = username
    } else {
      localStorage.removeItem('rememberMe')
      localStorage.removeItem('savedUsername')
      savedUsername.value = ''
    }

    return currentUser.value
  }

  // 注册
  const register = async (userData) => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 获取已注册用户
    let registeredUsers = []
    try {
        registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    } catch (e) {
        registeredUsers = []
    }
    const allUsers = [...mockUsers, ...registeredUsers]

    // 检查用户名是否已存在
    if (allUsers.some(u => u.username === userData.username)) {
      throw new Error('用户名已存在')
    }

    // 检查邮箱是否已存在（如果提供了邮箱）
    if (userData.email && allUsers.some(u => u.email === userData.email)) {
      throw new Error('邮箱已被注册')
    }

    // 创建新用户
    const newUser = {
      id: Date.now(),
      username: userData.username,
      password: userData.password,
      email: userData.email || '',
      nickname: userData.username,
      avatar: '',
      role: 'user',
      createdAt: new Date().toISOString().split('T')[0]
    }

    // 保存新用户
    registeredUsers.push(newUser)
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))

    return { ...newUser, password: undefined }
  }

  // 登出
  const logout = () => {
    token.value = ''
    currentUser.value = null
    clearAuthStorage()
  }

  // 发送重置密码邮件（模拟）
  const sendResetPasswordEmail = async (email) => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const allUsers = [...mockUsers, ...registeredUsers]
    const user = allUsers.find(u => u.email === email)

    if (!user) {
      throw new Error('该邮箱未注册')
    }

    // 模拟发送邮件成功
    return true
  }

  // 初始化
  initUser()

  return {
    currentUser,
    token,
    rememberMe,
    savedUsername,
    isLoggedIn,
    userInfo,
    login,
    register,
    logout,
    sendResetPasswordEmail
  }
})
