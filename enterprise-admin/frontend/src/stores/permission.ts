import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { getMenus } from '@/api/auth';
import type { MenuItem } from '@/types';
import { generateRoutesFromMenus } from '@/router';

// 权限状态 / Permission store
export const usePermissionStore = defineStore('permission', () => {
  const menus = ref<MenuItem[]>([]);
  const permissions = ref<string[]>([]);
  const routes = ref<RouteRecordRaw[]>([]);
  const isRoutesGenerated = ref(false);

  // 拉取菜单与权限码并生成动态路由 / Fetch menus & permission codes and generate dynamic routes
  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    const res = await getMenus();
    menus.value = res.menus;
    permissions.value = res.permissions || [];
    const dynamicRoutes = generateRoutesFromMenus(res.menus);
    routes.value = dynamicRoutes;
    isRoutesGenerated.value = true;
    return dynamicRoutes;
  }

  // 是否拥有某权限码 / Has permission code
  function hasPermission(code: string): boolean {
    // 超管或拥有权限码 / Super admin or has code
    return permissions.value.includes(code);
  }

  // 重置 / Reset
  function reset() {
    menus.value = [];
    permissions.value = [];
    routes.value = [];
    isRoutesGenerated.value = false;
  }

  return {
    menus,
    permissions,
    routes,
    isRoutesGenerated,
    generateRoutes,
    hasPermission,
    reset,
  };
});
