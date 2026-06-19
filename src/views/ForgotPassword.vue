<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- 返回链接 -->
      <router-link to="/login" class="back-link">
        <el-icon><ArrowLeft /></el-icon>
        返回登录
      </router-link>

      <!-- 头部 -->
      <div class="auth-header">
        <img src="/favicon.svg" alt="Logo" class="auth-logo" />
        <h1 class="auth-title">忘记密码</h1>
        <p class="auth-subtitle">请输入您的注册邮箱，我们将发送重置链接</p>
      </div>

      <!-- 成功状态 -->
      <div v-if="isSuccess" class="success-container">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <h2 class="success-title">邮件已发送</h2>
        <p class="success-desc">
          我们已向 <strong>{{ formData.email }}</strong> 发送了密码重置邮件，
          请查收并按照邮件中的指引重置密码。
        </p>
        <el-button type="primary" @click="router.push('/login')">
          返回登录
        </el-button>
      </div>

      <!-- 表单 -->
      <el-form
        v-else
        ref="formRef"
        :model="formData"
        :rules="formRules"
        class="auth-form"
        @submit.prevent="handleSubmit"
      >
        <!-- 邮箱 -->
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

        <!-- 提交按钮 -->
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

      <!-- 底部 -->
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, ArrowLeft, CircleCheck } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { requiredEmailRules } from '@/utils/validators'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const formRef = ref(null)

// 状态
const loading = ref(false)
const isSuccess = ref(false)

// 表单数据
const formData = reactive({
  email: ''
})

// 表单验证规则
const formRules = {
  email: requiredEmailRules
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 验证表单
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    // 调用发送重置邮件
    await userStore.sendResetPasswordEmail(formData.email)

    // 显示成功状态
    isSuccess.value = true
  } catch (error) {
    ElMessage.error(error.message || '发送失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 样式在全局 main.css 中定义 */
</style>
