import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: 'Login', public: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { title: 'Register', public: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/teams',
    children: [
      {
        path: 'teams',
        name: 'teams',
        component: () => import('@/views/team/TeamListView.vue'),
        meta: { title: 'Teams' },
      },
      {
        path: 'teams/:id',
        name: 'team-detail',
        component: () => import('@/views/team/TeamDetailView.vue'),
        meta: { title: 'Team Detail' },
      },
      {
        path: 'documents',
        name: 'documents',
        component: () => import('@/views/document/DocumentListView.vue'),
        meta: { title: 'Documents' },
      },
      {
        path: 'documents/:id/edit',
        name: 'document-edit',
        component: () => import('@/views/document/DocumentEditView.vue'),
        meta: { title: 'Edit Document' },
      },
      {
        path: 'files',
        name: 'files',
        component: () => import('@/views/file/FileManageView.vue'),
        meta: { title: 'Files' },
      },
      {
        path: 'trash',
        name: 'trash',
        component: () => import('@/views/trash/TrashView.vue'),
        meta: { title: 'Trash' },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: { title: 'Profile' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Not Found', public: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局前置守卫：登录校验 / Global guard: auth check
router.beforeEach(async (to, _from, next) => {
  document.title = `${to.meta.title || ''} - Team Doc`;
  const authStore = useAuthStore();

  if (to.meta.public) {
    // 已登录用户访问登录页则跳转首页 / Redirect to home if logged in
    if (to.name === 'login' && authStore.isLoggedIn) {
      next({ path: '/' });
      return;
    }
    next();
    return;
  }

  if (!authStore.isLoggedIn) {
    next({ path: '/login' });
    return;
  }

  // 拉取用户信息（如尚未加载）/ Fetch profile if not loaded
  if (!authStore.user) {
    const me = await authStore.fetchProfile();
    if (!me) {
      next({ path: '/login' });
      return;
    }
  }
  next();
});

export default router;
