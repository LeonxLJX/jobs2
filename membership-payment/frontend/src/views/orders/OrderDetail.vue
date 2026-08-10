<template>
  <div class="page-container">
    <el-page-header @back="$router.back()" content="订单详情 / Order Detail" class="mb-16" />

    <el-card shadow="hover" v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号 / ID">{{ order?.id }}</el-descriptions-item>
        <el-descriptions-item label="状态 / Status">
          <el-tag :type="statusTagType">{{ statusLabel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="套餐 / Plan">{{ order?.plan?.name }}</el-descriptions-item>
        <el-descriptions-item label="类型 / Type">
          {{ order?.type === 'subscription' ? '订阅制 / Subscription' : '一次性 / One-time' }}
        </el-descriptions-item>
        <el-descriptions-item label="金额 / Amount">
          <strong>${{ order?.amount }} {{ (order?.currency || 'usd').toUpperCase() }}</strong>
          <span v-if="order?.pointsUsed" class="points-deduct">
            （积分抵扣 -{{ order.pointsUsed }}）
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="Session ID">
          <code>{{ order?.stripeSessionId || '-' }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间 / Created">
          {{ formatDate(order?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间 / Paid At">
          {{ order?.paidAt ? formatDate(order.paidAt) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item v-if="order?.cancelledAt" label="取消时间 / Cancelled At">
          {{ formatDate(order.cancelledAt) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 套餐权益 / Plan Features -->
      <h3 class="mt-24">套餐权益 / Plan Features</h3>
      <ul class="features-list" v-if="order?.plan?.features?.length">
        <li v-for="(f, i) in (typeof order.plan.features === 'string' ? JSON.parse(order.plan.features) : order.plan.features)" :key="i">
          {{ f }}
        </li>
      </ul>

      <!-- 退款记录 / Refund Records -->
      <h3 class="mt-24" v-if="order?.refundRequests?.length">退款记录 / Refund Records</h3>
      <el-table v-if="order?.refundRequests?.length" :data="order.refundRequests" stripe>
        <el-table-column prop="reason" label="原因 / Reason" min-width="200" />
        <el-table-column label="状态 / Status" width="120">
          <template #default="{ row }">
            <el-tag :type="refundTagType(row.status)" size="small">{{ refundLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间 / Time" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>

      <!-- 操作按钮 / Actions -->
      <div class="actions mt-24">
        <el-button v-if="order?.status === 'pending'" type="primary" @click="continuePay">
          继续支付 / Continue Pay
        </el-button>
        <el-button v-if="order?.status === 'pending'" type="danger" @click="cancel">
          取消订单 / Cancel
        </el-button>
        <el-button v-if="order?.status === 'paid'" type="warning" @click="goRefund">
          申请退款 / Request Refund
        </el-button>
        <el-button v-if="order?.status === 'paid' && order?.bill" @click="goBill">
          查看账单 / View Bill
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getOrderDetail, cancelOrder as cancelOrderApi } from '@/api/orders';
import type { Order } from '@/types';

const route = useRoute();
const router = useRouter();

const order = ref<Order | null>(null);
const loading = ref(false);

const statusLabel = computed(() => {
  const s = order.value?.status;
  const map: Record<string, string> = {
    paid: '已支付 / Paid',
    pending: '待支付 / Pending',
    cancelled: '已取消 / Cancelled',
    refunded: '已退款 / Refunded',
  };
  return map[s!] || s;
});

const statusTagType = computed<'success' | 'info' | 'warning' | 'danger'>(() => {
  const s = order.value?.status;
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    paid: 'success',
    pending: 'warning',
    cancelled: 'info',
    refunded: 'danger',
  };
  return map[s!] || 'info';
});

function refundTagType(s: string): 'success' | 'info' | 'warning' | 'danger' {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    approved: 'success',
    pending: 'warning',
    rejected: 'info',
  };
  return map[s] || 'info';
}

function refundLabel(s: string) {
  const map: Record<string, string> = {
    approved: '已通过 / Approved',
    pending: '待审核 / Pending',
    rejected: '已拒绝 / Rejected',
  };
  return map[s] || s;
}

function formatDate(d?: string | null) {
  return d ? new Date(d).toLocaleString() : '-';
}

async function loadOrder() {
  loading.value = true;
  try {
    order.value = await getOrderDetail(route.params.id as string);
  } finally {
    loading.value = false;
  }
}

function continuePay() {
  if (order.value?.stripeSessionId) {
    window.location.href = `/payment/mock-pay?session=${order.value.stripeSessionId}`;
  }
}

async function cancel() {
  try {
    await ElMessageBox.confirm('确定取消该订单？', '提示', { type: 'warning' });
    await cancelOrderApi(order.value!.id);
    ElMessage.success('订单已取消 / Cancelled');
    await loadOrder();
  } catch {
    // cancelled
  }
}

function goRefund() {
  router.push({ path: '/refunds', query: { orderId: order.value!.id } });
}

function goBill() {
  if (order.value?.bill?.id) {
    router.push(`/bills/${order.value.bill.id}`);
  }
}

onMounted(loadOrder);
</script>

<style scoped>
.features-list {
  list-style: none;
  padding: 0;
}

.features-list li {
  padding: 6px 0;
  color: #606266;
}

.features-list li::before {
  content: '✓ ';
  color: #67c23a;
  font-weight: bold;
}

.points-deduct {
  color: #e6a23c;
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 12px;
}
</style>
