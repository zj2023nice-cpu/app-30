/**
 * 表单验证规则工厂函数
 */

/**
 * 用户名验证规则
 */
export const usernameRules = [
  { required: true, message: '请输入用户名', trigger: 'blur' },
  { min: 3, max: 20, message: '用户名长度为 3-20 个字符', trigger: 'blur' },
  { 
    pattern: /^[a-zA-Z0-9_]+$/, 
    message: '用户名只能包含字母、数字和下划线', 
    trigger: 'blur' 
  }
]

/**
 * 密码验证规则
 */
export const passwordRules = [
  { required: true, message: '请输入密码', trigger: 'blur' },
  { min: 6, max: 20, message: '密码长度为 6-20 个字符', trigger: 'blur' }
]

/**
 * 确认密码验证规则工厂
 * @param {Function} getPassword - 获取密码值的函数
 */
export const confirmPasswordRules = (getPassword) => [
  { required: true, message: '请再次输入密码', trigger: 'blur' },
  {
    validator: (rule, value, callback) => {
      if (value !== getPassword()) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    trigger: 'blur'
  }
]

/**
 * 邮箱验证规则（可选填写）
 */
export const emailRules = [
  {
    validator: (rule, value, callback) => {
      if (!value) {
        // 如果为空，直接通过
        callback()
      } else {
        // 如果有值，验证格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          callback(new Error('请输入正确的邮箱格式'))
        } else {
          callback()
        }
      }
    },
    trigger: 'blur'
  }
]

/**
 * 必填邮箱验证规则
 */
export const requiredEmailRules = [
  { required: true, message: '请输入邮箱地址', trigger: 'blur' },
  { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
]

/**
 * 手机号验证规则（可选填写）
 */
export const phoneRules = [
  {
    validator: (rule, value, callback) => {
      if (!value) {
        callback()
      } else {
        const phoneRegex = /^1[3-9]\d{9}$/
        if (!phoneRegex.test(value)) {
          callback(new Error('请输入正确的手机号格式'))
        } else {
          callback()
        }
      }
    },
    trigger: 'blur'
  }
]
