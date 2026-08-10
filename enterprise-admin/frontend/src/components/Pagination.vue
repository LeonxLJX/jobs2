<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSizeRef"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      background
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  total: number;
  page: number;
  pageSize: number;
}>();

const emit = defineEmits<{
  (e: 'update:page', val: number): void;
  (e: 'update:pageSize', val: number): void;
  (e: 'change'): void;
}>();

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val),
});
const pageSizeRef = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val),
});

function onSizeChange() {
  emit('change');
}
function onPageChange() {
  emit('change');
}
</script>
