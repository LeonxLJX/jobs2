<template>
  <div class="auth-container">
    <el-card class="auth-card">
      <template #header>
        <div class="auth-header">
          <h2>Team Doc Collaboration</h2>
          <p>登录 / Login</p>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="email@example.com" :prefix-icon="Message" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="Enter password"
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" native-type="submit">
            Login
          </el-button>
        </el-form-item>
        <div class="auth-footer">
          <span>No account?</span>
          <router-link to="/register">Register</router-link>
        </div>
        <el-alert
          title="Demo account: admin@example.com / admin123"
          type="info"
          :closable="false"
          style="margin-top: 12px"
        />
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { Message, Lock } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const form = reactive({ email: '', password: '' });

const rules: FormRules = {
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' },
  ],
  password: [{ required: true, message: 'Please enter password', trigger: 'blur' }],
};

async function onSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      await authStore.login(form.email, form.password);
      ElMessage.success('Login successful');
      router.push('/');
    } catch (e) {
      // 错误已由拦截器提示 / Error handled by interceptor
    } finally {
      loading.value = false;
    }
  });
}
</script>

<style scoped>
.auth-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.auth-card {
  width: 420px;
  max-width: 90vw;
}
.auth-header {
  text-align: center;
}
.auth-header h2 {
  margin: 0;
  color: #303133;
}
.auth-header p {
  margin: 8px 0 0;
  color: #909399;
}
.auth-footer {
  text-align: center;
  margin-top: 12px;
}
.auth-footer a {
  color: #409eff;
  margin-left: 6px;
}
</style>
