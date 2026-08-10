<template>
  <div class="app-container">
    <!-- 搜索栏 / Search bar -->
    <el-card class="search-bar" shadow="never">
      <el-form :inline="true" :model="query">
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="用户名/姓名/邮箱/电话" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 工具栏 + 表格 / Toolbar + table -->
    <el-card shadow="never" style="margin-top: 12px">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" v-permission="'system:user:add'" @click="openCreate">新增用户</el-button>
      </div>

      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="160" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column label="角色" min-width="140">
          <template #default="{ row }">
            <el-tag v-for="r in row.roles" :key="r.id" size="small" style="margin-right: 4px">{{ r.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" v-permission="'system:user:edit'" @click="openEdit(row)">编辑</el-button>
            <el-button link type="primary" v-permission="'system:user:assign'" @click="openAssign(row)">分配角色</el-button>
            <el-button link type="warning" v-permission="'system:user:reset'" @click="openReset(row)">重置密码</el-button>
            <el-popconfirm title="确认删除该用户？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" v-permission="'system:user:delete'">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <Pagination
        :total="total"
        v-model:page="query.page"
        v-model:pageSize="query.pageSize"
        @change="loadData"
      />
    </el-card>

    <!-- 新增/编辑弹窗 / Create/Edit dialog -->
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="520px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item v-if="!isEdit" label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="登录用户名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="至少 6 位" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色弹窗 / Assign roles dialog -->
    <el-dialog v-model="assignVisible" title="分配角色" width="420px">
      <el-select v-model="assignRoleIds" multiple placeholder="请选择角色" style="width: 100%">
        <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
      </el-select>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitAssign">确认</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 / Reset password dialog -->
    <el-dialog v-model="resetVisible" title="重置密码" width="420px">
      <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" label-width="100px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetForm.newPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitReset">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';
import {
  getUsers, createUser, updateUser, deleteUser, resetPassword, assignUserRoles, getAllRolesSimple,
  type UserListItem,
} from '@/api/user';
import type { Role } from '@/types';
import Pagination from '@/components/Pagination.vue';
import { formatDate } from '@/utils';

const loading = ref(false);
const submitting = ref(false);
const list = ref<UserListItem[]>([]);
const total = ref(0);
const roleOptions = ref<Role[]>([]);

const query = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: undefined as number | undefined,
});

async function loadData() {
  loading.value = true;
  try {
    const res = await getUsers(query);
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
  query.status = undefined;
  query.page = 1;
  loadData();
}

// ===== 新增/编辑 =====
const formVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({
  id: '',
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  status: 1,
  roleIds: [] as string[],
});
const formRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '至少 6 位', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
};

function openCreate() {
  isEdit.value = false;
  Object.assign(form, { id: '', username: '', password: '', name: '', email: '', phone: '', status: 1, roleIds: [] });
  formVisible.value = true;
}

function openEdit(row: UserListItem) {
  isEdit.value = true;
  Object.assign(form, {
    id: row.id,
    username: row.username,
    password: '',
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    status: row.status,
    roleIds: row.roles.map((r) => r.id),
  });
  formVisible.value = true;
}

async function submitForm() {
  if (!formRef.value) return;
  await formRef.value.validate();
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateUser(form.id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        status: form.status,
        roleIds: form.roleIds,
      });
      ElMessage.success('编辑成功');
    } else {
      await createUser({
        username: form.username,
        password: form.password,
        name: form.name,
        email: form.email,
        phone: form.phone,
        status: form.status,
        roleIds: form.roleIds,
      });
      ElMessage.success('新增成功');
    }
    formVisible.value = false;
    loadData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: UserListItem) {
  await deleteUser(row.id);
  ElMessage.success('删除成功');
  loadData();
}

// ===== 分配角色 =====
const assignVisible = ref(false);
const assignRoleIds = ref<string[]>([]);
const currentId = ref('');

function openAssign(row: UserListItem) {
  currentId.value = row.id;
  assignRoleIds.value = row.roles.map((r) => r.id);
  assignVisible.value = true;
}

async function submitAssign() {
  submitting.value = true;
  try {
    await assignUserRoles(currentId.value, assignRoleIds.value);
    ElMessage.success('分配成功');
    assignVisible.value = false;
    loadData();
  } finally {
    submitting.value = false;
  }
}

// ===== 重置密码 =====
const resetVisible = ref(false);
const resetFormRef = ref<FormInstance>();
const resetForm = reactive({ newPassword: '' });
const resetRules: FormRules = {
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '至少 6 位', trigger: 'blur' }],
};

function openReset(row: UserListItem) {
  currentId.value = row.id;
  resetForm.newPassword = '';
  resetVisible.value = true;
}

async function submitReset() {
  if (!resetFormRef.value) return;
  await resetFormRef.value.validate();
  submitting.value = true;
  try {
    await resetPassword(currentId.value, resetForm.newPassword);
    ElMessage.success('重置成功');
    resetVisible.value = false;
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  roleOptions.value = await getAllRolesSimple();
  loadData();
});
</script>
