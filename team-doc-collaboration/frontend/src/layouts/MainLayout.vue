<template>
  <el-container class="main-layout">
    <!-- 左侧菜单 / Sidebar -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <el-icon v-if="isCollapse"><Document /></el-icon>
        <span v-else>Team Doc</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        router
        background-color="#001529"
        text-color="#b7bdc7"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/teams">
          <el-icon><User /></el-icon>
          <template #title>Teams</template>
        </el-menu-item>
        <el-menu-item index="/documents">
          <el-icon><Document /></el-icon>
          <template #title>Documents</template>
        </el-menu-item>
        <el-menu-item index="/files">
          <el-icon><Folder /></el-icon>
          <template #title>Files</template>
        </el-menu-item>
        <el-menu-item index="/trash">
          <el-icon><Delete /></el-icon>
          <template #title>Trash</template>
        </el-menu-item>
      </el-menu>

      <!-- 当前团队选择 / Current team selector -->
      <div class="team-selector" v-if="!isCollapse && teamStore.teams.length">
        <span class="team-label">Current Team</span>
        <el-select
          v-model="currentTeamId"
          placeholder="Select team"
          size="small"
          @change="onTeamChange"
          style="width: 100%"
        >
          <el-option
            v-for="t in teamStore.teams"
            :key="t.id"
            :label="t.name"
            :value="t.id"
          />
        </el-select>
      </div>
    </el-aside>

    <el-container>
      <!-- 顶栏 / Header -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="onCommand">
            <span class="user-info">
              <el-avatar :size="28">{{ avatarText }}</el-avatar>
              <span class="user-name">{{ authStore.user?.name }}</span>
              <el-tag size="small" type="info">{{ authStore.user?.role }}</el-tag>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">Profile</el-dropdown-item>
                <el-dropdown-item command="logout" divided>Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 / Content -->
      <el-main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTeamStore } from '@/stores/team';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const teamStore = useTeamStore();

const isCollapse = ref(false);
const currentTeamId = ref<string>('');

const activeMenu = computed(() => {
  // 取一级路径作为激活项 / Use top-level path as active menu
  const seg = route.path.split('/')[1] || 'teams';
  return `/${seg}`;
});

const avatarText = computed(() => {
  const name = authStore.user?.name || '';
  return name.charAt(0).toUpperCase() || 'U';
});

// 团队切换 / Team change
function onTeamChange(id: string) {
  const team = teamStore.teams.find((t) => t.id === id);
  teamStore.setCurrentTeam(team || null);
  // 文档/文件/回收站页切换团队后刷新 / Refresh list pages on team switch
  if (['documents', 'files', 'trash'].includes(route.name as string)) {
    router.go(0);
  }
}

async function onCommand(cmd: string) {
  if (cmd === 'profile') {
    router.push('/profile');
  } else if (cmd === 'logout') {
    await authStore.logout();
    router.push('/login');
  }
}

onMounted(async () => {
  await teamStore.fetchTeams();
  const storedId = localStorage.getItem('currentTeamId');
  if (storedId && teamStore.teams.find((t) => t.id === storedId)) {
    currentTeamId.value = storedId;
  } else if (teamStore.teams.length) {
    currentTeamId.value = teamStore.teams[0].id;
  }
  if (currentTeamId.value) {
    teamStore.setCurrentTeam(
      teamStore.teams.find((t) => t.id === currentTeamId.value) || null,
    );
  }
});

// 当团队列表变化时同步下拉 / Sync selector when teams change
watch(
  () => teamStore.teams,
  () => {
    if (teamStore.currentTeam) {
      currentTeamId.value = teamStore.currentTeam.id;
    }
  },
);
</script>

<style scoped>
.main-layout {
  height: 100vh;
}
.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #1f2d3d;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.content {
  background-color: #f5f7fa;
  padding: 0;
}
.team-selector {
  padding: 12px 16px;
  color: #b7bdc7;
  border-top: 1px solid #1f2d3d;
}
.team-label {
  display: block;
  font-size: 12px;
  margin-bottom: 8px;
  color: #7a8190;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
