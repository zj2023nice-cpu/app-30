import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setStorage, getStorage, removeStorage } from '@/utils/storage'

const defaultUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    email: 'a****@***********',
    nickname: '系统管理员',
    role: 'admin',
    createdAt: '2024-01-01'
  }
]

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const token = ref('')
  const rememberMe = ref(false)
  const savedUsername = ref('')

  const isLoggedIn = computed(() => !!token.value && !!currentUser.value)
  const userInfo = computed(() => currentUser.value)

  const getUsers = () => {
    const registered = getStorage('registeredUsers', [])
    return [...defaultUsers, ...registered]
  }

  const saveUsers = (users) => {
    const registered = users.filter(u => !defaultUsers.find(d => d.id === u.id))
    setStorage('registeredUsers', registered)
  }

  const initUser = () => {
    const remembered = getStorage('rememberMe', false)
    const savedName = getStorage('savedUsername', '')

    rememberMe.value = remembered
    savedUsername.value = savedName

    if (remembered) {
      const savedToken = getStorage('token')
      const savedUser = getStorage('currentUser')
      if (savedToken && savedUser) {
        token.value = savedToken
        currentUser.value = savedUser
      }
    } else {
      removeStorage('token')
      removeStorage('currentUser')
      token.value = ''
      currentUser.value = null
    }
  }

  const login = async (username, password, remember = false) => {
    await new Promise(resolve => setTimeout(resolve, 600))

    const allUsers = getUsers()
    const user = allUsers.find(u => u.username === username && u.password === password)

    if (!user) {
      throw new Error('用户名或密码错误')
    }

    const newToken = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2)
    token.value = newToken
    currentUser.value = { ...user, password: undefined }

    setStorage('rememberMe', remember)
    setStorage('savedUsername', username)
    rememberMe.value = remember
    savedUsername.value = username

    if (remember) {
      setStorage('token', newToken)
      setStorage('currentUser', currentUser.value)
    } else {
      removeStorage('token')
      removeStorage('currentUser')
    }

    return currentUser.value
  }

  const register = async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 600))

    const allUsers = getUsers()

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
      role: 'user',
      createdAt: new Date().toISOString().split('T')[0]
    }

    const registered = getStorage('registeredUsers', [])
    registered.push(newUser)
    setStorage('registeredUsers', registered)

    return { ...newUser, password: undefined }
  }

  const logout = () => {
    token.value = ''
    currentUser.value = null
    removeStorage('token')
    removeStorage('currentUser')
  }

  const requestPasswordReset = async (email) => {
    await new Promise(resolve => setTimeout(resolve, 800))

    const allUsers = getUsers()
    const user = allUsers.find(u => u.email === email)

    if (!user) {
      throw new Error('该邮箱未注册')
    }

    const resetCode = Math.random().toString(36).substr(2, 6).toUpperCase()
    setStorage('resetCode', { code: resetCode, email, expireTime: Date.now() + 10 * 60 * 1000 })

    return { email, resetCode }
  }

  const verifyResetCode = async (email, code) => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const resetData = getStorage('resetCode')
    if (!resetData) {
      throw new Error('验证码已过期，请重新获取')
    }

    if (resetData.email !== email) {
      throw new Error('邮箱与验证码不匹配')
    }

    if (Date.now() > resetData.expireTime) {
      removeStorage('resetCode')
      throw new Error('验证码已过期，请重新获取')
    }

    if (resetData.code !== code.toUpperCase()) {
      throw new Error('验证码错误')
    }

    return true
  }

  const resetPassword = async (email, code, newPassword) => {
    await verifyResetCode(email, code)

    const allUsers = getUsers()
    const userIndex = allUsers.findIndex(u => u.email === email)

    if (userIndex === -1) {
      throw new Error('用户不存在')
    }

    allUsers[userIndex].password = newPassword
    saveUsers(allUsers)

    removeStorage('resetCode')

    return true
  }

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
    requestPasswordReset,
    verifyResetCode,
    resetPassword
  }
})
