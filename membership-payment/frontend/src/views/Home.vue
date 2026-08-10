<template>
  <div class="page-container">
    <!-- Hero 区 / Hero Section -->
    <el-card class="hero-card" shadow="never">
      <div class="hero-content">
        <h1>欢迎，{{ authStore.user?.name }} 👋</h1>
        <p>当前会员等级 / Current Plan：
          <el-tag :type="planTagType" size="large">{{ planLabel }}</el-tag>
          <span v-if="profile?.planExpireAt" class="expire-info">
            · 到期 / Expires: {{ formatDate(profile.planExpireAt) }}
          </span>
        </p>
        <p class="points-info">积分余额 / Points: <strong>{{ profile?.points ?? 0 }}</strong></p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="router.push('/pricing')">立即升级 / Upgrade</el-button>
          <el-button size="large" @click="router.push('/sign')">每日签到 / Check-in</el-button>
        </div>
      </div>
    </el-card>

    <!-- 套餐展示 / Plans -->
    <h2 class="section-title">会员套餐 / Membership Plans</h2>
    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :sm="8" v-for="plan in plans" :key="plan.id">
        <el-card class="plan-card" :class="{ 'plan-current': isCurrentPlan(plan) }" shadow="hover">
          <div class="plan-header">
            <h3>{{ plan.name }}</h3>
            <div class="plan-price">
              <span class="amount">${{ plan.price }}</span>
              <span class="interval" v-if="plan.interval">/{{ plan.interval }}</span>
            </div>
          </div>
          <el-divider />
          <ul class="plan-features">
            <li v-for="(f, i) in plan.features" :key="i">{{ f }}</li>
          </ul>
          <el-button
            v-if="!isCurrentPlan(plan)"
            type="primary"
            class="plan-btn"
            :disabled="plan.code === 'free'"
            @click="goCheckout(plan)"
          >
            {{ plan.code === 'free' ? '当前免费 / Free' : '立即订阅 / Subscribe' }}
          </el-button>
          <el-tag v-else type="success" class="plan-btn">当前套餐 / Current</el-tag>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { listPlans } from '@/api/plans';
import { getProfile } from '@/api/users';
import { createCheckout } from '@/api/payment';
import type { Plan, User } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const plans = ref<Plan[]>([]);
const profile = ref<User | null>(null);
const loading = ref(false);

const planLabel = computed(() => {
  const plan = profile.value?.plan || authStore.user?.plan;
  return plan === 'pro' ? 'Pro 专业版' : plan === 'enterprise' ? 'Enterprise 企业版' : 'Free 免费版';
});

const planTagType = computed<'success' | 'warning' | 'info'>(() => {
  const plan = profile.value?.plan || authStore.user?.plan;
  if (plan === 'enterprise') return 'warning';
  if (plan === 'pro') return 'success';
  return 'info';
});

function isCurrentPlan(plan: Plan) {
  return (profile.value?.plan || authStore.user?.plan) === plan.code;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString();
}

async function loadData() {
  loading.value = true;
  try {
    const [planList, p] = await Promise.all([listPlans(), getProfile()]);
    plans.value = planList;
    profile.value = p;
    authStore.updateUser({ plan: p.plan, points: p.points, planExpireAt: p.planExpireAt });
  } finally {
    loading.value = false;
  }
}

async function goCheckout(plan: Plan) {
  try {
    const res = await createCheckout({ planId: plan.id });
    // Mock 模式跳转到模拟支付页 / Mock mode: redirect to mock pay page
    if (res.mode === 'mock') {
      window.location.href = res.checkoutUrl;
    } else {
      // Stripe 模式跳转官方 / Stripe mode: redirect to Stripe
      window.location.href = res.checkoutUrl;
    }
  } catch {
    ElMessage.error('创建支付会话失败 / Checkout failed');
  }
}

onMounted(loadData);
</script>

<style scoped>
.hero-card {
  background: linear-gradient(135deg, #409eff 0%, #6a8dff 100%);
  color: #fff;
  border: none;
  margin-bottom: 24px;
}

.hero-content {
  padding: 24px;
}

.hero-content h1 {
  font-size: 28px;
  margin-bottom: 12px;
}

.hero-content p {
  font-size: 16px;
  margin-bottom: 8px;
  opacity: 0.95;
}

.expire-info {
  margin-left: 8px;
  font-size: 14px;
}

.points-info strong {
  font-size: 20px;
}

.hero-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

.section-title {
  margin: 24px 0 16px;
  color: #303133;
}

.plan-card {
  text-align: center;
  margin-bottom: 16px;
  transition: transform 0.2s;
}

.plan-card:hover {
  transform: translateY(-4px);
}

.plan-current {
  border: 2px solid #67c23a;
}

.plan-header h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.plan-price .amount {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
}

.plan-price .interval {
  font-size: 14px;
  color: #909399;
  margin-left: 4px;
}

.plan-features {
  list-style: none;
  padding: 0;
  text-align: left;
  min-height: 140px;
}

.plan-features li {
  padding: 6px 0;
  color: #606266;
  font-size: 14px;
}

.plan-features li::before {
  content: '✓ ';
  color: #67c23a;
  font-weight: bold;
}

.plan-btn {
  margin-top: 16px;
  width: 100%;
}
</style>
