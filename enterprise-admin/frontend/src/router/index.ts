import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { usePermissionStore } from '@/stores/permission';
import type { MenuItem } from '@/types';
import Layout from '@/layouts/index.vue';

// 静态路由 / Static routes
export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 使用 import.meta.glob 预加载所有视图 / Preload all views via import.meta.glob
const viewModules = import.meta.glob('../views/**/*.vue');

// 解析组件 / Resolve component by component string
function resolveComponent(component?: string) {
  if (!component) return undefined;
  if (component === 'Layout') return Layout;
  // component 形如 'dashboard/index' 或 'system/user/index' / component like 'dashboard/index'
  const path = `../views/${component}.vue`;
  if (viewModules[path]) {
    return viewModules[path];
  }
  return undefined;
}

// 根据菜单树生成动态路由 / Generate dynamic routes from menu tree
export function generateRoutesFromMenus(menus: MenuItem[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [];
  for (const menu of menus) {
    if (menu.type !== 'menu') continue;

    const hasChildren = !!(menu.children && menu.children.length > 0);

    if (hasChildren) {
      // 父级菜单：使用 Layout，递归生成子路由 / Parent menu: use Layout, recurse children
      const children: RouteRecordRaw[] = [];
      for (const child of menu.children!) {
        if (child.type !== 'menu') continue;
        const childRoute: RouteRecordRaw = {
          path: child.path || '',
          name: child.code,
          component: resolveComponent(child.component),
          meta: { title: child.name, icon: child.icon, code: child.code },
        };
        children.push(childRoute);
      }
      routes.push({
        path: menu.path || `/${menu.code}`,
        name: menu.code,
        component: Layout,
        redirect: children[0] ? `${menu.path}/${children[0].path}`.replace(/\/+/g, '/') : undefined,
        meta: { title: menu.name, icon: menu.icon },
        children,
      });
    } else {
      // 叶子菜单：用 Layout 包一层，子路由 path 为空 / Leaf menu: wrap with Layout
      routes.push({
        path: menu.path || `/${menu.code}`,
        name: menu.code,
        component: Layout,
        meta: { title: menu.name, icon: menu.icon },
        children: [
          {
            path: '',
            name: `${menu.code}_index`,
            component: resolveComponent(menu.component),
            meta: { title: menu.name, icon: menu.icon, code: menu.code },
          },
        ],
      });
    }
  }
  return routes;
}

// 全局前置守卫 / Global before guard
const WHITE_LIST = ['/login', '/404'];
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  if (WHITE_LIST.includes(to.path)) {
    // 已登录访问登录页则跳首页 / Logged-in user visiting login redirects to home
    if (to.path === '/login' && userStore.token) {
      return next('/');
    }
    return next();
  }

  // 无 token 跳登录 / No token redirect to login
  if (!userStore.token) {
    return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  // 已有 token 但未生成路由 → 生成动态路由 / Has token but routes not generated
  if (!permissionStore.isRoutesGenerated) {
    try {
      // 拉取用户信息（确保 userInfo 存在）/ Fetch profile to ensure userInfo exists
      if (!userStore.userInfo) {
        await userStore.fetchProfile();
      }
      const dynamicRoutes = await permissionStore.generateRoutes();
      // 逐个添加动态路由 / Add dynamic routes one by one
      dynamicRoutes.forEach((route) => {
        router.addRoute(route);
      });
      // 添加 404 兜底路由（必须最后添加）/ Add 404 catch-all route (must be last)
      router.addRoute({ path: '/:pathMatch(.*)*', redirect: '/404' });
      // 重新跳转以匹配新路由 / Replace to match new routes
      return next({ ...to, replace: true });
    } catch (e) {
      // 生成路由失败（如 token 失效）→ 重置并跳登录 / Failed to generate routes → reset and redirect
      userStore.reset();
      permissionStore.reset();
      return next('/login');
    }
  }

  return next();
});

export default router;
