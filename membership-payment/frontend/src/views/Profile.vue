<template>
  <div class="page-container">
    <el-row :gutter="20">
      <!-- 个人信息 / Profile Info -->
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <span>个人信息 / Profile</span>
          </template>
          <div class="profile-header">
            <el-avatar :size="80" :src="form.avatar || undefined">
              {{ form.name?.charAt(0) }}
            </el-avatar>
            <div class="profile-meta">
              <h3>{{ form.name }}</h3>
              <p>{{ form.email }}</p>
              <el-tag :type="roleTagType" size="small">
                {{ form.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </div>
          </div>
          <el-form :model="form" label-position="top" class="mt-24">
            <el-form-item label="昵称 / Name">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="头像 URL / Avatar URL (mock)">
              <el-input v-model="form.avatar" placeholder="https://..." />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveProfile">保存 / Save</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 会员状态 / Membership Status -->
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="mb-16">
          <template #header>
            <span>会员状态 / Membership</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="当前套餐">
              <el-tag :type="planTagType">{{ planLabel }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="套餐名称">
              {{ profile?.planName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="到期时间">
              {{ profile?.planExpireAt ? formatDate(profile.planExpireAt) : '永久 / Lifetime' }}
            </el-descriptions-item>
            <el-descriptions-item label="积分余额">
              <strong>{{ profile?.points ?? 0 }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="连续签到">
              {{ profile?.signStreak ?? 0 }} 天
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">
              {{ formatDate(profile?.createdAt || '') }}
            </el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" class="mt-16" @click="$router.push('/pricing')">
            升级套餐 / Upgrade
          </el-button>
        </el-card>

        <!-- 修改密码 / Change Password -->
        <el-card shadow="hover">
          <template #header>
            <span>修改密码 / Change Password</span>
          </template>
          <el-form :model="pwdForm" label-position="top">
            <el-form-item label="旧密码 / Old Password">
              <el-input v-model="pwdForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码 / New Password">
              <el-input v-model="pwdForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="changingPwd" @click="changePwd">
                修改密码 / Change
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 套餐权益 / Plan Features -->
    <el-card shadow="hover" class="mt-24" v-if="profile?.planFeatures?.length">
      <template #header>
        <span>当前套餐权益 / Plan Features</span>
      </template>
      <ul class="features-list">
        <li v-for="(f, i) in profile.planFeatures" :key="i">{{ f }}</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { getProfile, updateProfile } from '@/api/users';
import { changePassword } from '@/api/auth';
import type { User } from '@/types';

const authStore = useAuthStore();

const profile = ref<User | null>(null);
const saving = ref(false);
const changingPwd = ref(false);

const form = reactive({
  name: '',
  avatar: '',
  role: 'user' as 'user' | 'admin',
});

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
});

const planLabel = computed(() => {
  const plan = profile.value?.plan;
  return plan === 'pro' ? 'Pro 专业版' : plan === 'enterprise' ? 'Enterprise 企业版' : 'Free 免费版';
});

const planTagType = computed<'success' | 'warning' | 'info'>(() => {
  const plan = profile.value?.plan;
  if (plan === 'enterprise') return 'warning';
  if (plan === 'pro') return 'success';
  return 'info';
});

const roleTagType = computed<'danger' | 'info'>(() => {
  return form.role === 'admin' ? 'danger' : 'info';
});

function formatDate(d: string) {
  return new Date(d).toLocaleString();
}

async function loadProfile() {
  const p = await getProfile();
  profile.value = p;
  form.name = p.name;
  form.avatar = p.avatar || '';
  form.role = p.role;
  authStore.updateUser({ name: p.name, avatar: p.avatar, plan: p.plan, points: p.points });
}

async function saveProfile() {
  saving.value = true;
  try {
    const updated = await updateProfile({ name: form.name, avatar: form.avatar });
    profile.value = { ...profile.value!, ...updated };
    authStore.updateUser({ name: updated.name, avatar: updated.avatar });
    ElMessage.success('保存成功 / Saved');
  } finally {
    saving.value = false;
  }
}

async function changePwd() {
  if (!pwdForm.oldPassword || !pwdForm.newPassword) {
    ElMessage.warning('请填写完整 / Please fill all fields');
    return;
  }
  if (pwdForm.newPassword.length < 6) {
    ElMessage.warning('新密码至少 6 位 / Password too short');
    return;
  }
  changingPwd.value = true;
  try {
    await changePassword(pwdForm);
    ElMessage.success('密码修改成功 / Password changed');
    pwdForm.oldPassword = '';
    pwdForm.newPassword = '';
  } finally {
    changingPwd.value = false;
  }
}

onMounted(loadProfile);
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.profile-meta h3 {
  margin-bottom: 4px;
}

.profile-meta p {
  color: #909399;
  font-size: 14px;
  margin-bottom: 4px;
}

.features-list {
  list-style: none;
  padding: 0;
}

.features-list li {
  padding: 8px 0;
  color: #606266;
}

.features-list li::before {
  content: '✓ ';
  color: #67c23a;
  font-weight: bold;
}
</style>
