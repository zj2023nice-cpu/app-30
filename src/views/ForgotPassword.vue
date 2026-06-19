<template>
  <div class="auth-container">
    <div class="auth-card">
      <router-link to="/login" class="back-link">
        <el-icon><ArrowLeft /></el-icon>
        返回登录
      </router-link>

      <div class="auth-header">
        <img src="/favicon.svg" alt="Logo" class="auth-logo" />
        <h1 class="auth-title">找回密码</h1>
        <p class="auth-subtitle">{{ stepText }}</p>
      </div>

      <div v-if="step === 3" class="success-container">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <h2 class="success-title">密码重置成功</h2>
        <p class="success-desc">您的密码已成功重置，请使用新密码登录</p>
        <el-button type="primary" @click="router.push('/login')">
          立即登录
        </el-button>
      </div>

      <el-form
        v-else
        ref="formRef"
        :model="formData"
        :rules="currentRules"
        class="auth-form"
        @submit.prevent="handleSubmit"
      >
        <template v-if="step === 1">
          <el-form-item prop="email">
            <el-input
              v-model="formData.email"
              placeholder="请输入注册邮箱"
              size="large"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>
          <el-alert
            v-if="mockCodeVisible"
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 20px;"
          >
            <template #title>
              <span style="font-size: 13px;">模拟邮件验证码：<strong style="font-size: 16px; letter-spacing: 2px; color: #409eff;">{{ mockCode }}</strong></span>
            </template>
          </el-alert>
        </template>

        <template v-if="step === 2">
          <el-form-item prop="code">
            <el-input
              v-model="formData.code"
              placeholder="请输入6位验证码"
              size="large"
              :prefix-icon="Key"
              maxlength="6"
              clearable
            />
          </el-form-item>
          <el-form-item prop="newPassword">
            <el-input
              v-model="formData.newPassword"
              type="password"
              placeholder="请输入新密码（6-20位）"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
        </template>

        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            :loading="loading"
            @click="handleSubmit"
          >
            {{ loading ? loadingText : buttonText }}
          </el-button>
        </el-form-item>

        <div v-if="step === 2" class="resend-row">
          <span>没有收到验证码？</span>
          <el-button
            v-if="countdown === 0"
            type="text"
            @click="resendCode"
          >重新发送</el-button>
          <span v-else class="countdown">{{ countdown }}秒后可重新发送</span>
        </div>
      </el-form>

      <div class="auth-footer" v-if="step !== 3">
        <p>
          想起密码了？
          <router-link to="/login">返回登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, ArrowLeft, CircleCheck, Lock, Key } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const step = ref(1)
const mockCode = ref('')
const mockCodeVisible = ref(false)
const countdown = ref(0)
let countdownTimer = null

const formData = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

const stepText = computed(() => {
  const texts = ['请输入您的注册邮箱，我们将发送重置验证码', '请输入验证码并设置新密码', '']
  return texts[step.value - 1] || ''
})

const buttonText = computed(() => step.value === 1 ? '发送验证码' : '重置密码')
const loadingText = computed(() => step.value === 1 ? '发送中...' : '重置中...')

const confirmPasswordRules = [
  { required: true, message: '请再次输入密码', trigger: 'blur' },
  {
    validator: (rule, value, callback) => {
      if (value !== formData.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    trigger: 'blur'
  }
]

const rulesStep1 = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const rulesStep2 = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 个字符', trigger: 'blur' }
  ],
  confirmPassword: confirmPasswordRules
}

const currentRules = computed(() => step.value === 1 ? rulesStep1 : rulesStep2)

const startCountdown = () => {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    if (step.value === 1) {
      const result = await userStore.requestPasswordReset(formData.email)
      mockCode.value = result.resetCode
      mockCodeVisible.value = true
      ElMessage.success('验证码已发送到您的邮箱')
      startCountdown()
      step.value = 2
    } else {
      await userStore.resetPassword(formData.email, formData.code, formData.newPassword)
      step.value = 3
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败，请重试')
  } finally {
    loading.value = false
  }
}

const resendCode = async () => {
  try {
    loading.value = true
    const result = await userStore.requestPasswordReset(formData.email)
    mockCode.value = result.resetCode
    ElMessage.success('验证码已重新发送')
    startCountdown()
  } catch (error) {
    ElMessage.error(error.message || '发送失败，请重试')
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.resend-row {
  text-align: center;
  margin-top: -12px;
  font-size: 0.9rem;
  color: #909399;
}
.resend-row .el-button {
  padding: 0;
  margin-left: 4px;
}
.countdown {
  color: #c0c4cc;
}
</style>
