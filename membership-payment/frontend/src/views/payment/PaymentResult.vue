<template>
  <div class="result-container">
    <el-result
      :icon="isSuccess ? 'success' : 'info'"
      :title="isSuccess ? '支付成功 / Payment Success' : '支付已取消 / Payment Cancelled'"
      :sub-title="subTitle"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/orders')">查看订单 / View Orders</el-button>
        <el-button @click="$router.push('/home')">返回首页 / Home</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { mockWebhook } from '@/api/payment';

const route = useRoute();

// Stripe 真实模式回调路径 /path 是 success 或 cancel
const isSuccess = computed(() => route.path.endsWith('success'));

const subTitle = computed(() =>
  isSuccess.value
    ? '会员等级已升级 / Your plan has been upgraded'
    : '你可以稍后继续支付 / You can pay later',
);

// 如果是 mock 模式通过 success 回调且带 session 参数，自动触发 webhook
// （兜底处理，正常流程已在 MockPay 触发）
onMounted(async () => {
  const sid = route.query.session as string;
  if (isSuccess.value && sid && sid.startsWith('mock_session_')) {
    try {
      await mockWebhook(sid);
    } catch {
      // 可能已经触发过 / Already triggered
    }
  }
});
</script>

<style scoped>
.result-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
</style>
