<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>Files</span>
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
          <el-upload
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="customUpload"
            :disabled="!currentTeamId || uploading"
          >
            <el-button type="primary" :icon="Upload" :loading="uploading" :disabled="!currentTeamId">
              Upload
            </el-button>
          </el-upload>
        </div>
      </template>

      <el-table v-loading="loading" :data="files" stripe>
        <el-table-column label="Name" min-width="220">
          <template #default="{ row }">
            <el-icon v-if="isImage(row.mimeType)" class="file-icon"><Picture /></el-icon>
            <el-icon v-else class="file-icon"><Document /></el-icon>
            <span>{{ row.originalName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Type" width="140">
          <template #default="{ row }">{{ row.mimeType }}</template>
        </el-table-column>
        <el-table-column label="Size" width="110" align="right">
          <template #default="{ row }">{{ formatSize(row.size) }}</template>
        </el-table-column>
        <el-table-column label="Uploader" min-width="140">
          <template #default="{ row }">{{ row.uploader?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="Uploaded" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="isImage(row.mimeType)"
              link
              type="primary"
              @click="previewImage(row)"
            >
              Preview
            </el-button>
            <el-button link type="primary" @click="openUrl(row)">Open</el-button>
            <el-button link type="danger" @click="onDelete(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 图片预览 / Image preview -->
    <el-image-viewer v-if="previewVisible" :url-list="previewList" @close="previewVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Picture, Document } from '@element-plus/icons-vue';
import { getFiles, deleteFile } from '@/api/files';
import { useTeamStore } from '@/stores/team';
import { useAuthStore } from '@/stores/auth';
import type { FileAsset } from '@/api/types';

const teamStore = useTeamStore();
const authStore = useAuthStore();

const loading = ref(false);
const files = ref<FileAsset[]>([]);
const uploading = ref(false);
const currentTeamId = ref<string>('');
const previewVisible = ref(false);
const previewList = ref<string[]>([]);

const teams = computed(() => teamStore.teams);

function formatDate(d: string) {
  return new Date(d).toLocaleString();
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isImage(mime: string) {
  return mime.startsWith('image/');
}

function fileUrl(file: FileAsset) {
  // 通过 vite 代理访问后端静态文件 / Access backend static via vite proxy
  return `${file.path}`;
}

function previewImage(file: FileAsset) {
  previewList.value = [fileUrl(file)];
  previewVisible.value = true;
}

function openUrl(file: FileAsset) {
  window.open(fileUrl(file), '_blank');
}

async function fetchData() {
  if (!currentTeamId.value) return;
  loading.value = true;
  try {
    files.value = await getFiles(currentTeamId.value);
  } finally {
    loading.value = false;
  }
}

// 上传前校验 / Before upload
function beforeUpload(file: File) {
  const maxSize = Number(import.meta.env.VITE_MAX_FILE_SIZE) || 10 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.warning('File too large');
    return false;
  }
  return true;
}

// 自定义上传 / Custom upload
async function customUpload(option: any) {
  if (!currentTeamId.value) {
    ElMessage.warning('Please select a team first');
    return;
  }
  uploading.value = true;
  const formData = new FormData();
  formData.append('file', option.file);
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || '/api'}/files/upload?teamId=${currentTeamId.value}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
        body: formData,
      },
    );
    const json = await res.json();
    if (json.code === 0) {
      ElMessage.success('Upload successful');
      await fetchData();
    } else {
      ElMessage.error(json.message || 'Upload failed');
    }
  } catch (e) {
    ElMessage.error('Upload failed');
  } finally {
    uploading.value = false;
  }
}

async function onDelete(file: FileAsset) {
  try {
    await ElMessageBox.confirm(`Delete "${file.originalName}"?`, 'Confirm', { type: 'warning' });
    await deleteFile(file.id);
    ElMessage.success('File deleted');
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
.file-icon {
  margin-right: 6px;
  vertical-align: middle;
}
</style>
