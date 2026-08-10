<template>
  <div class="breadcrumb">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="item in items" :key="item.path">
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';

const route = useRoute();

// 根据路由 matched 生成面包屑 / Generate breadcrumb from matched routes
const items = computed(() => {
  return route.matched
    .filter((r) => r.meta && r.meta.title && !r.meta.hidden)
    .map((r) => ({ path: r.path, title: r.meta.title as string }));
});
</script>

<style scoped>
.breadcrumb {
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}
</style>
