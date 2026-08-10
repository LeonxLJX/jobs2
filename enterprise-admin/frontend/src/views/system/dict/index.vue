<template>
  <div class="app-container">
    <el-row :gutter="12">
      <!-- 左侧：字典类型 / Left: dict types -->
      <el-col :xs="24" :md="9">
        <el-card shadow="never">
          <template #header>字典类型 / Dict Types</template>
          <div class="toolbar">
            <el-input v-model="typeQuery.keyword" placeholder="名称/编码" clearable size="small" style="width: 180px" @keyup.enter="loadTypes" />
            <el-button type="primary" :icon="Plus" size="small" v-permission="'system:dict:add'" @click="openCreateType">新增</el-button>
          </div>
          <el-table
            v-loading="typeLoading"
            :data="typeList"
            border
            size="small"
            highlight-current-row
            @current-change="onTypeChange"
          >
            <el-table-column prop="name" label="名称" min-width="120" />
            <el-table-column prop="code" label="编码" width="140" />
            <el-table-column prop="itemCount" label="项数" width="60" />
            <el-table-column label="操作" width="130">
              <template #default="{ row }">
                <el-button link type="primary" size="small" v-permission="'system:dict:edit'" @click.stop="openEditType(row)">编辑</el-button>
                <el-popconfirm title="删除类型将连同字典项一并删除，确认？" @confirm="handleDeleteType(row)">
                  <template #reference>
                    <el-button link type="danger" size="small" v-permission="'system:dict:delete'" @click.stop>删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <Pagination :total="typeTotal" v-model:page="typeQuery.page" v-model:pageSize="typeQuery.pageSize" @change="loadTypes" />
        </el-card>
      </el-col>

      <!-- 右侧：字典项 / Right: dict items -->
      <el-col :xs="24" :md="15">
        <el-card shadow="never">
          <template #header>
            字典项 / Dict Items
            <span v-if="currentType" style="color: #909399; font-size: 12px">（{{ currentType.name }}）</span>
          </template>
          <div class="toolbar">
            <el-button type="primary" :icon="Plus" v-permission="'system:dict:add'" :disabled="!currentType" @click="openCreateItem">新增项</el-button>
          </div>
          <el-table v-loading="itemLoading" :data="itemList" border size="small">
            <el-table-column prop="label" label="标签" min-width="120" />
            <el-table-column prop="value" label="值" min-width="120" />
            <el-table-column prop="sort" label="排序" width="70" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" v-permission="'system:dict:edit'" @click="openEditItem(row)">编辑</el-button>
                <el-popconfirm title="确认删除该项？" @confirm="handleDeleteItem(row)">
                  <template #reference>
                    <el-button link type="danger" v-permission="'system:dict:delete'">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <Pagination :total="itemTotal" v-model:page="itemQuery.page" v-model:pageSize="itemQuery.pageSize" @change="loadItems" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 字典类型弹窗 / Dict type dialog -->
    <el-dialog v-model="typeDialogVisible" :title="isTypeEdit ? '编辑字典类型' : '新增字典类型'" width="420px">
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="typeForm.name" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="typeForm.code" :disabled="isTypeEdit" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="typeForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitType">确认</el-button>
      </template>
    </el-dialog>

    <!-- 字典项弹窗 / Dict item dialog -->
    <el-dialog v-model="itemDialogVisible" :title="isItemEdit ? '编辑字典项' : '新增字典项'" width="420px">
      <el-form ref="itemFormRef" :model="itemForm" :rules="itemRules" label-width="90px">
        <el-form-item label="标签" prop="label">
          <el-input v-model="itemForm.label" />
        </el-form-item>
        <el-form-item label="值" prop="value">
          <el-input v-model="itemForm.value" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="itemForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="itemForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitItem">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import {
  getDictTypes, createDictType, updateDictType, deleteDictType,
  getDictItems, createDictItem, updateDictItem, deleteDictItem,
} from '@/api/dict';
import type { DictType, DictItem } from '@/types';
import Pagination from '@/components/Pagination.vue';

// ===== 字典类型 =====
const typeLoading = ref(false);
const typeList = ref<DictType[]>([]);
const typeTotal = ref(0);
const typeQuery = reactive({ page: 1, pageSize: 10, keyword: '' });
const currentType = ref<DictType | null>(null);

async function loadTypes() {
  typeLoading.value = true;
  try {
    const res = await getDictTypes(typeQuery);
    typeList.value = res.list;
    typeTotal.value = res.total;
    // 默认选中第一个 / Default select first
    if (!currentType.value && res.list.length > 0) {
      onTypeChange(res.list[0]);
    }
  } finally {
    typeLoading.value = false;
  }
}

function onTypeChange(row: DictType | null) {
  currentType.value = row;
  if (row) {
    itemQuery.dictTypeId = row.id;
    itemQuery.page = 1;
    loadItems();
  }
}

const typeDialogVisible = ref(false);
const isTypeEdit = ref(false);
const typeFormRef = ref<FormInstance>();
const typeForm = reactive({ id: '', name: '', code: '', status: 1 });
const typeRules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
};

function openCreateType() {
  isTypeEdit.value = false;
  Object.assign(typeForm, { id: '', name: '', code: '', status: 1 });
  typeDialogVisible.value = true;
}
function openEditType(row: DictType) {
  isTypeEdit.value = true;
  Object.assign(typeForm, { id: row.id, name: row.name, code: row.code, status: row.status });
  typeDialogVisible.value = true;
}
async function submitType() {
  if (!typeFormRef.value) return;
  await typeFormRef.value.validate();
  submitting.value = true;
  try {
    if (isTypeEdit.value) {
      await updateDictType(typeForm.id, { name: typeForm.name, code: typeForm.code, status: typeForm.status });
      ElMessage.success('编辑成功');
    } else {
      await createDictType({ name: typeForm.name, code: typeForm.code, status: typeForm.status });
      ElMessage.success('新增成功');
    }
    typeDialogVisible.value = false;
    loadTypes();
  } finally {
    submitting.value = false;
  }
}
async function handleDeleteType(row: DictType) {
  await deleteDictType(row.id);
  ElMessage.success('删除成功');
  if (currentType.value?.id === row.id) currentType.value = null;
  loadTypes();
}

// ===== 字典项 =====
const itemLoading = ref(false);
const itemList = ref<DictItem[]>([]);
const itemTotal = ref(0);
const itemQuery = reactive({ dictTypeId: '', page: 1, pageSize: 10, keyword: '' });

async function loadItems() {
  if (!itemQuery.dictTypeId) return;
  itemLoading.value = true;
  try {
    const res = await getDictItems(itemQuery);
    itemList.value = res.list;
    itemTotal.value = res.total;
  } finally {
    itemLoading.value = false;
  }
}

const itemDialogVisible = ref(false);
const isItemEdit = ref(false);
const itemFormRef = ref<FormInstance>();
const itemForm = reactive({ id: '', dictTypeId: '', label: '', value: '', sort: 0, status: 1 });
const itemRules: FormRules = {
  label: [{ required: true, message: '请输入标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入值', trigger: 'blur' }],
};
const submitting = ref(false);

function openCreateItem() {
  if (!currentType.value) return;
  isItemEdit.value = false;
  Object.assign(itemForm, { id: '', dictTypeId: currentType.value.id, label: '', value: '', sort: 0, status: 1 });
  itemDialogVisible.value = true;
}
function openEditItem(row: DictItem) {
  isItemEdit.value = true;
  Object.assign(itemForm, { id: row.id, dictTypeId: row.dictTypeId, label: row.label, value: row.value, sort: row.sort, status: row.status });
  itemDialogVisible.value = true;
}
async function submitItem() {
  if (!itemFormRef.value) return;
  await itemFormRef.value.validate();
  submitting.value = true;
  try {
    const payload = { dictTypeId: itemForm.dictTypeId, label: itemForm.label, value: itemForm.value, sort: itemForm.sort, status: itemForm.status };
    if (isItemEdit.value) {
      await updateDictItem(itemForm.id, payload);
      ElMessage.success('编辑成功');
    } else {
      await createDictItem(payload);
      ElMessage.success('新增成功');
    }
    itemDialogVisible.value = false;
    loadItems();
    loadTypes();
  } finally {
    submitting.value = false;
  }
}
async function handleDeleteItem(row: DictItem) {
  await deleteDictItem(row.id);
  ElMessage.success('删除成功');
  loadItems();
  loadTypes();
}

onMounted(() => {
  loadTypes();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}
</style>
