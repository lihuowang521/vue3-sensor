<script setup>
import HomeHeader from "@/components/HomeHeader.vue";
import HomePage from "@/components/HomePage.vue";
import ControlPanel from "@/components/ControlPanel.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const isHomePage = computed(() => route.path === "/");
</script>

<template>
  <div id="app">
    <!-- 页面头部 -->
    <HomeHeader></HomeHeader>
    <!-- 功能控制面板 -->
    <ControlPanel />
    <div class="top">
      <!-- 路由出口 匹配的组件所渲染的位置 -->
      <router-view v-if="!isHomePage"></router-view>
    </div>
    <!-- 首页内容，只有在根路径时显示 -->
    <HomePage v-if="isHomePage"></HomePage>
  </div>
</template>

<style src="./assets/global.css"></style>

<style scoped>
#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.top {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #app {
    padding: 15px;
  }
}
</style>
