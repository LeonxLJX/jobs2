<template>
  <div class="page-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button :icon="ArrowLeft" link @click="$router.back()">Back</el-button>
            <el-input
              v-model="form.title"
              class="title-input"
              placeholder="Document title"
            />
          </div>
          <div class="header-right">
            <el-tag v-if="remoteVersion > 0" size="small" :type="versionTagType">
              v{{ form.localVersion }} <span v-if="hasRemoteUpdate">/ remote v{{ remoteVersion }}</span>
            </el-tag>
            <el-button :icon="Clock" @click="openVersions">History</el-button>
            <el-button type="primary" :loading="saving" :icon="Check" @click="onSave">
              Save
            </el-button>
          </div>
        </div>
      </template>

      <!-- 远程更新提示 / Remote update notice -->
      <el-alert
        v-if="hasRemoteUpdate"
        title="Remote document has been updated. Reload to get the latest version."
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 12px"
      >
        <el-button size="small" type="warning" @click="reloadDoc">Reload</el-button>
      </el-alert>

      <el-input
        v-model="form.content"
        type="textarea"
        :rows="22"
        placeholder="Write your document content here (HTML supported)..."
        class="doc-content"
      />
    </el-card>

    <!-- 版本历史抽屉 / Version history drawer -->
    <el-drawer v-model="showVersions" title="Version History" size="480px">
      <div v-loading="loadingVersions">
        <el-empty v-if="!versions.length" description="No versions yet" />
        <el-timeline v-else>
          <el-timeline-item
            v-for="v in versions"
            :key="v.id"
            :timestamp="formatDate(v.createdAt)"
            placement="top"
          >
            <el-card shadow="hover">
              <div class="version-item">
                <div class="version-head">
                  <el-tag size="small">v{{ v.version }}</el-tag>
                  <span class="editor">{{ v.editor?.name || 'Unknown' }}</span>
                </div>
                <div class="version-title">{{ v.title }}</div>
                <div class="version-preview">{{ stripHtml(v.content).slice(0, 120) || '(empty)' }}</div>
                <el-button
                  link
                  type="primary"
                  @click="onRestore(v)"
                  :disabled="v.version === form.localVersion"
                >
                  Restore this version
                </el-button>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, Clock, Check } from '@element-plus/icons-vue';
import {
  getDocument,
  updateDocument,
  getDocumentVersion,
  getDocumentVersions,
  restoreVersion,
} from '@/api/documents';
import type { DocumentVersion } from '@/api/types';

const route = useRoute();
const docId = computed(() => route.params.id as string);

const loading = ref(false);
const saving = ref(false);
const loadingVersions = ref(false);
const showVersions = ref(false);

const form = reactive({
  title: '',
  content: '',
  localVersion: 0,
});

const versions = ref<DocumentVersion[]>([]);
const remoteVersion = ref(0);
let pollTimer: ReturnType<typeof setInterval> | null = null;

// 远程是否有更新 / Whether remote has updates
const hasRemoteUpdate = computed(
  () => remoteVersion.value > 0 && remoteVersion.value > form.localVersion,
);
const versionTagType = computed(() => (hasRemoteUpdate.value ? 'danger' : 'success'));

function formatDate(d: string) {
  return new Date(d).toLocaleString();
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').trim();
}

// 加载文档 / Load document
async function loadDoc() {
  loading.value = true;
  try {
    const doc = await getDocument(docId.value);
    form.title = doc.title;
    form.content = doc.content;
    form.localVersion = doc.currentVersion;
    remoteVersion.value = doc.currentVersion;
  } finally {
    loading.value = false;
  }
}

// 重新加载（远程有更新时）/ Reload when remote updated
async function reloadDoc() {
  await loadDoc();
  ElMessage.success('Reloaded latest version');
}

// 保存 / Save
async function onSave() {
  if (!form.title.trim()) {
    ElMessage.warning('Title cannot be empty');
    return;
  }
  saving.value = true;
  try {
    const updated = await updateDocument(docId.value, {
      title: form.title.trim(),
      content: form.content,
    });
    form.localVersion = updated.currentVersion;
    remoteVersion.value = updated.currentVersion;
    ElMessage.success('Saved');
  } finally {
    saving.value = false;
  }
}

// 轮询：每 5 秒拉取最新版本号 / Poll every 5s for latest version
async function pollVersion() {
  try {
    const info = await getDocumentVersion(docId.value);
    remoteVersion.value = info.currentVersion;
  } catch (e) {
    // 忽略轮询错误
  }
}

// 版本历史 / Version history
async function openVersions() {
  showVersions.value = true;
  loadingVersions.value = true;
  try {
    versions.value = await getDocumentVersions(docId.value);
  } finally {
    loadingVersions.value = false;
  }
}

// 恢复版本 / Restore version
async function onRestore(v: DocumentVersion) {
  try {
    await ElMessageBox.confirm(`Restore to v${v.version}?`, 'Confirm', { type: 'warning' });
    const updated = await restoreVersion(docId.value, v.id);
    form.title = updated.title;
    form.content = updated.content;
    form.localVersion = updated.currentVersion;
    remoteVersion.value = updated.currentVersion;
    ElMessage.success(`Restored to v${v.version}`);
    await openVersions();
  } catch (e) {
    // 取消则忽略
  }
}

onMounted(async () => {
  await loadDoc();
  // 启动轮询 / Start polling
  pollTimer = setInterval(pollVersion, 5000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
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
  gap: 12px;
  flex: 1;
}
.title-input {
  max-width: 500px;
}
.title-input :deep(input) {
  font-size: 16px;
  font-weight: 600;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.doc-content :deep(textarea) {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
}
.version-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.version-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.editor {
  font-size: 13px;
  color: #606266;
}
.version-title {
  font-weight: 600;
}
.version-preview {
  color: #909399;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
