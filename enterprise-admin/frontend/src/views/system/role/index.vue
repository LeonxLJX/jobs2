<template>
  <div class="app-container">
    <el-card class="search-bar" shadow="never">
      <el-form :inline="true" :model="query">
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="角色名称/编码" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 12px">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" v-permission="'system:role:add'" @click="openCreate">新增角色</el-button>
      </div>

      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="name" label="角色名称" width="160" />
        <el-table-column prop="code" label="角色编码" width="160" />
        <el-table-column prop="description" label="描述" min-width="180" />
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" v-permission="'system:role:edit'" @click="openEdit(row)">编辑</el-button>
            <el-button link type="primary" v-permission="'system:role:assign'" @click="openPerm(row)">分配权限</el-button>
            <el-popconfirm title="确认删除该角色？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" v-permission="'system:role:delete'">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <Pagination :total="total" v-model:page="query.page" v-model:pageSize="query.pageSize" @change="loadData" />
    </el-card>

    <!-- 新增/编辑弹窗 / Create/Edit dialog -->
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="480px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" :disabled="isEdit" placeholder="如 editor" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限弹窗 / Assign permissions dialog -->
    <el-dialog v-model="permVisible" title="分配权限" width="520px">
      <div v-loading="permLoading">
        <div class="perm-tips">勾选菜单与按钮权限，提交后即时生效。</div>
        <el-tree
          ref="treeRef"
          :data="permTree"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          show-checkbox
          default-expand-all
        />
      </div>
      <template #footer>
        <el-button @click="permVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitPerm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';
import type { ElTree } from 'element-plus';
import {
  getRoles, createRole, updateRole, deleteRole, getRolePermissions, assignRolePermissions,
} from '@/api/role';
import { getPermissionTree } from '@/api/permission';
import type { Role, Permission } from '@/types';
import Pagination from '@/components/Pagination.vue';
import { formatDate } from '@/utils';

const loading = ref(false);
const submitting = ref(false);
const permLoading = ref(false);
const list = ref<Role[]>([]);
const total = ref(0);

const query = reactive({ page: 1, pageSize: 10, keyword: '' });

async function loadData() {
  loading.value = true;
  try {
    const res = await getRoles(query);
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

// ===== 新增/编辑 =====
const formVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({ id: '', name: '', code: '', description: '' });
const formRules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
};

function openCreate() {
  isEdit.value = false;
  Object.assign(form, { id: '', name: '', code: '', description: '' });
  formVisible.value = true;
}
function openEdit(row: Role) {
  isEdit.value = true;
  Object.assign(form, { id: row.id, name: row.name, code: row.code, description: row.description || '' });
  formVisible.value = true;
}

async function submitForm() {
  if (!formRef.value) return;
  await formRef.value.validate();
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateRole(form.id, { name: form.name, code: form.code, description: form.description });
      ElMessage.success('编辑成功');
    } else {
      await createRole({ name: form.name, code: form.code, description: form.description });
      ElMessage.success('新增成功');
    }
    formVisible.value = false;
    loadData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: Role) {
  await deleteRole(row.id);
  ElMessage.success('删除成功');
  loadData();
}

// ===== 分配权限 =====
const permVisible = ref(false);
const permTree = ref<Permission[]>([]);
const treeRef = ref<InstanceType<typeof ElTree>>();
const currentRoleId = ref('');

async function openPerm(row: Role) {
  currentRoleId.value = row.id;
  permVisible.value = true;
  permLoading.value = true;
  try {
    // 并行加载权限树与该角色已选权限 / Load tree and checked ids in parallel
    const [tree, assigned] = await Promise.all([getPermissionTree(), getRolePermissions(row.id)]);
    permTree.value = tree;
    // 仅勾选叶子节点（按钮权限），避免父级联动导致全选 / Only check leaf nodes
    const leafIds = collectLeafIds(tree);
    const checkedIds = (assigned.permissionIds || []).filter((id) => leafIds.includes(id));
    // 等待树渲染 / Wait for tree render
    setTimeout(() => {
      treeRef.value?.setCheckedKeys(checkedIds, false);
    }, 50);
  } finally {
    permLoading.value = false;
  }
}

// 收集所有叶子节点 id / Collect leaf node ids
function collectLeafIds(nodes: Permission[]): string[] {
  const ids: string[] = [];
  const walk = (list: Permission[]) => {
    for (const n of list) {
      if (!n.children || n.children.length === 0) ids.push(n.id);
      else walk(n.children);
    }
  };
  walk(nodes);
  return ids;
}

async function submitPerm() {
  const checked = treeRef.value?.getCheckedKeys() as string[];
  const halfChecked = treeRef.value?.getHalfCheckedKeys() as string[];
  const all = [...checked, ...halfChecked];
  submitting.value = true;
  try {
    await assignRolePermissions(currentRoleId.value, all);
    ElMessage.success('分配成功');
    permVisible.value = false;
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.perm-tips {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
