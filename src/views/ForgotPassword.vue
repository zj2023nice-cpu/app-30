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
        <p class="auth-subtitle">请输入您的注册邮箱，我们将发送重置链接</p>
      </div>

      <div v-if="isSuccess" class="success-container">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <h2 class="success-title">邮件已发送</h2>
        <p class="success-desc">
          我们已向 <strong>{{ formData.email }}</strong> 发送了密码重置邮件。
        </p>
        
        <div class="simulated-email">
          <div class="email-header">
            <p class="email-subject">📧 模拟邮件内容</p>
          </div>
          <div class="email-body">
            <p>您好，</p>
            <p>您请求重置密码，请点击下方链接重置：</p>
            <div class="reset-link-box">
              <el-link type="primary" :href="resetLink" target="_blank" class="reset-link">
                {{ resetLink }}
              </el-link>
            </div>
            <p class="email-tip">（链接有效期30分钟，这是模拟邮件，请直接点击链接重置）</p>
          </div>
        </div>

        <div class="success-actions">
          <el-button type="primary" @click="goToReset">
            立即重置密码
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
        <el-form-item prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入注册邮箱"
            size="large"
            :prefix-icon="Message"
            clearable
            autocomplete="email"
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
            {{ loading ? '发送中...' : '发送重置链接' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="auth-footer" v-if="!isSuccess">
        <p>
          想起密码了？
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
import { Message, ArrowLeft, CircleCheck } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { requiredEmailRules } from '@/utils/validators'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const isSuccess = ref(false)
const resetToken = ref('')

const formData = reactive({
  email: ''
})

const formRules = {
  email: requiredEmailRules
}

const resetLink = computed(() => {
  return `${window.location.origin}/reset-password?token=${resetToken.value}`
})

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    const result = await userStore.generateResetToken(formData.email)
    resetToken.value = result.resetToken
    isSuccess.value = true
  } catch (error) {
    ElMessage.error(error.message || '发送失败，请重试')
  } finally {
    loading.value = false
  }
}

const goToReset = () => {
  router.push(`/reset-password?token=${resetToken.value}`)
}
</script>

<style scoped>
.simulated-email {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  text-align: left;
  border: 1px solid #e4e7ed;
}

.email-header {
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.email-subject {
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.email-body p {
  margin: 8px 0;
  color: #606266;
  font-size: 0.9rem;
  line-height: 1.6;
}

.reset-link-box {
  background: #fff;
  border: 1px dashed #409eff;
  border-radius: 6px;
  padding: 12px;
  margin: 12px 0;
  word-break: break-all;
}

.reset-link {
  font-size: 0.85rem;
}

.email-tip {
  font-size: 0.8rem !important;
  color: #909399 !important;
}

.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}
</style>
