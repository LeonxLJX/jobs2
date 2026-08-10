<template>
  <el-container class="layout-container">
    <!-- 顶部导航 / Top Nav -->
    <el-header class="header">
      <div class="header-inner">
        <div class="logo" @click="router.push('/home')">
          <el-icon :size="24"><Medal /></el-icon>
          <span>会员中心 Membership</span>
        </div>

        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          router
          class="nav-menu"
        >
          <el-menu-item index="/home">首页</el-menu-item>
          <el-menu-item index="/pricing">套餐定价</el-menu-item>
          <el-menu-item index="/sign">每日签到</el-menu-item>
          <el-menu-item index="/orders">我的订单</el-menu-item>
          <el-menu-item index="/bills">账单记录</el-menu-item>
          <el-menu-item index="/refunds">退款记录</el-menu-item>
          <el-menu-item v-if="authStore.isAdmin" index="/admin/refunds">退款审核</el-menu-item>
        </el-menu>

        <!-- 用户下拉 / User Dropdown -->
        <el-dropdown @command="handleCommand" class="user-dropdown">
          <div class="user-info">
            <el-avatar :size="32" :src="authStore.user?.avatar || undefined">
              {{ authStore.user?.name?.charAt(0) }}
            </el-avatar>
            <span class="user-name">{{ authStore.user?.name }}</span>
            <el-tag size="small" :type="planTagType">{{ planLabel }}</el-tag>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">用户中心 / Profile</el-dropdown-item>
              <el-dropdown-item command="orders">我的订单 / Orders</el-dropdown-item>
              <el-dropdown-item v-if="authStore.isAdmin" command="admin">退款审核 / Review</el-dropdown-item>
              <el-dropdown-item divided command="logout">登出 / Logout</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主体内容 / Main Content -->
    <el-main class="main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { Medal } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const activeMenu = computed(() => {
  // 取一级路径作为高亮 / Use first-level path for active highlight
  const seg = '/' + (route.path.split('/')[1] || 'home');
  return seg;
});

const planLabel = computed(() => {
  const plan = authStore.user?.plan;
  return plan === 'pro' ? 'Pro' : plan === 'enterprise' ? 'Enterprise' : 'Free';
});

const planTagType = computed<'success' | 'warning' | 'info'>(() => {
  const plan = authStore.user?.plan;
  if (plan === 'enterprise') return 'warning';
  if (plan === 'pro') return 'success';
  return 'info';
});

async function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    try {
      await ElMessageBox.confirm('确定要登出吗？ / Logout?', '提示', {
        type: 'warning',
      });
      await authStore.logout();
      router.push('/login');
    } catch {
      // 取消 / cancelled
    }
  } else if (cmd === 'profile') {
    router.push('/profile');
  } else if (cmd === 'orders') {
    router.push('/orders');
  } else if (cmd === 'admin') {
    router.push('/admin/refunds');
  }
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 18px;
  color: #409eff;
  cursor: pointer;
  white-space: nowrap;
}

.nav-menu {
  flex: 1;
  border-bottom: none !important;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
  color: #303133;
}

.main {
  padding: 0;
}
</style>
