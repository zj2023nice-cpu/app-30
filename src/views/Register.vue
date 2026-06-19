<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- 头部 -->
      <div class="auth-header">
        <img src="/favicon.svg" alt="Logo" class="auth-logo" />
        <h1 class="auth-title">创建账号</h1>
        <p class="auth-subtitle">注册成为系统用户，开始使用订单管理</p>
      </div>

      <!-- 注册表单 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        class="auth-form"
        @submit.prevent="handleSubmit"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名（3-20位字母、数字或下划线）"
            size="large"
            :prefix-icon="User"
            clearable
            autocomplete="username"
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码（6-20位）"
            size="large"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
          />
          <!-- 密码强度指示器 -->
          <div class="password-strength" :class="passwordStrength">
            <div class="strength-bar"></div>
            <div class="strength-bar"></div>
            <div class="strength-bar"></div>
          </div>
          <div class="strength-text" v-if="formData.password">
            密码强度：{{ passwordStrengthText }}
          </div>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>

        <!-- 邮箱 -->
        <el-form-item prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱（选填）"
            size="large"
            :prefix-icon="Message"
            clearable
            autocomplete="email"
          />
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            :loading="loading"
            @click="handleSubmit"
          >
            {{ loading ? '注册中...' : '注 册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部 -->
      <div class="auth-footer">
        <p>
          已有账号？
          <router-link to="/login">返回登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { usernameRules, passwordRules, emailRules } from '@/utils/validators'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const formRef = ref(null)

// 加载状态
const loading = ref(false)

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// 确认密码验证规则
const confirmPasswordRules = [
  { required: true, message: '请再次输入密码', trigger: 'blur' },
  {
    validator: (rule, value, callback) => {
      if (value !== formData.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    trigger: 'blur'
  }
]

// 表单验证规则
const formRules = {
  username: usernameRules,
  password: passwordRules,
  confirmPassword: confirmPasswordRules,
  email: emailRules
}

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = formData.password
  if (!pwd) return ''
  
  let strength = 0
  // 长度检查
  if (pwd.length >= 8) strength++
  // 包含数字
  if (/\d/.test(pwd)) strength++
  // 包含字母
  if (/[a-zA-Z]/.test(pwd)) strength++
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++

  if (strength <= 1) return 'weak'
  if (strength <= 2) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  const strengthMap = {
    weak: '弱',
    medium: '中等',
    strong: '强'
  }
  return strengthMap[passwordStrength.value] || ''
})

// 提交注册
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 验证表单
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    // 调用注册
    await userStore.register({
      username: formData.username,
      password: formData.password,
      email: formData.email
    })

    ElMessage.success('注册成功，请登录')

    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    ElMessage.error(error.message || '注册失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 密码强度样式在全局 main.css 中定义 */
</style>
