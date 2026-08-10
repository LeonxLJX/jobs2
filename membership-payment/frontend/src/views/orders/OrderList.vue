<template>
  <div class="page-container">
    <div class="page-header">
      <h1>我的订单 / Orders</h1>
      <el-select v-model="statusFilter" placeholder="全部状态" clearable @change="loadOrders" style="width: 160px">
        <el-option label="待支付 / Pending" value="pending" />
        <el-option label="已支付 / Paid" value="paid" />
        <el-option label="已取消 / Cancelled" value="cancelled" />
        <el-option label="已退款 / Refunded" value="refunded" />
      </el-select>
    </div>

    <el-card shadow="hover">
      <el-table :data="orders" v-loading="loading" stripe>
        <el-table-column label="订单号 / ID" min-width="180">
          <template #default="{ row }">
            <el-link type="primary" @click="$router.push(`/orders/${row.id}`)">
              {{ row.id.substring(0, 12) }}...
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="套餐 / Plan" min-width="140">
          <template #default="{ row }">{{ row.plan?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="金额 / Amount" width="120">
          <template #default="{ row }">
            <strong>${{ row.amount }}</strong>
            <div v-if="row.pointsUsed > 0" class="points-used">
              (积分抵扣 -{{ row.pointsUsed }})
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型 / Type" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type === 'subscription' ? '订阅' : '一次性' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态 / Status" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间 / Created" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作 / Action" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push(`/orders/${row.id}`)">详情</el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="primary"
              @click="continuePay(row)"
            >
              继续支付
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="danger"
              @click="cancelOrder(row)"
            >
              取消
            </el-button>
            <el-button
              v-if="row.status === 'paid'"
              size="small"
              type="warning"
              @click="goRefund(row)"
            >
              申请退款
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listOrders, cancelOrder as cancelOrderApi } from '@/api/orders';
import type { Order } from '@/types';

const router = useRouter();

const orders = ref<Order[]>([]);
const loading = ref(false);
const statusFilter = ref('');

function statusTagType(status: string): 'success' | 'info' | 'warning' | 'danger' {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    paid: 'success',
    pending: 'warning',
    cancelled: 'info',
    refunded: 'danger',
  };
  return map[status] || 'info';
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    paid: '已支付 / Paid',
    pending: '待支付 / Pending',
    cancelled: '已取消 / Cancelled',
    refunded: '已退款 / Refunded',
  };
  return map[status] || status;
}

function formatDate(d: string) {
  return new Date(d).toLocaleString();
}

async function loadOrders() {
  loading.value = true;
  try {
    orders.value = await listOrders(statusFilter.value || undefined);
  } finally {
    loading.value = false;
  }
}

async function continuePay(row: Order) {
  if (row.stripeSessionId) {
    // mock 模式跳转到模拟支付页 / mock mode
    window.location.href = `/payment/mock-pay?session=${row.stripeSessionId}`;
  }
}

async function cancelOrder(row: Order) {
  try {
    await ElMessageBox.confirm(`确定取消订单 ${row.id.substring(0, 8)}...？`, '提示', {
      type: 'warning',
    });
    await cancelOrderApi(row.id);
    ElMessage.success('订单已取消 / Order cancelled');
    await loadOrders();
  } catch {
    // cancelled
  }
}

function goRefund(row: Order) {
  router.push({ path: '/refunds', query: { orderId: row.id } });
}

onMounted(loadOrders);
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.points-used {
  font-size: 12px;
  color: #e6a23c;
}
</style>
