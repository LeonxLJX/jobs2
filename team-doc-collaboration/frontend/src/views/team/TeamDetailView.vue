<template>
  <div class="page-container">
    <el-page-header @back="$router.back()" :content="team?.name || 'Team Detail'" style="margin-bottom: 16px" />

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>Members ({{ members.length }})</span>
              <el-button type="primary" :icon="Plus" @click="showInvite = true" :disabled="!canManage">
                Invite
              </el-button>
            </div>
          </template>
          <el-table :data="members" stripe>
            <el-table-column label="Name" min-width="150">
              <template #default="{ row }">
                {{ row.user.name }}
                <el-tag v-if="row.userId === team?.ownerId" size="small" type="warning" style="margin-left: 6px">Owner</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="user.email" label="Email" min-width="200" />
            <el-table-column label="Role" width="140">
              <template #default="{ row }">
                <el-tag size="small">{{ row.role }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Joined" width="180">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="Actions" width="100" fixed="right">
              <template #default="{ row }">
                <el-button
                  link
                  type="danger"
                  :disabled="!canManage || row.userId === team?.ownerId"
                  @click="onRemove(row)"
                >
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header><span>Team Info</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Name">{{ team?.name }}</el-descriptions-item>
            <el-descriptions-item label="Owner">{{ team?.owner?.name }}</el-descriptions-item>
            <el-descriptions-item label="Documents">{{ team?._count?.documents ?? 0 }}</el-descriptions-item>
            <el-descriptions-item label="Files">{{ team?._count?.files ?? 0 }}</el-descriptions-item>
            <el-descriptions-item label="Created">{{ team ? formatDate(team.createdAt) : '-' }}</el-descriptions-item>
          </el-descriptions>
          <el-button
            type="primary"
            style="margin-top: 16px; width: 100%"
            @click="goDocuments"
          >
            View Documents
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- 邀请成员弹窗 / Invite member dialog -->
    <el-dialog v-model="showInvite" title="Invite Member" width="420px">
      <el-form :model="form" label-position="top" @submit.prevent="onInvite">
        <el-form-item label="Email">
          <el-input v-model="form.email" placeholder="member@example.com" />
        </el-form-item>
        <el-form-item label="Role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="Member" value="member" />
            <el-option label="Team Admin" value="team_admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInvite = false">Cancel</el-button>
        <el-button type="primary" :loading="inviting" @click="onInvite">Invite</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { getTeam, getTeamMembers, inviteMember, removeMember } from '@/api/teams';
import { useAuthStore } from '@/stores/auth';
import { useTeamStore } from '@/stores/team';
import type { Team, TeamMember } from '@/api/types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const teamStore = useTeamStore();

const teamId = computed(() => route.params.id as string);
const loading = ref(false);
const team = ref<Team | null>(null);
const members = ref<TeamMember[]>([]);
const showInvite = ref(false);
const inviting = ref(false);
const form = reactive({ email: '', role: 'member' });

const myMembership = computed(() => members.value.find((m) => m.userId === authStore.user?.id));
// super_admin 或 team_admin 可管理 / super_admin or team_admin can manage
const canManage = computed(
  () => authStore.isSuperAdmin || myMembership.value?.role === 'team_admin',
);

function formatDate(d: string) {
  return new Date(d).toLocaleString();
}

async function fetchData() {
  loading.value = true;
  try {
    const [t, m] = await Promise.all([
      getTeam(teamId.value),
      getTeamMembers(teamId.value),
    ]);
    team.value = t;
    members.value = m;
    teamStore.setCurrentTeam(t);
  } finally {
    loading.value = false;
  }
}

async function onInvite() {
  if (!form.email.trim()) {
    ElMessage.warning('Please enter email');
    return;
  }
  inviting.value = true;
  try {
    await inviteMember(teamId.value, { email: form.email.trim(), role: form.role });
    ElMessage.success('Member invited');
    showInvite.value = false;
    form.email = '';
    await fetchData();
  } finally {
    inviting.value = false;
  }
}

async function onRemove(member: TeamMember) {
  try {
    await ElMessageBox.confirm(
      `Remove ${member.user.name} from this team?`,
      'Confirm',
      { type: 'warning' },
    );
    await removeMember(teamId.value, member.userId);
    ElMessage.success('Member removed');
    await fetchData();
  } catch (e) {
    // 取消则忽略 / Ignore on cancel
  }
}

function goDocuments() {
  router.push('/documents');
}

onMounted(fetchData);
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
