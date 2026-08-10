<template>
  <div class="app-container">
    <!-- 数字卡片 / Number cards -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6" v-for="card in cards" :key="card.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-body">
            <div class="stat-icon" :style="{ background: card.color }">
              <el-icon :size="28"><component :is="card.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ card.title }}</div>
              <div class="stat-value">{{ card.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表 / Charts -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="14">
        <el-card shadow="hover">
          <template #header>近 7 天操作趋势 / 7-Day Operation Trend</template>
          <div ref="lineRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card shadow="hover">
          <template #header>角色用户分布 / Role Distribution</template>
          <div ref="pieRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts';
import { getStats, getCharts } from '@/api/dashboard';

const stats = reactive({ totalUsers: 0, totalOrders: 0, todayActive: 0, todayOps: 0 });
const cards = ref<any[]>([]);

const lineRef = ref<HTMLElement>();
const pieRef = ref<HTMLElement>();
let lineChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

async function loadData() {
  const [s, c] = await Promise.all([getStats(), getCharts()]);
  Object.assign(stats, s);
  cards.value = [
    { title: '总用户数', value: s.totalUsers, icon: 'User', color: '#409eff' },
    { title: '总订单数(mock)', value: s.totalOrders, icon: 'ShoppingCart', color: '#67c23a' },
    { title: '今日活跃', value: s.todayActive, icon: 'TrendCharts', color: '#e6a23c' },
    { title: '今日操作', value: s.todayOps, icon: 'Operation', color: '#f56c6c' },
  ];
  await nextTick();
  renderLine(c.trend.days, c.trend.data);
  renderPie(c.roleDistribution);
}

// 折线图 / Line chart
function renderLine(days: string[], data: number[]) {
  if (!lineRef.value) return;
  lineChart = echarts.init(lineRef.value);
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: days, boundaryGap: false },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '操作次数',
        type: 'line',
        smooth: true,
        data,
        areaStyle: { color: 'rgba(64,158,255,0.2)' },
        lineStyle: { color: '#409eff' },
        itemStyle: { color: '#409eff' },
      },
    ],
  });
}

// 饼图 / Pie chart
function renderPie(distribution: { name: string; value: number }[]) {
  if (!pieRef.value) return;
  pieChart = echarts.init(pieRef.value);
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '用户数',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
        data: distribution.length ? distribution : [{ name: '暂无数据', value: 1 }],
      },
    ],
  });
}

// 窗口尺寸变化时重绘 / Resize on window resize
function handleResize() {
  lineChart?.resize();
  pieChart?.resize();
}

onMounted(() => {
  loadData();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  lineChart?.dispose();
  pieChart?.dispose();
});
</script>

<style scoped>
.stat-row {
  margin-bottom: 16px;
}
.stat-card {
  margin-bottom: 16px;
}
.stat-card-body {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.stat-info {
  flex: 1;
}
.stat-title {
  font-size: 13px;
  color: #909399;
}
.stat-value {
  font-size: 26px;
  font-weight: 600;
  color: #303133;
  margin-top: 4px;
}
.chart-row {
  margin-bottom: 16px;
}
.chart-box {
  height: 320px;
}
</style>
