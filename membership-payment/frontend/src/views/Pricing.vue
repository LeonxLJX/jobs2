<template>
  <div class="page-container">
    <h1 class="page-title">套餐定价 / Pricing</h1>
    <p class="page-subtitle">选择适合你的会员套餐 / Choose your plan</p>

    <!-- 积分抵扣提示 / Points deduction info -->
    <el-alert
      v-if="currentPoints > 0"
      class="mb-16"
      type="info"
      :closable="false"
      :title="`你当前有 ${currentPoints} 积分，可用于抵扣订单（100 积分 = $1）/ You have ${currentPoints} points`"
    />

    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :sm="8" v-for="plan in plans" :key="plan.id">
        <el-card
          class="plan-card"
          :class="{ 'plan-popular': plan.code === 'pro', 'plan-current': isCurrentPlan(plan) }"
          shadow="hover"
        >
          <el-tag v-if="plan.code === 'pro'" class="popular-tag" type="danger">热门 / Popular</el-tag>
          <h3>{{ plan.name }}</h3>
          <div class="plan-price">
            <span class="currency">$</span>
            <span class="amount">{{ plan.price }}</span>
            <span class="interval" v-if="plan.interval">/{{ plan.interval }}</span>
          </div>
          <p class="billing-type">
            {{ plan.billingType === 'subscription' ? '订阅制 / Subscription' : '一次性 / One-time' }}
          </p>
          <el-divider />
          <ul class="plan-features">
            <li v-for="(f, i) in plan.features" :key="i">
              <el-icon class="feature-icon"><Check /></el-icon>{{ f }}
            </li>
          </ul>

          <!-- 积分抵扣输入 / Points input -->
          <div v-if="plan.code !== 'free' && !isCurrentPlan(plan)" class="points-deduct">
            <span>使用积分抵扣 / Use points:</span>
            <el-input-number
              v-model="pointsUsed[plan.id]"
              :min="0"
              :max="currentPoints"
              size="small"
              @change="recalc(plan)"
            />
            <span class="deduct-amount" v-if="pointsUsed[plan.id] > 0">
              -${{ ((pointsUsed[plan.id] || 0) * 0.01).toFixed(2) }}
            </span>
          </div>

          <el-button
            v-if="!isCurrentPlan(plan)"
            type="primary"
            class="plan-btn"
            :disabled="plan.code === 'free'"
            :loading="checkoutLoading === plan.id"
            @click="subscribe(plan)"
          >
            {{ plan.code === 'free' ? '免费 / Free' : (plan.billingType === 'subscription' ? '立即订阅 / Subscribe' : '立即购买 / Buy Now') }}
          </el-button>
          <el-button v-else type="success" class="plan-btn" disabled>当前套餐 / Current</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Check } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { listPlans } from '@/api/plans';
import { getProfile } from '@/api/users';
import { createCheckout } from '@/api/payment';
import type { Plan } from '@/types';

const authStore = useAuthStore();

const plans = ref<Plan[]>([]);
const loading = ref(false);
const checkoutLoading = ref<string | null>(null);
const currentPoints = ref(0);
const currentPlan = ref('free');

const pointsUsed = reactive<Record<string, number>>({});

const isCurrentPlan = (plan: Plan) => currentPlan.value === plan.code;

function recalc(_plan: Plan) {
  // 占位，实际计算在模板中 / placeholder, computed inline
}

async function loadData() {
  loading.value = true;
  try {
    const [list, profile] = await Promise.all([listPlans(), getProfile()]);
    plans.value = list;
    currentPoints.value = profile.points;
    currentPlan.value = profile.plan;
    // 初始化积分输入 / Init points input
    list.forEach((p) => {
      pointsUsed[p.id] = 0;
    });
  } finally {
    loading.value = false;
  }
}

async function subscribe(plan: Plan) {
  checkoutLoading.value = plan.id;
  try {
    const usePts = pointsUsed[plan.id] || 0;
    const res = await createCheckout({ planId: plan.id, pointsUsed: usePts });
    if (usePts > 0) {
      ElMessage.success(`已使用 ${usePts} 积分抵扣 $${(usePts * 0.01).toFixed(2)}`);
    }
    // 跳转支付页 / Redirect to checkout
    window.location.href = res.checkoutUrl;
  } catch {
    ElMessage.error('创建支付失败 / Checkout failed');
  } finally {
    checkoutLoading.value = null;
  }
}

onMounted(loadData);
</script>

<style scoped>
.page-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 8px;
}

.page-subtitle {
  text-align: center;
  color: #909399;
  margin-bottom: 32px;
}

.plan-card {
  text-align: center;
  position: relative;
  padding: 16px;
  transition: transform 0.2s;
  margin-bottom: 16px;
}

.plan-card:hover {
  transform: translateY(-4px);
}

.plan-popular {
  border: 2px solid #409eff;
}

.plan-current {
  border: 2px solid #67c23a;
}

.popular-tag {
  position: absolute;
  top: -10px;
  right: 16px;
}

.plan-card h3 {
  font-size: 22px;
  margin-bottom: 12px;
}

.plan-price {
  margin: 16px 0;
}

.plan-price .currency {
  font-size: 20px;
  vertical-align: top;
  color: #409eff;
}

.plan-price .amount {
  font-size: 48px;
  font-weight: 700;
  color: #303133;
}

.plan-price .interval {
  font-size: 16px;
  color: #909399;
}

.billing-type {
  color: #909399;
  font-size: 13px;
}

.plan-features {
  list-style: none;
  padding: 0;
  text-align: left;
  min-height: 160px;
}

.plan-features li {
  padding: 6px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.feature-icon {
  color: #67c23a;
  flex-shrink: 0;
}

.points-deduct {
  margin: 12px 0;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.deduct-amount {
  color: #f56c6c;
  font-weight: 600;
}

.plan-btn {
  width: 100%;
  margin-top: 12px;
}
</style>
