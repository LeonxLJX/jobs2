<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>Trash</span>
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
        </div>
      </template>

      <el-empty v-if="!loading && !documents.length" description="Trash is empty" />
      <el-table v-loading="loading" :data="documents" stripe v-else>
        <el-table-column prop="title" label="Title" min-width="200" />
        <el-table-column label="Owner" min-width="140">
          <template #default="{ row }">{{ row.owner?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="Deleted At" width="180">
          <template #default="{ row }">{{ formatDate(row.deletedAt) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="onRestore(row)">Restore</el-button>
            <el-button link type="danger" @click="onPurge(row)">Delete Permanently</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getTrash, restoreDocument, purgeDocument } from '@/api/trash';
import { useTeamStore } from '@/stores/team';
import type { Document } from '@/api/types';

const teamStore = useTeamStore();

const loading = ref(false);
const documents = ref<Document[]>([]);
const currentTeamId = ref<string>('');

const teams = computed(() => teamStore.teams);

function formatDate(d: string | null) {
  return d ? new Date(d).toLocaleString() : '-';
}

async function fetchData() {
  if (!currentTeamId.value) return;
  loading.value = true;
  try {
    documents.value = await getTrash(currentTeamId.value);
  } finally {
    loading.value = false;
  }
}

async function onRestore(doc: Document) {
  try {
    await restoreDocument(doc.id);
    ElMessage.success('Document restored');
    await fetchData();
  } catch (e) {
    // 忽略
  }
}

async function onPurge(doc: Document) {
  try {
    await ElMessageBox.confirm(
      `Permanently delete "${doc.title}"? This cannot be undone.`,
      'Confirm',
      { type: 'warning' },
    );
    await purgeDocument(doc.id);
    ElMessage.success('Document permanently deleted');
    await fetchData();
  } catch (e) {
    // 取消则忽略
  }
}

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
