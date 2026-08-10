<template>
  <div class="not-found">
    <el-result icon="warning" title="404" sub-title="页面不存在 / Page Not Found">
      <template #extra>
        <el-button type="primary" @click="$router.push('/home')">返回首页 / Home</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
// 404 页面 / Not Found
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
</style>
