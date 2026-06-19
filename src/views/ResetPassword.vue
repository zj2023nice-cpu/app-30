<template>
  <div class="auth-container">
    <div class="auth-card">
      <router-link to="/login" class="back-link">
        <el-icon><ArrowLeft /></el-icon>
        返回登录
      </router-link>

      <div class="auth-header">
        <img src="/favicon.svg" alt="Logo" class="auth-logo" />
        <h1 class="auth-title">重置密码</h1>
        <p class="auth-subtitle" v-if="tokenValid">请输入您的新密码</p>
        <p class="auth-subtitle" v-else>链接无效或已过期</p>
      </div>

      <div v-if="isSuccess" class="success-container">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <h2 class="success-title">密码重置成功</h2>
        <p class="success-desc">
          您的密码已成功重置，请使用新密码登录。
        </p>
        <el-button type="primary" @click="router.push('/login')">
          立即登录
        </el-button>
      </div>

      <div v-else-if="!tokenValid" class="error-container">
        <el-icon class="error-icon"><CircleClose /></el-icon>
        <h2 class="error-title">链接无效</h2>
        <p class="error-desc">{{ errorMessage }}</p>
        <div class="error-actions">
          <el-button type="primary" @click="router.push('/forgot-password')">
            重新申请重置
          </el-button>
          <el-button @click="router.push('/login')">
            返回登录
          </el-button>
        </div>
      </div>

      <el-form
        v-else
        ref="formRef"
        :model="formData"
        :rules="formRules"
        class="auth-form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
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
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            :loading="loading"
            @click="handleSubmit"
          >
            {{ loading ? '重置中...' : '重置密码' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Lock, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { passwordRules } from '@/utils/validators'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const isSuccess = ref(false)
const tokenValid = ref(false)
const errorMessage = ref('')
const token = ref('')

const formData = reactive({
  password: '',
  confirmPassword: ''
})

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

const formRules = {
  password: passwordRules,
  confirmPassword: confirmPasswordRules
}

onMounted(() => {
  token.value = route.query.token
  if (!token.value) {
    tokenValid.value = false
    errorMessage.value = '缺少重置令牌，请从邮件链接访问'
    return
  }
  const validation = userStore.validateResetToken(token.value)
  tokenValid.value = validation.valid
  errorMessage.value = validation.message
})

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    await userStore.resetPassword(token.value, formData.password)
    isSuccess.value = true
    ElMessage.success('密码重置成功')
  } catch (error) {
    ElMessage.error(error.message || '重置失败，请重试')
    if (error.message.includes('链接') || error.message.includes('过期')) {
      tokenValid.value = false
      errorMessage.value = error.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.error-container {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.error-icon {
  font-size: 64px;
  color: var(--danger-color);
  margin-bottom: var(--spacing-lg);
}

.error-title {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.error-desc {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
