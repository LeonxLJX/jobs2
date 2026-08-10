<template>
  <div class="auth-container">
    <el-card class="auth-card">
      <h2 class="auth-title">注册 / Register</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="昵称 / Name" prop="name">
          <el-input v-model="form.name" placeholder="你的昵称" />
        </el-form-item>
        <el-form-item label="邮箱 / Email" prop="email">
          <el-input v-model="form.email" placeholder="you@example.com" />
        </el-form-item>
        <el-form-item label="密码 / Password" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="至少 6 位" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="onSubmit">
            注册 / Register
          </el-button>
        </el-form-item>
        <div class="auth-footer">
          <span>已有账号？</span>
          <router-link to="/login" class="link">去登录 / Login</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({
  name: '',
  email: '',
  password: '',
});

const rules: FormRules = {
  name: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
};

async function onSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      await authStore.register(form.email, form.password, form.name);
      ElMessage.success('注册成功，赠送 50 积分 / Registered, +50 points');
      router.push('/home');
    } finally {
      loading.value = false;
    }
  });
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 16px;
}

.auth-title {
  text-align: center;
  margin-bottom: 24px;
  color: #303133;
}

.auth-footer {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: #606266;
}

.link {
  color: #409eff;
  margin-left: 4px;
}
</style>
