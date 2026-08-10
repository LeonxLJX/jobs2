<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" v-permission="'system:permission:add'" @click="openCreate(null)">新增顶级菜单</el-button>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>

      <el-table v-loading="loading" :data="tree" row-key="id" border default-expand-all>
        <el-table-column prop="name" label="名称" min-width="180">
          <template #default="{ row }">
            <el-icon v-if="row.icon" style="margin-right: 4px"><component :is="row.icon" /></el-icon>
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="code" label="权限码" min-width="160" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="row.type === 'menu' ? 'primary' : 'warning'" size="small">
              {{ row.type === 'menu' ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" width="160" />
        <el-table-column prop="component" label="组件" min-width="160" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" v-permission="'system:permission:add'" @click="openCreate(row)">新增子级</el-button>
            <el-button link type="primary" v-permission="'system:permission:edit'" @click="openEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除该菜单？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" v-permission="'system:permission:delete'">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 / Create/Edit dialog -->
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑菜单' : '新增菜单'" width="560px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ label: 'name', children: 'children', value: 'id' }"
            check-strictly
            clearable
            placeholder="不选则为顶级菜单"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="权限码" prop="code">
          <el-input v-model="form.code" placeholder="如 system:user" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="menu">菜单</el-radio>
            <el-radio value="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.type === 'menu'" label="路由路径">
          <el-input v-model="form.path" placeholder="如 /system 或 user（相对父级）" />
        </el-form-item>
        <el-form-item v-if="form.type === 'menu'" label="组件">
          <el-input v-model="form.component" placeholder="如 system/user/index 或 Layout" />
        </el-form-item>
        <el-form-item v-if="form.type === 'menu'" label="图标">
          <el-input v-model="form.icon" placeholder="Element Plus 图标名，如 User" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
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
import { getPermissionTree, createPermission, updatePermission, deletePermission } from '@/api/permission';
import type { Permission } from '@/types';

const loading = ref(false);
const submitting = ref(false);
const tree = ref<Permission[]>([]);

async function loadData() {
  loading.value = true;
  try {
    tree.value = await getPermissionTree();
  } finally {
    loading.value = false;
  }
}

const parentOptions = ref<Permission[]>([]);

// ===== 新增/编辑 =====
const formVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({
  id: '',
  name: '',
  code: '',
  type: 'menu',
  parentId: undefined as string | undefined,
  path: '',
  component: '',
  icon: '',
  sort: 0,
});
const formRules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
};

function openCreate(parent: Permission | null) {
  isEdit.value = false;
  parentOptions.value = tree.value;
  Object.assign(form, { id: '', name: '', code: '', type: 'menu', parentId: parent?.id, path: '', component: '', icon: '', sort: 0 });
  formVisible.value = true;
}

function openEdit(row: Permission) {
  isEdit.value = true;
  parentOptions.value = tree.value;
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    type: row.type,
    parentId: row.parentId,
    path: row.path || '',
    component: row.component || '',
    icon: row.icon || '',
    sort: row.sort,
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
      code: form.code,
      type: form.type,
      parentId: form.parentId || undefined,
      path: form.path,
      component: form.component,
      icon: form.icon,
      sort: form.sort,
    };
    if (isEdit.value) {
      await updatePermission(form.id, payload);
      ElMessage.success('编辑成功');
    } else {
      await createPermission(payload);
      ElMessage.success('新增成功');
    }
    formVisible.value = false;
    loadData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: Permission) {
  await deletePermission(row.id);
  ElMessage.success('删除成功');
  loadData();
}

onMounted(() => {
  loadData();
});
</script>
