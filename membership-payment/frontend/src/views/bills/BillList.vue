<template>
  <div class="page-container">
    <h1 class="page-header">我的账单 / Bills</h1>
    <el-card shadow="hover">
      <el-table :data="bills" v-loading="loading" stripe>
        <el-table-column label="账单号 / ID" min-width="180">
          <template #default="{ row }">
            <el-link type="primary" @click="$router.push(`/bills/${row.id}`)">
              {{ row.id.substring(0, 12) }}...
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="套餐 / Plan" min-width="140">
          <template #default="{ row }">{{ row.order?.plan?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="金额 / Amount" width="120">
          <template #default="{ row }">
            <strong>${{ row.amount }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="订单号 / Order" min-width="160">
          <template #default="{ row }">
            <el-link type="info" @click="$router.push(`/orders/${row.orderId}`)">
              {{ row.orderId.substring(0, 12) }}...
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="开具时间 / Issued" width="180">
          <template #default="{ row }">{{ formatDate(row.issuedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作 / Action" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push(`/bills/${row.id}`)">详情 / Detail</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && bills.length === 0" description="暂无账单 / No bills" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { listBills } from '@/api/bills';
import type { Bill } from '@/types';

const bills = ref<Bill[]>([]);
const loading = ref(false);

function formatDate(d: string) {
  return new Date(d).toLocaleString();
}

async function load() {
  loading.value = true;
  try {
    bills.value = await listBills();
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page-header {
  margin-bottom: 16px;
}
</style>
