import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setStorage, getStorage, removeStorage } from '@/utils/storage'

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
  }
]

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const token = ref(getStorage('token') || '')
  const rememberMe = ref(getStorage('rememberMe') === true)
  const savedUsername = ref(getStorage('savedUsername') || '')
  const resetCode = ref('')
  const resetEmail = ref('')

  const isLoggedIn = computed(() => !!token.value && !!currentUser.value)
  const userInfo = computed(() => currentUser.value)

  const getAllUsers = () => {
    const registeredUsers = getStorage('registeredUsers', [])
    return [...mockUsers, ...registeredUsers]
  }

  const initUser = () => {
    const savedToken = getStorage('token')
    const savedUser = getStorage('currentUser')
    if (savedToken && savedUser) {
      token.value = savedToken
      try {
        currentUser.value = typeof savedUser === 'string' ? JSON.parse(savedUser) : savedUser
      } catch (e) {
        logout()
      }
    }
  }

  const login = async (username, password, remember = false) => {
    await new Promise(resolve => setTimeout(resolve, 600))

    const allUsers = getAllUsers()
    const user = allUsers.find(u => u.username === username && u.password === password)

    if (!user) {
      throw new Error('用户名或密码错误')
    }

    const newToken = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2)
    
    token.value = newToken
    currentUser.value = { ...user, password: undefined }
    
    setStorage('token', newToken)
    setStorage('currentUser', currentUser.value)

    rememberMe.value = remember
    if (remember) {
      setStorage('rememberMe', true)
      setStorage('savedUsername', username)
      savedUsername.value = username
    } else {
      removeStorage('rememberMe')
      removeStorage('savedUsername')
      savedUsername.value = ''
    }

    return currentUser.value
  }

  const register = async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 600))

    const registeredUsers = getStorage('registeredUsers', [])
    const allUsers = getAllUsers()

    if (allUsers.some(u => u.username === userData.username)) {
      throw new Error('用户名已存在')
    }

    if (userData.email && allUsers.some(u => u.email === userData.email)) {
      throw new Error('邮箱已被注册')
    }

    const newUser = {
      id: Date.now(),
      username: userData.username,
      password: userData.password,
      email: userData.email || '',
      nickname: userData.nickname || userData.username,
      avatar: '',
      role: 'user',
      createdAt: new Date().toISOString().split('T')[0]
    }

    registeredUsers.push(newUser)
    setStorage('registeredUsers', registeredUsers)

    return { ...newUser, password: undefined }
  }

  const logout = () => {
    token.value = ''
    currentUser.value = null
    removeStorage('token')
    removeStorage('currentUser')
  }

  const sendResetPasswordEmail = async (email) => {
    await new Promise(resolve => setTimeout(resolve, 800))

    const allUsers = getAllUsers()
    const user = allUsers.find(u => u.email === email)

    if (!user) {
      throw new Error('该邮箱未注册')
    }

    const code = Math.random().toString(36).substr(2, 6).toUpperCase()
    resetCode.value = code
    resetEmail.value = email

    setStorage('resetCode', code)
    setStorage('resetEmail', email)
    setStorage('resetCodeExpire', Date.now() + 10 * 60 * 1000)

    return { code, email }
  }

  const verifyResetCode = async (email, code) => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const savedCode = getStorage('resetCode')
    const savedEmail = getStorage('resetEmail')
    const expireTime = getStorage('resetCodeExpire', 0)

    if (Date.now() > expireTime) {
      throw new Error('验证码已过期，请重新获取')
    }

    if (email !== savedEmail || code.toUpperCase() !== savedCode) {
      throw new Error('验证码错误')
    }

    return true
  }

  const resetPassword = async (email, code, newPassword) => {
    await new Promise(resolve => setTimeout(resolve, 600))

    await verifyResetCode(email, code)

    const registeredUsers = getStorage('registeredUsers', [])
    const mockUserIndex = mockUsers.findIndex(u => u.email === email)
    
    if (mockUserIndex !== -1) {
      mockUsers[mockUserIndex].password = newPassword
    }

    const userIndex = registeredUsers.findIndex(u => u.email === email)
    if (userIndex !== -1) {
      registeredUsers[userIndex].password = newPassword
      setStorage('registeredUsers', registeredUsers)
    }

    removeStorage('resetCode')
    removeStorage('resetEmail')
    removeStorage('resetCodeExpire')
    resetCode.value = ''
    resetEmail.value = ''

    return true
  }

  initUser()

  return {
    currentUser,
    token,
    rememberMe,
    savedUsername,
    resetCode,
    resetEmail,
    isLoggedIn,
    userInfo,
    login,
    register,
    logout,
    sendResetPasswordEmail,
    verifyResetCode,
    resetPassword
  }
})
