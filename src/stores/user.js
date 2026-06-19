import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEYS = {
  USERS: 'oms_registeredUsers',
  TOKEN_LOCAL: 'oms_token',
  USER_LOCAL: 'oms_currentUser',
  TOKEN_SESSION: 'oms_token_session',
  USER_SESSION: 'oms_currentUser_session',
  REMEMBER_ME: 'oms_rememberMe',
  SAVED_USERNAME: 'oms_savedUsername',
  RESET_TOKENS: 'oms_resetTokens'
}

const defaultUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    email: 'a****@***********',
    nickname: '系统管理员',
    avatar: '',
    role: 'admin',
    createdAt: '2024-01-01'
  }
]

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const token = ref('')
  const rememberMe = ref(localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true')
  const savedUsername = ref(localStorage.getItem(STORAGE_KEYS.SAVED_USERNAME) || '')

  const isLoggedIn = computed(() => !!token.value && !!currentUser.value)
  const userInfo = computed(() => currentUser.value)

  const getAllUsers = () => {
    let registeredUsers = []
    try {
      registeredUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    } catch (e) {
      registeredUsers = []
    }
    return [...defaultUsers, ...registeredUsers]
  }

  const saveRegisteredUsers = (users) => {
    const customUsers = users.filter(u => u.id !== 1)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(customUsers))
  }

  const getStoredAuth = () => {
    const localToken = localStorage.getItem(STORAGE_KEYS.TOKEN_LOCAL)
    const localUser = localStorage.getItem(STORAGE_KEYS.USER_LOCAL)
    if (localToken && localUser) {
      return { token: localToken, user: localUser, fromLocal: true }
    }
    const sessionToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN_SESSION)
    const sessionUser = sessionStorage.getItem(STORAGE_KEYS.USER_SESSION)
    if (sessionToken && sessionUser) {
      return { token: sessionToken, user: sessionUser, fromLocal: false }
    }
    return null
  }

  const clearStoredAuth = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN_LOCAL)
    localStorage.removeItem(STORAGE_KEYS.USER_LOCAL)
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN_SESSION)
    sessionStorage.removeItem(STORAGE_KEYS.USER_SESSION)
  }

  const initUser = () => {
    const stored = getStoredAuth()
    if (stored) {
      token.value = stored.token
      try {
        currentUser.value = JSON.parse(stored.user)
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

    const newToken = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    token.value = newToken
    currentUser.value = { ...user, password: undefined }
    
    clearStoredAuth()
    
    rememberMe.value = remember
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.TOKEN_LOCAL, newToken)
      localStorage.setItem(STORAGE_KEYS.USER_LOCAL, JSON.stringify(currentUser.value))
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true')
      localStorage.setItem(STORAGE_KEYS.SAVED_USERNAME, username)
      savedUsername.value = username
    } else {
      sessionStorage.setItem(STORAGE_KEYS.TOKEN_SESSION, newToken)
      sessionStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(currentUser.value))
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME)
      localStorage.removeItem(STORAGE_KEYS.SAVED_USERNAME)
      savedUsername.value = ''
    }

    return currentUser.value
  }

  const register = async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 600))

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

    const customUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    customUsers.push(newUser)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(customUsers))

    return { ...newUser, password: undefined }
  }

  const logout = () => {
    token.value = ''
    currentUser.value = null
    clearStoredAuth()
  }

  const generateResetToken = async (email) => {
    await new Promise(resolve => setTimeout(resolve, 800))

    const allUsers = getAllUsers()
    const user = allUsers.find(u => u.email === email)

    if (!user) {
      throw new Error('该邮箱未注册')
    }

    const resetToken = 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    let resetTokens = {}
    try {
      resetTokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS) || '{}')
    } catch (e) {
      resetTokens = {}
    }
    
    resetTokens[resetToken] = {
      userId: user.id,
      email: email,
      expires: Date.now() + 30 * 60 * 1000
    }
    localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(resetTokens))

    return { resetToken, email }
  }

  const validateResetToken = (token) => {
    try {
      const resetTokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS) || '{}')
      const tokenData = resetTokens[token]
      if (!tokenData) return { valid: false, message: '重置链接无效或已过期' }
      if (Date.now() > tokenData.expires) {
        delete resetTokens[token]
        localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(resetTokens))
        return { valid: false, message: '重置链接已过期，请重新申请' }
      }
      return { valid: true, userId: tokenData.userId, email: tokenData.email }
    } catch (e) {
      return { valid: false, message: '重置链接无效' }
    }
  }

  const resetPassword = async (token, newPassword) => {
    await new Promise(resolve => setTimeout(resolve, 600))

    const validation = validateResetToken(token)
    if (!validation.valid) {
      throw new Error(validation.message)
    }

    const allUsers = getAllUsers()
    const userIndex = allUsers.findIndex(u => u.id === validation.userId)
    if (userIndex === -1) {
      throw new Error('用户不存在')
    }

    allUsers[userIndex].password = newPassword
    saveRegisteredUsers(allUsers)

    const resetTokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS) || '{}')
    delete resetTokens[token]
    localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(resetTokens))

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
    generateResetToken,
    validateResetToken,
    resetPassword
  }
})
