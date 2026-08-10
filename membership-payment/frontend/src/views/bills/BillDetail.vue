<template>
  <div class="page-container">
    <el-page-header @back="$router.back()" content="账单详情 / Bill Detail" class="mb-16" />

    <el-card shadow="hover" v-loading="loading">
      <!-- 可打印的账单 / Printable Bill -->
      <div class="bill-paper" id="bill-paper">
        <div class="bill-header">
          <h2>会员服务账单 / Membership Invoice</h2>
          <p class="bill-no">账单号 / Bill No: {{ bill?.id }}</p>
        </div>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户姓名 / Customer">
            {{ bill?.user?.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱 / Email">
            {{ bill?.user?.email || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="套餐 / Plan">
            {{ bill?.order?.plan?.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="类型 / Type">
            {{ bill?.order?.type === 'subscription' ? '订阅制 / Subscription' : '一次性 / One-time' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单号 / Order ID">
            {{ bill?.orderId }}
          </el-descriptions-item>
          <el-descriptions-item label="开具时间 / Issued At">
            {{ formatDate(bill?.issuedAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="bill-amount">
          <div class="amount-row">
            <span>金额 / Amount:</span>
            <span class="amount">${{ bill?.amount }} {{ (bill?.currency || 'usd').toUpperCase() }}</span>
          </div>
          <div class="amount-row total">
            <span>合计 / Total:</span>
            <span class="amount">${{ bill?.amount }} {{ (bill?.currency || 'usd').toUpperCase() }}</span>
          </div>
        </div>

        <div class="bill-footer">
          <p>感谢您的购买！/ Thank you for your purchase!</p>
          <p class="muted">本账单由系统自动生成 / This invoice is auto-generated</p>
        </div>
      </div>

      <div class="actions">
        <el-button type="primary" @click="printBill">打印 / Print</el-button>
        <el-button @click="$router.push(`/orders/${bill?.orderId}`)">查看订单 / View Order</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getBillDetail } from '@/api/bills';
import type { Bill } from '@/types';

const route = useRoute();
const bill = ref<Bill | null>(null);
const loading = ref(false);

function formatDate(d?: string | null) {
  return d ? new Date(d).toLocaleString() : '-';
}

async function load() {
  loading.value = true;
  try {
    bill.value = await getBillDetail(route.params.id as string);
  } finally {
    loading.value = false;
  }
}

// 打印账单（mock 下载）/ Print bill (mock download)
function printBill() {
  window.print();
}

onMounted(load);
</script>

<style scoped>
.bill-paper {
  padding: 24px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.bill-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #409eff;
}

.bill-header h2 {
  color: #303133;
  margin-bottom: 8px;
}

.bill-no {
  color: #909399;
  font-size: 13px;
}

.bill-amount {
  margin: 24px 0;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.amount-row.total {
  border-top: 2px solid #dcdfe6;
  margin-top: 8px;
  padding-top: 12px;
  font-weight: 700;
  font-size: 18px;
}

.amount {
  color: #f56c6c;
  font-size: 18px;
}

.bill-footer {
  text-align: center;
  margin-top: 32px;
  color: #606266;
}

.muted {
  color: #c0c4cc;
  font-size: 12px;
}

.actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

@media print {
  .actions {
    display: none;
  }
}
</style>
