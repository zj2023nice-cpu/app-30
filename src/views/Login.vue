<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- 头部 -->
      <div class="auth-header">
        <img src="/favicon.svg" alt="Logo" class="auth-logo" />
        <h1 class="auth-title">后台订单管理系统</h1>
        <p class="auth-subtitle">欢迎回来，请登录您的账号</p>
      </div>

      <!-- 登录表单 -->
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
            placeholder="请输入用户名"
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
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <!-- 记住我 & 忘记密码 -->
        <div class="form-options">
          <el-checkbox v-model="formData.rememberMe">
            记住我
          </el-checkbox>
          <router-link to="/forgot-password" class="forgot-link">
            忘记密码？
          </router-link>
        </div>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            :loading="loading"
            @click="handleSubmit"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部 -->
      <div class="auth-footer">
        <p>
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单引用
const formRef = ref(null)

// 加载状态
const loading = ref(false)

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 个字符', trigger: 'blur' }
  ]
}

// 初始化
onMounted(() => {
  // 如果有记住的用户名，自动填充
  if (userStore.rememberMe && userStore.savedUsername) {
    formData.username = userStore.savedUsername
    formData.rememberMe = true
  }
})

// 提交登录
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 验证表单
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    // 调用登录
    await userStore.login(
      formData.username,
      formData.password,
      formData.rememberMe
    )

    ElMessage.success('登录成功')

    // 跳转到目标页面或控制台
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (error) {
    ElMessage.error(error.message || '登录失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 组件特定样式已在全局 main.css 中定义 */
</style>
