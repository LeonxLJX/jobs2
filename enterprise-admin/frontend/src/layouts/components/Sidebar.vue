<template>
  <div class="sidebar">
    <!-- Logo 区域 / Logo -->
    <div class="logo">
      <span v-if="!collapsed" class="logo-text">企业后台</span>
      <span v-else class="logo-icon">🏢</span>
    </div>

    <!-- 动态菜单 / Dynamic menu -->
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :unique-opened="true"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      router
    >
      <template v-for="menu in menus" :key="menu.code">
        <!-- 有子菜单 / Has children -->
        <el-sub-menu v-if="menu.children && menu.children.length" :index="menu.path || menu.code">
          <template #title>
            <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
            <span>{{ menu.name }}</span>
          </template>
          <el-menu-item
            v-for="child in menu.children"
            :key="child.code"
            :index="resolvePath(menu.path, child.path)"
          >
            <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
            <span>{{ child.name }}</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 无子菜单 / No children -->
        <el-menu-item v-else :index="menu.path || `/${menu.code}`">
          <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
          <template #title>{{ menu.name }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePermissionStore } from '@/stores/permission';

defineProps<{ collapsed: boolean }>();

const route = useRoute();
const permissionStore = usePermissionStore();

// 菜单数据来自权限 store / Menu data from permission store
const menus = computed(() => permissionStore.menus);

// 当前激活菜单 / Active menu
const activeMenu = computed(() => route.path);

// 拼接父级与子级路径 / Resolve parent + child path
function resolvePath(parent?: string, child?: string): string {
  if (!parent) return child || '';
  if (!child) return parent;
  return `${parent}/${child}`.replace(/\/+/g, '/');
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.logo {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #2b3a4d;
  font-size: 16px;
  font-weight: 600;
}
.logo-icon {
  font-size: 20px;
}
.el-menu {
  border-right: none;
  flex: 1;
}
.el-menu:not(.el-menu--collapse) {
  width: 210px;
}
</style>
