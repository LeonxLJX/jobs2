<template>
  <div class="page-container">
    <el-row :gutter="20">
      <!-- 签到操作 / Check-in Action -->
      <el-col :xs="24" :md="10">
        <el-card shadow="hover" class="sign-card">
          <h2>每日签到 / Daily Check-in</h2>
          <p class="sign-desc">连续签到奖励递增，7 天循环 / Consecutive rewards, 7-day cycle</p>

          <!-- 当前积分 / Current points -->
          <div class="points-display">
            <div class="points-num">{{ status?.points ?? 0 }}</div>
            <div class="points-label">积分 / Points</div>
          </div>

          <!-- 连续签到天数 / Streak -->
          <div class="streak-info">
            <span>连续签到 / Streak: </span>
            <strong>{{ status?.signStreak ?? 0 }} 天</strong>
          </div>

          <!-- 签到按钮 / Check-in Button -->
          <el-button
            type="primary"
            size="large"
            class="checkin-btn"
            :disabled="status?.signedToday"
            :loading="checking"
            @click="doCheckin"
          >
            {{ status?.signedToday ? '今日已签到 / Signed' : `签到 +${status?.nextReward ?? 1} 积分` }}
          </el-button>

          <!-- 7 天奖励表 / 7-day reward table -->
          <h3 class="mt-24">7 天奖励循环 / Reward Cycle</h3>
          <div class="reward-cycle">
            <div
              v-for="(r, i) in status?.rewardTable || [1,1,2,2,3,3,5]"
              :key="i"
              class="reward-day"
              :class="{
                'is-current': !status?.signedToday && status?.nextStreakDay === i + 1,
                'is-done': status?.signedToday && status?.signStreak === i + 1,
              }"
            >
              <div class="day-label">Day {{ i + 1 }}</div>
              <div class="day-reward">+{{ r }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 签到日历 / Sign Calendar -->
      <el-col :xs="24" :md="14">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>签到日历 / Calendar</span>
              <el-button-group>
                <el-button size="small" @click="prevMonth">‹</el-button>
                <el-button size="small">{{ calLabel }}</el-button>
                <el-button size="small" @click="nextMonth">›</el-button>
              </el-button-group>
            </div>
          </template>
          <div class="calendar">
            <div class="week-row">
              <div v-for="w in ['日','一','二','三','四','五','六']" :key="w" class="week-cell">{{ w }}</div>
            </div>
            <div class="day-grid">
              <div v-for="(cell, i) in calendarCells" :key="i" class="day-cell" :class="cell.cls">
                <span v-if="cell.day">{{ cell.day }}</span>
                <el-icon v-if="cell.signed" class="signed-icon"><Check /></el-icon>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 积分记录 / Points History -->
    <el-card shadow="hover" class="mt-24">
      <template #header>
        <span>积分记录 / Points History</span>
      </template>
      <el-table :data="pointsList" v-loading="loadingPoints" stripe>
        <el-table-column prop="reason" label="原因 / Reason" min-width="240" />
        <el-table-column label="变动 / Change" width="120">
          <template #default="{ row }">
            <span :style="{ color: row.change >= 0 ? '#67c23a' : '#f56c6c' }">
              {{ row.change >= 0 ? '+' : '' }}{{ row.change }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额 / Balance" width="120" />
        <el-table-column label="时间 / Time" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadPoints"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Check } from '@element-plus/icons-vue';
import { getTodayStatus, checkin, getSignHistory } from '@/api/sign';
import { getPointsHistory } from '@/api/points';
import type { SignTodayStatus, SignLog, PointsLog } from '@/types';

const status = ref<SignTodayStatus | null>(null);
const checking = ref(false);
const signLogs = ref<SignLog[]>([]);

const pointsList = ref<PointsLog[]>([]);
const loadingPoints = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 日历 / Calendar
const calYear = ref(new Date().getFullYear());
const calMonth = ref(new Date().getMonth()); // 0-based

const calLabel = computed(() => `${calYear.value}年 ${calMonth.value + 1}月`);

const signedDates = computed(() => {
  const set = new Set<string>();
  signLogs.value.forEach((l) => {
    const d = new Date(l.date);
    set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });
  return set;
});

interface CalCell {
  day: number | null;
  signed: boolean;
  cls: string;
}

const calendarCells = computed<CalCell[]>(() => {
  const first = new Date(calYear.value, calMonth.value, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate();
  const cells: CalCell[] = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: null, signed: false, cls: 'empty' });
  }
  const today = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const signed = signedDates.value.has(`${calYear.value}-${calMonth.value}-${d}`);
    const isToday =
      today.getFullYear() === calYear.value &&
      today.getMonth() === calMonth.value &&
      today.getDate() === d;
    cells.push({
      day: d,
      signed,
      cls: `day${signed ? ' signed' : ''}${isToday ? ' today' : ''}`,
    });
  }
  return cells;
});

function prevMonth() {
  if (calMonth.value === 0) {
    calMonth.value = 11;
    calYear.value--;
  } else {
    calMonth.value--;
  }
  loadSignHistory();
}

function nextMonth() {
  if (calMonth.value === 11) {
    calMonth.value = 0;
    calYear.value++;
  } else {
    calMonth.value++;
  }
  loadSignHistory();
}

function formatDate(d: string) {
  return new Date(d).toLocaleString();
}

async function loadStatus() {
  status.value = await getTodayStatus();
}

async function loadSignHistory() {
  // 加载当前月份及前后数据 / Load sign history (90 days)
  signLogs.value = await getSignHistory(90);
}

async function loadPoints() {
  loadingPoints.value = true;
  try {
    const res = await getPointsHistory(page.value, pageSize.value);
    pointsList.value = res.list;
    total.value = res.total;
  } finally {
    loadingPoints.value = false;
  }
}

async function doCheckin() {
  checking.value = true;
  try {
    const res = await checkin();
    ElMessage.success(res.message || '签到成功 / Check-in success');
    await Promise.all([loadStatus(), loadSignHistory(), loadPoints()]);
  } finally {
    checking.value = false;
  }
}

onMounted(() => {
  loadStatus();
  loadSignHistory();
  loadPoints();
});
</script>

<style scoped>
.sign-card {
  text-align: center;
}

.sign-desc {
  color: #909399;
  font-size: 13px;
  margin: 8px 0 16px;
}

.points-display {
  margin: 16px 0;
}

.points-num {
  font-size: 48px;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
}

.points-label {
  color: #909399;
  margin-top: 4px;
}

.streak-info {
  margin-bottom: 16px;
}

.checkin-btn {
  width: 100%;
  margin-bottom: 8px;
}

.reward-cycle {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-top: 12px;
}

.reward-day {
  padding: 8px 4px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
}

.reward-day.is-current {
  border-color: #409eff;
  background: #ecf5ff;
}

.reward-day.is-done {
  border-color: #67c23a;
  background: #f0f9eb;
}

.day-label {
  font-size: 12px;
  color: #909399;
}

.day-reward {
  font-size: 16px;
  font-weight: 600;
  color: #e6a23c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar {
  user-select: none;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.week-cell {
  text-align: center;
  padding: 8px 0;
  color: #909399;
  font-size: 13px;
}

.day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  position: relative;
}

.day-cell.empty {
  border: none;
}

.day-cell.signed {
  background: #f0f9eb;
  border-color: #b3e19d;
}

.day-cell.today {
  border-color: #409eff;
  border-width: 2px;
  color: #409eff;
  font-weight: 600;
}

.signed-icon {
  color: #67c23a;
  font-size: 12px;
  margin-top: 2px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
