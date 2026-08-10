<template>
  <div class="app-container">
    <el-card class="search-bar" shadow="never">
      <el-form :inline="true" :model="query">
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="用户/操作/目标" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="query.action" placeholder="全部" clearable style="width: 120px">
            <el-option label="登录" value="login" />
            <el-option label="新增" value="create" />
            <el-option label="修改" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 12px">
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="actionTagType(row.action)" size="small">{{ actionLabel(row.action) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="目标" min-width="180" />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="detail" label="详情" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>

      <Pagination :total="total" v-model:page="query.page" v-model:pageSize="query.pageSize" @change="loadData" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { Search, Refresh } from '@element-plus/icons-vue';
import { getLogs } from '@/api/log';
import type { OperationLog } from '@/types';
import Pagination from '@/components/Pagination.vue';
import { formatDate } from '@/utils';

const loading = ref(false);
const list = ref<OperationLog[]>([]);
const total = ref(0);
const dateRange = ref<[string, string] | null>(null);

const query = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  action: '',
  startDate: '',
  endDate: '',
});

// 监听时间范围变化 / Watch date range
watch(dateRange, (val) => {
  if (val && val.length === 2) {
    query.startDate = val[0];
    query.endDate = val[1];
  } else {
    query.startDate = '';
    query.endDate = '';
  }
});

async function loadData() {
  loading.value = true;
  try {
    const res = await getLogs(query);
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  query.page = 1;
  loadData();
}
function onReset() {
  query.keyword = '';
  query.action = '';
  dateRange.value = null;
  query.startDate = '';
  query.endDate = '';
  query.page = 1;
  loadData();
}

// 操作类型标签 / Action label
function actionLabel(action: string): string {
  const map: Record<string, string> = {
    login: '登录',
    create: '新增',
    update: '修改',
    delete: '删除',
    other: '其他',
  };
  return map[action] || action;
}
function actionTagType(action: string): string {
  const map: Record<string, string> = {
    login: 'success',
    create: 'primary',
    update: 'warning',
    delete: 'danger',
    other: 'info',
  };
  return map[action] || 'info';
}

onMounted(() => {
  loadData();
});
</script>
