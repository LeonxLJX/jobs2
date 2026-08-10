<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>My Teams</span>
          <el-button type="primary" :icon="Plus" @click="showCreate = true">
            Create Team
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="teams" stripe>
        <el-table-column prop="name" label="Team Name" min-width="180" />
        <el-table-column label="Owner" min-width="150">
          <template #default="{ row }">
            {{ row.owner?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="My Role" width="130">
          <template #default="{ row }">
            <el-tag size="small">{{ row.myRole }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Members" width="100" align="center">
          <template #default="{ row }">
            {{ row._count?.members ?? 0 }}
          </template>
        </el-table-column>
        <el-table-column label="Documents" width="110" align="center">
          <template #default="{ row }">
            {{ row._count?.documents ?? 0 }}
          </template>
        </el-table-column>
        <el-table-column label="Created" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goDetail(row.id)">Detail</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建团队弹窗 / Create team dialog -->
    <el-dialog v-model="showCreate" title="Create Team" width="420px">
      <el-form :model="form" label-position="top" @submit.prevent="onCreate">
        <el-form-item label="Team Name">
          <el-input v-model="form.name" placeholder="Enter team name" />
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
import { onMounted, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useTeamStore } from '@/stores/team';
import { createTeam } from '@/api/teams';
import type { Team } from '@/api/types';

const router = useRouter();
const teamStore = useTeamStore();

const loading = ref(false);
const teams = ref<Team[]>([]);
const showCreate = ref(false);
const creating = ref(false);
const form = reactive({ name: '' });

function formatDate(d: string) {
  return new Date(d).toLocaleString();
}

async function fetchTeams() {
  loading.value = true;
  try {
    teams.value = await teamStore.fetchTeams();
    if (teams.value.length && !teamStore.currentTeam) {
      teamStore.setCurrentTeam(teams.value[0]);
    }
  } finally {
    loading.value = false;
  }
}

async function onCreate() {
  if (!form.name.trim()) {
    ElMessage.warning('Please enter team name');
    return;
  }
  creating.value = true;
  try {
    await createTeam({ name: form.name.trim() });
    ElMessage.success('Team created');
    showCreate.value = false;
    form.name = '';
    await fetchTeams();
  } finally {
    creating.value = false;
  }
}

function goDetail(id: string) {
  router.push(`/teams/${id}`);
}

onMounted(fetchTeams);
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
