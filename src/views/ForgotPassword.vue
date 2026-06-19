<template>
  <div class="auth-container">
    <div class="auth-card">
      <router-link to="/login" class="back-link">
        <el-icon><ArrowLeft /></el-icon>
        返回登录
      </router-link>

      <div class="auth-header">
        <img src="/favicon.svg" alt="Logo" class="auth-logo" />
        <h1 class="auth-title">忘记密码</h1>
        <p class="auth-subtitle">
          {{ currentStep === 'email' ? '请输入您的注册邮箱，我们将发送验证码' : 
             currentStep === 'verify' ? '请输入收到的验证码和新密码' : '密码重置成功' }}
        </p>
      </div>

      <div v-if="currentStep === 'email'" class="step-container">
        <el-form
          ref="emailFormRef"
          :model="emailForm"
          :rules="emailRules"
          class="auth-form"
          @submit.prevent="handleSendEmail"
        >
          <el-form-item prop="email">
            <el-input
              v-model="emailForm.email"
              placeholder="请输入注册邮箱"
              size="large"
              :prefix-icon="Message"
              clearable
              autocomplete="email"
              @keyup.enter="handleSendEmail"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="submit-btn"
              :loading="loading"
              @click="handleSendEmail"
            >
              {{ loading ? '发送中...' : '发送验证码' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div v-if="mockCode" class="mock-email-box">
          <el-alert
            title="模拟邮件已发送"
            type="success"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>验证码已发送至 <strong>{{ emailForm.email }}</strong></p>
              <p class="code-display">
                您的验证码是：<span class="code-text">{{ mockCode }}</span>
              </p>
              <p class="code-tip">（演示环境直接显示，实际场景会发送到邮箱）</p>
            </template>
          </el-alert>
        </div>
      </div>

      <div v-else-if="currentStep === 'verify'" class="step-container">
        <el-form
          ref="resetFormRef"
          :model="resetForm"
          :rules="resetRules"
          class="auth-form"
        >
          <el-form-item prop="code">
            <el-input
              v-model="resetForm.code"
              placeholder="请输入6位验证码"
              size="large"
              :prefix-icon="Key"
              clearable
              maxlength="6"
              style="text-transform: uppercase;"
            />
          </el-form-item>

          <el-form-item prop="newPassword">
            <el-input
              v-model="resetForm.newPassword"
              type="password"
              placeholder="请输入新密码（6-20位）"
              size="large"
              :prefix-icon="Lock"
              show-password
              autocomplete="new-password"
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="resetForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              autocomplete="new-password"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="submit-btn"
              :loading="loading"
              @click="handleResetPassword"
            >
              {{ loading ? '重置中...' : '重置密码' }}
            </el-button>
          </el-form-item>

          <div class="resend-row">
            <span>没有收到验证码？</span>
            <el-button link type="primary" :disabled="countdown > 0" @click="handleResend">
              {{ countdown > 0 ? `${countdown}秒后重新发送` : '重新发送' }}
            </el-button>
          </div>
        </el-form>
      </div>

      <div v-else class="success-container">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <h2 class="success-title">密码重置成功</h2>
        <p class="success-desc">
          您的密码已成功重置，请使用新密码登录。
        </p>
        <el-button type="primary" class="submit-btn" @click="router.push('/login')">
          去登录
        </el-button>
      </div>

      <div class="auth-footer" v-if="currentStep !== 'success'">
        <p>
          想起密码了？
          <router-link to="/login">返回登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, ArrowLeft, CircleCheck, Lock, Key } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { passwordRules } from '@/utils/validators'

const router = useRouter()
const userStore = useUserStore()

const emailFormRef = ref(null)
const resetFormRef = ref(null)
const loading = ref(false)
const currentStep = ref('email')
const mockCode = ref('')
const countdown = ref(0)
let countdownTimer = null

const emailForm = reactive({
  email: ''
})

const resetForm = reactive({
  code: '',
  newPassword: '',
  confirmPassword: ''
})

const emailRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const confirmNewPasswordRules = [
  { required: true, message: '请再次输入密码', trigger: 'blur' },
  {
    validator: (rule, value, callback) => {
      if (value !== resetForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    trigger: 'blur'
  }
]

const resetRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位', trigger: 'blur' }
  ],
  newPassword: passwordRules,
  confirmPassword: confirmNewPasswordRules
}

const startCountdown = () => {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

const handleSendEmail = async () => {
  if (!emailFormRef.value) return

  try {
    const valid = await emailFormRef.value.validate()
    if (!valid) return

    loading.value = true
    const result = await userStore.sendResetPasswordEmail(emailForm.email)
    mockCode.value = result.code
    ElMessage.success('验证码已发送')
    currentStep.value = 'verify'
    startCountdown()
  } catch (error) {
    ElMessage.error(error.message || '发送失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleResend = async () => {
  if (countdown.value > 0) return
  try {
    loading.value = true
    const result = await userStore.sendResetPasswordEmail(emailForm.email)
    mockCode.value = result.code
    resetForm.code = ''
    ElMessage.success('验证码已重新发送')
    startCountdown()
  } catch (error) {
    ElMessage.error(error.message || '发送失败')
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  if (!resetFormRef.value) return

  try {
    const valid = await resetFormRef.value.validate()
    if (!valid) return

    loading.value = true
    await userStore.resetPassword(
      emailForm.email,
      resetForm.code,
      resetForm.newPassword
    )
    ElMessage.success('密码重置成功')
    currentStep.value = 'success'
  } catch (error) {
    ElMessage.error(error.message || '重置失败，请重试')
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
.mock-email-box {
  margin-top: 16px;
}

.mock-email-box .el-alert {
  border-radius: 8px;
}

.code-display {
  margin-top: 8px;
}

.code-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #67c23a;
  letter-spacing: 4px;
  font-family: 'Courier New', monospace;
}

.code-tip {
  margin-top: 4px;
  font-size: 0.8rem;
  color: #909399;
}

.resend-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #606266;
}

.step-container {
  margin-bottom: 20px;
}
</style>
