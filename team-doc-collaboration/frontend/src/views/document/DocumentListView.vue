<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>Documents</span>
            <el-select
              v-if="teams.length"
              v-model="currentTeamId"
              placeholder="Select team"
              style="width: 200px; margin-left: 12px"
              @change="fetchData"
            >
              <el-option v-for="t in teams" :key="t.id" :label="t.name" :value="t.id" />
            </el-select>
          </div>
          <el-button type="primary" :icon="Plus" :disabled="!currentTeamId" @click="showCreate = true">
            New Document
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="documents" stripe>
        <el-table-column prop="title" label="Title" min-width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="goEdit(row.id)">{{ row.title }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="Owner" min-width="150">
          <template #default="{ row }">{{ row.owner?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="Version" width="90" align="center">
          <template #default="{ row }">v{{ row.currentVersion }}</template>
        </el-table-column>
        <el-table-column label="Updated" width="180">
          <template #default="{ row }">{{ formatDate(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="onDelete(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建文档弹窗 / Create document dialog -->
    <el-dialog v-model="showCreate" title="New Document" width="480px">
      <el-form :model="form" label-position="top" @submit.prevent="onCreate">
        <el-form-item label="Title">
          <el-input v-model="form.title" placeholder="Document title" />
        </el-form-item>
        <el-form-item label="Content (optional)">
          <el-input v-model="form.content" type="textarea" :rows="4" placeholder="Initial content" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate = false">Cancel</el-button>
        <el-button type="primary" :loading="creating" @click="onCreate">Create</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { getDocuments, createDocument, deleteDocument } from '@/api/documents';
import { useTeamStore } from '@/stores/team';
import type { Document } from '@/api/types';

const router = useRouter();
const teamStore = useTeamStore();

const loading = ref(false);
const documents = ref<Document[]>([]);
const showCreate = ref(false);
const creating = ref(false);
const form = reactive({ title: '', content: '' });

const teams = computed(() => teamStore.teams);
const currentTeamId = ref<string>('');

function formatDate(d: string) {
  return new Date(d).toLocaleString();
}

async function fetchData() {
  if (!currentTeamId.value) return;
  loading.value = true;
  try {
    documents.value = await getDocuments(currentTeamId.value);
  } finally {
    loading.value = false;
  }
}

async function onCreate() {
  if (!form.title.trim()) {
    ElMessage.warning('Please enter title');
    return;
  }
  creating.value = true;
  try {
    const doc = await createDocument({
      teamId: currentTeamId.value,
      title: form.title.trim(),
      content: form.content,
    });
    ElMessage.success('Document created');
    showCreate.value = false;
    form.title = '';
    form.content = '';
    router.push(`/documents/${doc.id}/edit`);
  } finally {
    creating.value = false;
  }
}

async function onDelete(doc: Document) {
  try {
    await ElMessageBox.confirm(`Move "${doc.title}" to trash?`, 'Confirm', { type: 'warning' });
    await deleteDocument(doc.id);
    ElMessage.success('Moved to trash');
    await fetchData();
  } catch (e) {
    // 取消则忽略
  }
}

function goEdit(id: string) {
  router.push(`/documents/${id}/edit`);
}

// 监听团队列表加载完成 / Watch teams loaded
watch(
  () => teamStore.teams,
  (list) => {
    if (list.length && !currentTeamId.value) {
      currentTeamId.value = teamStore.currentTeam?.id || list[0].id;
      fetchData();
    }
  },
);

watch(
  () => teamStore.currentTeam?.id,
  (id) => {
    if (id && id !== currentTeamId.value) {
      currentTeamId.value = id;
      fetchData();
    }
  },
);

onMounted(async () => {
  if (teamStore.teams.length === 0) {
    await teamStore.fetchTeams();
  }
  currentTeamId.value = teamStore.currentTeam?.id || teamStore.teams[0]?.id || '';
  if (currentTeamId.value) fetchData();
});
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
}
</style>
