/* ============================================================
 * 路由配置 / Router
 * ============================================================ */
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { public: true, title: '登录 / Login' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { public: true, title: '注册 / Register' },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页 / Home' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '用户中心 / Profile' },
      },
      {
        path: 'sign',
        name: 'Sign',
        component: () => import('@/views/Sign.vue'),
        meta: { title: '每日签到 / Check-in' },
      },
      {
        path: 'pricing',
        name: 'Pricing',
        component: () => import('@/views/Pricing.vue'),
        meta: { title: '套餐定价 / Pricing' },
      },
      {
        path: 'payment/mock-pay',
        name: 'MockPay',
        component: () => import('@/views/payment/MockPay.vue'),
        meta: { title: '模拟支付 / Mock Pay' },
      },
      {
        path: 'payment/success',
        name: 'PaymentSuccess',
        component: () => import('@/views/payment/PaymentResult.vue'),
        meta: { title: '支付成功 / Success' },
      },
      {
        path: 'payment/cancel',
        name: 'PaymentCancel',
        component: () => import('@/views/payment/PaymentResult.vue'),
        meta: { title: '支付取消 / Cancel' },
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/orders/OrderList.vue'),
        meta: { title: '我的订单 / Orders' },
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/orders/OrderDetail.vue'),
        meta: { title: '订单详情 / Order Detail' },
      },
      {
        path: 'bills',
        name: 'Bills',
        component: () => import('@/views/bills/BillList.vue'),
        meta: { title: '我的账单 / Bills' },
      },
      {
        path: 'bills/:id',
        name: 'BillDetail',
        component: () => import('@/views/bills/BillDetail.vue'),
        meta: { title: '账单详情 / Bill Detail' },
      },
      {
        path: 'refunds',
        name: 'Refunds',
        component: () => import('@/views/refunds/RefundList.vue'),
        meta: { title: '退款记录 / Refunds' },
      },
      {
        path: 'admin/refunds',
        name: 'AdminRefunds',
        component: () => import('@/views/admin/AdminRefunds.vue'),
        meta: { title: '退款审核 / Review Refunds', roles: ['admin'] },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { public: true, title: '404' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局前置守卫 / Global before guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  document.title = (to.meta.title as string) || '会员中心 / Membership';

  // 公开路由 / Public routes
  if (to.meta.public) {
    // 已登录用户访问登录页跳首页 / Logged-in user redirected from login
    if ((to.name === 'Login' || to.name === 'Register') && authStore.isLoggedIn) {
      return next('/home');
    }
    return next();
  }

  // 需登录 / Require login
  if (!authStore.isLoggedIn) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  // 角色校验 / Role check
  const roles = to.meta.roles as string[] | undefined;
  if (roles && roles.length > 0 && !roles.includes(authStore.user?.role || '')) {
    return next('/home');
  }

  next();
});

export default router;
