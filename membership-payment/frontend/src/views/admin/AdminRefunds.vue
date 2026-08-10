<template>
  <div class="page-container">
    <div class="page-header">
      <h1>退款审核 / Refund Review</h1>
      <el-radio-group v-model="statusFilter" @change="load">
        <el-radio-button label="">全部 / All</el-radio-button>
        <el-radio-button label="pending">待审核 / Pending</el-radio-button>
        <el-radio-button label="approved">已通过 / Approved</el-radio-button>
        <el-radio-button label="rejected">已拒绝 / Rejected</el-radio-button>
      </el-radio-group>
    </div>

    <el-card shadow="hover">
      <el-table :data="refunds" v-loading="loading" stripe>
        <el-table-column label="退款单号 / ID" min-width="160">
          <template #default="{ row }">{{ row.id.substring(0, 12) }}...</template>
        </el-table-column>
        <el-table-column label="用户 / User" min-width="140">
          <template #default="{ row }">
            {{ row.user?.name }}<br />
            <small class="muted">{{ row.user?.email }}</small>
          </template>
        </el-table-column>
        <el-table-column label="订单 / Order" min-width="160">
          <template #default="{ row }">
            <el-link type="info" @click="$router.push(`/orders/${row.orderId}`)">
              {{ row.order?.plan?.name }} - ${{ row.order?.amount }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="原因 / Reason" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">{{ row.reason }}</template>
        </el-table-column>
        <el-table-column label="状态 / Status" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间 / Created" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作 / Action" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="success" :loading="acting === row.id" @click="approve(row)">
                通过 / Approve
              </el-button>
              <el-button size="small" type="danger" :loading="acting === row.id" @click="reject(row)">
                拒绝 / Reject
              </el-button>
            </template>
            <span v-else class="muted">
              {{ row.reviewer ? `审核人: ${row.reviewer.name}` : '-' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && refunds.length === 0" description="暂无退款申请 / No refund requests" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listRefunds, approveRefund, rejectRefund } from '@/api/refunds';
import type { RefundRequest } from '@/types';

const refunds = ref<RefundRequest[]>([]);
const loading = ref(false);
const acting = ref<string | null>(null);
const statusFilter = ref('');

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
    refunds.value = await listRefunds('all', statusFilter.value || undefined);
  } finally {
    loading.value = false;
  }
}

async function approve(row: RefundRequest) {
  try {
    await ElMessageBox.confirm(
      `确定通过该退款？订单金额 $${row.order?.amount} 将退回，用户会员等级将降级。\nApprove refund? User plan will be downgraded.`,
      '确认通过 / Confirm Approve',
      { type: 'warning' },
    );
    acting.value = row.id;
    await approveRefund(row.id);
    ElMessage.success('退款已通过 / Approved');
    await load();
  } catch {
    // cancelled
  } finally {
    acting.value = null;
  }
}

async function reject(row: RefundRequest) {
  try {
    await ElMessageBox.confirm('确定拒绝该退款申请？/ Reject this refund?', '确认拒绝', {
      type: 'warning',
    });
    acting.value = row.id;
    await rejectRefund(row.id);
    ElMessage.success('退款已拒绝 / Rejected');
    await load();
  } catch {
    // cancelled
  } finally {
    acting.value = null;
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

.muted {
  color: #909399;
  font-size: 12px;
}
</style>
