<template>
  <div class="page-container">
    <el-card style="max-width: 640px; margin: 0 auto">
      <template #header><span>Profile</span></template>
      <el-descriptions :column="1" border v-if="user">
        <el-descriptions-item label="Name">{{ user.name }}</el-descriptions-item>
        <el-descriptions-item label="Email">{{ user.email }}</el-descriptions-item>
        <el-descriptions-item label="Role">
          <el-tag size="small">{{ user.role }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Created">{{ formatDate(user.createdAt) }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>Change Password</el-divider>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" style="max-width: 400px">
        <el-form-item label="Old Password" prop="oldPassword">
          <el-input v-model="form.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="New Password" prop="newPassword">
          <el-input v-model="form.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="onChangePassword">
            Update Password
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { changePassword } from '@/api/auth';

const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const formRef = ref<FormInstance>();
const saving = ref(false);
const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });

const rules: FormRules = {
  oldPassword: [{ required: true, message: 'Please enter old password', trigger: 'blur' }],
  newPassword: [
    { required: true, message: 'Please enter new password', trigger: 'blur' },
    { min: 6, message: 'At least 6 characters', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm password', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== form.newPassword) callback(new Error('Passwords do not match'));
        else callback();
      },
      trigger: 'blur',
    },
  ],
};

function formatDate(d?: string) {
  return d ? new Date(d).toLocaleString() : '-';
}

async function onChangePassword() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      await changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      ElMessage.success('Password changed, please login again');
      await authStore.logout();
      router.push('/login');
    } finally {
      saving.value = false;
    }
  });
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
