<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" v-permission="'system:dept:add'" @click="openCreate(null)">新增顶级部门</el-button>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>

      <el-table v-loading="loading" :data="tree" row-key="id" border default-expand-all>
        <el-table-column prop="name" label="部门名称" min-width="180" />
        <el-table-column prop="leader" label="负责人" width="120" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" v-permission="'system:dept:add'" @click="openCreate(row)">新增子级</el-button>
            <el-button link type="primary" v-permission="'system:dept:edit'" @click="openEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除该部门？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" v-permission="'system:dept:delete'">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 / Create/Edit dialog -->
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑部门' : '新增部门'" width="480px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="上级部门">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ label: 'name', children: 'children', value: 'id' }"
            check-strictly
            clearable
            placeholder="不选则为顶级部门"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="form.leader" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
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
import { Plus, Refresh } from '@element-plus/icons-vue';
import { getDeptTree, createDept, updateDept, deleteDept } from '@/api/dept';
import type { Dept } from '@/types';

const loading = ref(false);
const submitting = ref(false);
const tree = ref<Dept[]>([]);

async function loadData() {
  loading.value = true;
  try {
    tree.value = await getDeptTree();
  } finally {
    loading.value = false;
  }
}

// 父级部门下拉数据 / Parent dept options
const parentOptions = ref<Dept[]>([]);
function refreshParentOptions() {
  parentOptions.value = tree.value;
}

// ===== 新增/编辑 =====
const formVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({
  id: '',
  name: '',
  parentId: undefined as string | undefined,
  leader: '',
  sort: 0,
  status: 1,
});
const formRules: FormRules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
};

function openCreate(parent: Dept | null) {
  isEdit.value = false;
  refreshParentOptions();
  Object.assign(form, { id: '', name: '', parentId: parent?.id, leader: '', sort: 0, status: 1 });
  formVisible.value = true;
}

function openEdit(row: Dept) {
  isEdit.value = true;
  refreshParentOptions();
  Object.assign(form, {
    id: row.id,
    name: row.name,
    parentId: row.parentId,
    leader: row.leader || '',
    sort: row.sort,
    status: row.status,
  });
  formVisible.value = true;
}

async function submitForm() {
  if (!formRef.value) return;
  await formRef.value.validate();
  submitting.value = true;
  try {
    const payload = {
      name: form.name,
      parentId: form.parentId || undefined,
      leader: form.leader,
      sort: form.sort,
      status: form.status,
    };
    if (isEdit.value) {
      await updateDept(form.id, payload);
      ElMessage.success('编辑成功');
    } else {
      await createDept(payload);
      ElMessage.success('新增成功');
    }
    formVisible.value = false;
    loadData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: Dept) {
  await deleteDept(row.id);
  ElMessage.success('删除成功');
  loadData();
}

onMounted(() => {
  loadData();
});
</script>
