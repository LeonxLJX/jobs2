<template>
  <div class="not-found">
    <el-result icon="warning" title="404" sub-title="抱歉，页面不存在 / Page not found">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页 / Back Home</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
// 404 页面 / 404 page
</script>

<style scoped>
.not-found {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
