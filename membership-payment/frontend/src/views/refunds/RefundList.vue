<template>
  <div class="page-container">
    <div class="page-header">
      <h1>退款记录 / Refunds</h1>
      <el-button type="primary" @click="showDialog = true">申请退款 / Apply Refund</el-button>
    </div>

    <el-card shadow="hover">
      <el-table :data="refunds" v-loading="loading" stripe>
        <el-table-column label="退款单号 / ID" min-width="160">
          <template #default="{ row }">{{ row.id.substring(0, 12) }}...</template>
        </el-table-column>
        <el-table-column label="订单 / Order" min-width="140">
          <template #default="{ row }">
            <el-link type="info" @click="$router.push(`/orders/${row.orderId}`)">
              {{ row.orderId.substring(0, 10) }}...
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="套餐 / Plan" min-width="120">
          <template #default="{ row }">{{ row.order?.plan?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="原因 / Reason" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ row.reason }}</template>
        </el-table-column>
        <el-table-column label="状态 / Status" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间 / Created" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="审核时间 / Reviewed" width="180">
          <template #default="{ row }">{{ row.reviewedAt ? formatDate(row.reviewedAt) : '-' }}</template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && refunds.length === 0" description="暂无退款记录 / No refunds" />
    </el-card>

    <!-- 申请退款对话框 / Apply Refund Dialog -->
    <el-dialog v-model="showDialog" title="申请退款 / Apply for Refund" width="500px">
      <el-form :model="form" label-position="top">
        <el-form-item label="选择已支付订单 / Select Paid Order">
          <el-select v-model="form.orderId" placeholder="请选择订单" style="width: 100%">
            <el-option
              v-for="o in paidOrders"
              :key="o.id"
              :label="`${o.plan?.name} - $${o.amount} (${o.id.substring(0, 8)})`"
              :value="o.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="退款原因 / Reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请说明退款原因 / Please describe the reason"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消 / Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">提交 / Submit</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { listRefunds, createRefund } from '@/api/refunds';
import { listOrders } from '@/api/orders';
import type { RefundRequest, Order } from '@/types';

const route = useRoute();

const refunds = ref<RefundRequest[]>([]);
const paidOrders = ref<Order[]>([]);
const loading = ref(false);
const showDialog = ref(false);
const submitting = ref(false);

const form = reactive({
  orderId: '',
  reason: '',
});

function statusTagType(s: string): 'success' | 'info' | 'warning' | 'danger' {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    approved: 'success',
    pending: 'warning',
    rejected: 'info',
  };
  return map[s] || 'info';
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    approved: '已通过 / Approved',
    pending: '待审核 / Pending',
    rejected: '已拒绝 / Rejected',
  };
  return map[s] || s;
}

function formatDate(d: string) {
  return new Date(d).toLocaleString();
}

async function load() {
  loading.value = true;
  try {
    const [list, orders] = await Promise.all([listRefunds(), listOrders('paid')]);
    refunds.value = list;
    paidOrders.value = orders;

    // 来自订单详情的退款请求 / From order detail
    const orderId = route.query.orderId as string;
    if (orderId) {
      form.orderId = orderId;
      showDialog.value = true;
    }
  } finally {
    loading.value = false;
  }
}

async function submit() {
  if (!form.orderId || !form.reason) {
    ElMessage.warning('请填写完整 / Please fill all fields');
    return;
  }
  submitting.value = true;
  try {
    await createRefund(form);
    ElMessage.success('退款申请已提交 / Submitted');
    showDialog.value = false;
    form.orderId = '';
    form.reason = '';
    await load();
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
