<template>
  <div class="header">
    <div class="header-left">
      <el-icon class="collapse-btn" @click="$emit('toggle')">
        <Fold v-if="!collapsed" />
        <Expand v-else />
      </el-icon>
      <Breadcrumb v-if="false" />
    </div>

    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-avatar :size="28" class="avatar">{{ avatarText }}</el-avatar>
          <span class="username">{{ userInfo?.name || userInfo?.username || '用户' }}</span>
          <el-icon><CaretBottom /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人信息 / Profile</el-dropdown-item>
            <el-dropdown-item command="password">修改密码 / Change Password</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录 / Logout</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>

  <!-- 修改密码弹窗 / Change password dialog -->
  <el-dialog v-model="pwdDialogVisible" title="修改密码 / Change Password" width="420px">
    <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="pwdForm.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="pwdForm.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="pwdDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitPwd">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { usePermissionStore } from '@/stores/permission';
import { changePassword } from '@/api/auth';

defineProps<{ collapsed: boolean }>();
defineEmits<{ (e: 'toggle'): void }>();

const router = useRouter();
const userStore = useUserStore();
const permissionStore = usePermissionStore();

const userInfo = computed(() => userStore.userInfo);
const avatarText = computed(() => {
  const name = userInfo.value?.name || userInfo.value?.username || 'U';
  return name.charAt(0).toUpperCase();
});

// 下拉命令处理 / Dropdown command handler
async function handleCommand(command: string) {
  if (command === 'logout') {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' });
    await userStore.logout();
    permissionStore.reset();
    router.push('/login');
  } else if (command === 'password') {
    pwdDialogVisible.value = true;
  } else if (command === 'profile') {
    ElMessage.info('个人信息页面暂未独立，可在此修改密码');
  }
}

// 修改密码表单 / Change password form
const pwdDialogVisible = ref(false);
const pwdFormRef = ref<FormInstance>();
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const pwdRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== pwdForm.newPassword) callback(new Error('两次密码不一致'));
        else callback();
      },
      trigger: 'blur',
    },
  ],
};

async function submitPwd() {
  if (!pwdFormRef.value) return;
  await pwdFormRef.value.validate();
  await changePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword });
  ElMessage.success('密码修改成功，请重新登录');
  pwdDialogVisible.value = false;
  await userStore.logout();
  permissionStore.reset();
  router.push('/login');
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
}
.header-left {
  display: flex;
  align-items: center;
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #5a5e66;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}
.avatar {
  background-color: #409eff;
  color: #fff;
}
.username {
  font-size: 14px;
  color: #303133;
}
</style>
