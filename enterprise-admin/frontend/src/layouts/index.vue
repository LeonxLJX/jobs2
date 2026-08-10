<template>
  <el-container class="layout-container">
    <!-- 左侧菜单 / Sidebar -->
    <el-aside :width="collapsed ? '64px' : '210px'" class="layout-aside">
      <Sidebar :collapsed="collapsed" />
    </el-aside>

    <el-container>
      <!-- 顶栏 / Header -->
      <el-header class="layout-header">
        <Header :collapsed="collapsed" @toggle="collapsed = !collapsed" />
      </el-header>

      <!-- 主体 / Main -->
      <el-main class="layout-main">
        <Breadcrumb />
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import Breadcrumb from './components/Breadcrumb.vue';

// 侧边栏折叠状态 / Sidebar collapse state
const collapsed = ref(false);
</script>

<style scoped>
.layout-container {
  height: 100%;
}
.layout-aside {
  background-color: #304156;
  transition: width 0.28s;
  overflow: hidden;
}
.layout-header {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0;
  height: 50px;
  line-height: 50px;
}
.layout-main {
  background-color: #f0f2f5;
  padding: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
