<template>
  <div class="app-container">
    <el-card class="search-bar" shadow="never">
      <el-form :inline="true" :model="query">
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="键/备注" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 12px">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" v-permission="'system:config:add'" @click="openCreate">新增配置</el-button>
      </div>

      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="key" label="配置键" width="180" />
        <el-table-column prop="value" label="配置值" min-width="180" />
        <el-table-column prop="remark" label="备注" min-width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" v-permission="'system:config:edit'" @click="openEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除该配置？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" v-permission="'system:config:delete'">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <Pagination :total="total" v-model:page="query.page" v-model:pageSize="query.pageSize" @change="loadData" />
    </el-card>

    <!-- 新增/编辑弹窗 / Create/Edit dialog -->
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑配置' : '新增配置'" width="480px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="配置键" prop="key">
          <el-input v-model="form.key" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="配置值" prop="value">
          <el-input v-model="form.value" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';
import { getConfigs, createConfig, updateConfig, deleteConfig } from '@/api/config';
import type { SystemConfig } from '@/types';
import Pagination from '@/components/Pagination.vue';

const loading = ref(false);
const submitting = ref(false);
const list = ref<SystemConfig[]>([]);
const total = ref(0);
const query = reactive({ page: 1, pageSize: 10, keyword: '' });

async function loadData() {
  loading.value = true;
  try {
    const res = await getConfigs(query);
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
  query.page = 1;
  loadData();
}

const formVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({ id: '', key: '', value: '', remark: '' });
const formRules: FormRules = {
  key: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
  value: [{ required: true, message: '请输入配置值', trigger: 'blur' }],
};

function openCreate() {
  isEdit.value = false;
  Object.assign(form, { id: '', key: '', value: '', remark: '' });
  formVisible.value = true;
}
function openEdit(row: SystemConfig) {
  isEdit.value = true;
  Object.assign(form, { id: row.id, key: row.key, value: row.value, remark: row.remark || '' });
  formVisible.value = true;
}

async function submitForm() {
  if (!formRef.value) return;
  await formRef.value.validate();
  submitting.value = true;
  try {
    const payload = { key: form.key, value: form.value, remark: form.remark };
    if (isEdit.value) {
      await updateConfig(form.id, payload);
      ElMessage.success('编辑成功');
    } else {
      await createConfig(payload);
      ElMessage.success('新增成功');
    }
    formVisible.value = false;
    loadData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: SystemConfig) {
  await deleteConfig(row.id);
  ElMessage.success('删除成功');
  loadData();
}

onMounted(() => {
  loadData();
});
</script>
