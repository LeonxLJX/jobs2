<template>
  <div class="mock-pay-container">
    <el-card class="pay-card" v-loading="loading">
      <h2 class="pay-title">🛒 模拟支付 / Mock Payment</h2>
      <p class="pay-desc">这是 Mock 模式的模拟支付页，点击下方按钮即模拟支付成功</p>
      <p class="pay-desc-en">This is a mock payment page. Click below to simulate a successful payment.</p>

      <el-descriptions v-if="session" :column="1" border class="pay-detail">
        <el-descriptions-item label="套餐 / Plan">
          <strong>{{ session.planName }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="金额 / Amount">
          <span class="amount">${{ session.amount }} {{ session.currency.toUpperCase() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态 / Status">
          <el-tag :type="statusTagType">{{ statusLabel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Session ID">
          <code>{{ session.sessionId }}</code>
        </el-descriptions-item>
      </el-descriptions>

      <div class="pay-actions" v-if="session">
        <el-button
          v-if="session.status === 'pending'"
          type="primary"
          size="large"
          :loading="paying"
          @click="confirmPay"
        >
          ✅ 确认支付 / Confirm Pay
        </el-button>
        <el-button v-else type="success" size="large" @click="goOrders">
          查看订单 / View Orders
        </el-button>
        <el-button size="large" @click="cancelPay" v-if="session.status === 'pending'">
          取消支付 / Cancel
        </el-button>
      </div>

      <el-alert
        v-if="session?.status === 'paid'"
        class="mt-24"
        type="success"
        :closable="false"
        title="支付成功！会员等级已升级 / Payment success! Plan upgraded"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getMockSession, mockWebhook } from '@/api/payment';
import type { MockSessionStatus } from '@/types';

const route = useRoute();
const router = useRouter();

const session = ref<MockSessionStatus | null>(null);
const loading = ref(false);
const paying = ref(false);

const statusLabel = computed(() => {
  const s = session.value?.status;
  if (s === 'paid') return '已支付 / Paid';
  if (s === 'cancelled') return '已取消 / Cancelled';
  if (s === 'refunded') return '已退款 / Refunded';
  return '待支付 / Pending';
});

const statusTagType = computed<'success' | 'info' | 'warning' | 'danger'>(() => {
  const s = session.value?.status;
  if (s === 'paid') return 'success';
  if (s === 'cancelled') return 'info';
  if (s === 'refunded') return 'danger';
  return 'warning';
});

async function loadSession() {
  const sid = route.query.session as string;
  if (!sid) {
    ElMessage.error('缺少 session 参数 / Missing session');
    router.push('/home');
    return;
  }
  loading.value = true;
  try {
    session.value = await getMockSession(sid);
  } finally {
    loading.value = false;
  }
}

async function confirmPay() {
  if (!session.value) return;
  paying.value = true;
  try {
    await mockWebhook(session.value.sessionId);
    ElMessage.success('支付成功！会员已升级 / Payment success! Plan upgraded');
    await loadSession();
    // 2 秒后跳订单 / Redirect to orders after 2s
    setTimeout(() => router.push('/orders'), 2000);
  } finally {
    paying.value = false;
  }
}

function goOrders() {
  router.push('/orders');
}

function cancelPay() {
  router.push('/orders');
}

onMounted(loadSession);
</script>

<style scoped>
.mock-pay-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 16px;
}

.pay-card {
  width: 100%;
  max-width: 520px;
  padding: 16px;
}

.pay-title {
  text-align: center;
  margin-bottom: 8px;
}

.pay-desc {
  text-align: center;
  color: #606266;
  margin-bottom: 4px;
}

.pay-desc-en {
  text-align: center;
  color: #909399;
  font-size: 13px;
  margin-bottom: 20px;
}

.pay-detail {
  margin: 20px 0;
}

.amount {
  font-size: 20px;
  font-weight: 700;
  color: #f56c6c;
}

.pay-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}
</style>
