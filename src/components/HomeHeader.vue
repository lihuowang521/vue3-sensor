<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useSensorStore } from "@/stores/sensorStore";

const currentTime = ref("");
const sensorStore = useSensorStore();

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

let timer = null;

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

// 监听管线和法兰的变化
watch(
  () => sensorStore.selectedPipeline,
  (newValue) => {
    console.log("管线选择变化:", newValue);
  },
);

watch(
  () => sensorStore.selectedFlange,
  (newValue) => {
    console.log("法兰选择变化:", newValue);
  },
);
</script>

<template>
  <header class="header">
    <!-- 头部左侧：系统标题区域 -->
    <div class="header-left">
      <h1>智能压力传感器监控系统</h1>
    </div>
    <!-- 头部右侧：设备信息区域 -->
    <div class="device-info">
      <div class="device-name">设备型号: PS-2000</div>
      <!-- 管线选择 -->
      <div class="pipeline-selector">
        <label for="pipeline">管线:</label>
        <select id="pipeline" v-model="sensorStore.selectedPipeline" class="selector">
          <option v-for="i in 10" :key="i" :value="i">{{ i }}号</option>
        </select>
      </div>
      <!-- 法兰选择 -->
      <div class="flange-selector">
        <label for="flange">法兰:</label>
        <select id="flange" v-model="sensorStore.selectedFlange" class="selector">
          <option v-for="i in 12" :key="i" :value="i">{{ i }}号</option>
        </select>
      </div>
      <!-- 当前时间显示（通过JavaScript动态更新） -->
      <div class="current-time">{{ currentTime }}</div>
      <!-- 设备状态指示器 -->
      <div class="status">
        <!-- 状态指示灯（绿色表示在线，带有脉冲动画效果） -->
        <div class="status-dot"></div>
        <span>在线</span>
      </div>
    </div>
  </header>
</template>

<style>
/* 页面头部样式 */
/* 半透明背景、毛玻璃效果、圆角边框、阴影提升视觉层次感 */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 页面标题样式 */
/* 设置标题颜色、大小和底部外边距 */
.header-left h1 {
  color: #2c3e50;
  font-size: 36px;
  margin-bottom: 15px;
  font-weight: 700;
}

/* 设备信息容器样式 */
/* 使用flex布局排列设备信息项 */
.device-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

/* 设备型号文本样式 */
.device-name {
  font-size: 14px;
  color: #6c757d;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
}

/* 当前时间显示样式 */
.current-time {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 600;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
}

/* 设备状态容器样式 */
/* 使用flex布局对齐状态指示灯和文本 */
.status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  font-size: 14px;
  color: #495057;
}

/* 选择器容器样式 */
.pipeline-selector,
.flange-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  font-size: 14px;
  color: #495057;
}

/* 选择器样式 */
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

/* 状态指示灯样式 */
/* 圆形绿灯表示设备在线，应用pulse动画实现呼吸灯效果 */
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #28a745;
  animation: pulse 2s infinite;
}

/* 脉冲动画：实现状态灯的闪烁效果 */
/* 脉冲动画定义 */
/* 通过改变透明度实现呼吸灯效果 */
@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 20px;
    margin-bottom: 20px;
  }

  .header-left h1 {
    font-size: 28px;
  }

  .device-info {
    justify-content: center;
    gap: 10px;
  }

  .device-name,
  .current-time,
  .status {
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
