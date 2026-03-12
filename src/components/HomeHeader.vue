<script setup>
import { onMounted, onUnmounted, ref } from "vue";

// 响应式变量：当前时间
const currentTime = ref("");
// 响应式变量：定时器ID（避免重复创建）
const timer = ref(null);

// 时间更新函数（简化格式配置）
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString("zh-CN", {
    numeric: true,
    hour12: false, // 强制24小时制
  });
};

// 组件挂载：初始化时间 + 创建定时器
onMounted(() => {
  updateTime();
  // 防重复创建定时器
  if (timer.value) clearInterval(timer.value);
  timer.value = setInterval(updateTime, 1000);
});

// 组件卸载：清除定时器（避免内存泄漏）
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
});
</script>

<template>
  <header class="header">
    <div class="header-left">
      <h1>智能压力传感器监控系统</h1>
    </div>
    <div class="device-info">
      <div class="device-name">设备型号: PS-2000</div>
      <!-- 管线选择（后续启用时取消注释） -->
      <!-- <div class="pipeline-selector">
        <label for="pipeline">管线:</label>
        <select id="pipeline" class="selector">
          <option v-for="i in 10" :key="`pipe-${i}`" :value="i">{{ i }}号</option>
        </select>
      </div> -->
      <!-- 法兰选择（后续启用时取消注释） -->
      <!-- <div class="flange-selector">
        <label for="flange">法兰:</label>
        <select id="flange" class="selector">
          <option v-for="i in 12" :key="`flange-${i}`" :value="i">{{ i }}号</option>
        </select>
      </div> -->
      <div class="current-time">{{ currentTime }}</div>
      <div class="status">
        <div class="status-dot"></div>
        <span>在线</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* 加 scoped 避免样式污染全局（关键优化！） */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  color: #2c3e50;
  font-size: 36px;
  margin-bottom: 15px;
  font-weight: 700;
}

.device-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.device-name,
.current-time,
.status,
.pipeline-selector,
.flange-selector {
  font-size: 14px;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
}

.device-name {
  color: #6c757d;
}

.current-time {
  color: #2c3e50;
  font-weight: 600;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;
}

.pipeline-selector,
.flange-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;
}

.selector {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  color: #495057;
  background-color: white;
  cursor: pointer;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.selector:focus {
  border-color: #667eea;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #28a745;
  /* 优化呼吸动画 */
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .header {
    padding: 20px;
    margin-bottom: 20px;
  }
  .header-left h1 {
    font-size: 28px;
  }
  .device-info {
    gap: 10px;
  }
  .device-name,
  .current-time,
  .status,
  .pipeline-selector,
  .flange-selector {
    font-size: 12px;
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  .header-left h1 {
    font-size: 24px;
  }
  .device-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
