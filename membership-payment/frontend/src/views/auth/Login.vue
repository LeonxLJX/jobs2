<template>
  <div class="auth-container">
    <el-card class="auth-card">
      <h2 class="auth-title">登录 / Login</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="邮箱 / Email" prop="email">
          <el-input v-model="form.email" placeholder="user@example.com" />
        </el-form-item>
        <el-form-item label="密码 / Password" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="至少 6 位" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="onSubmit">
            登录 / Login
          </el-button>
        </el-form-item>
        <div class="auth-footer">
          <span>还没有账号？</span>
          <router-link to="/register" class="link">去注册 / Register</router-link>
        </div>
        <el-alert
          class="demo-hint"
          type="info"
          :closable="false"
          title="演示账号 / Demo accounts"
          description="user@example.com / user123  ·  admin@example.com / admin123"
        />
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({
  email: 'user@example.com',
  password: 'user123',
});

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

async function onSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      await authStore.login(form.email, form.password);
      ElMessage.success('登录成功 / Login success');
      const redirect = (route.query.redirect as string) || '/home';
      router.push(redirect);
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

.demo-hint {
  margin-top: 16px;
}
</style>
