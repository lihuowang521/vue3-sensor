<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
// 1. 导入状态管理（需确保 sensorStore 已正确定义）
import { useSensorStore } from "@/stores/sensorStore";
// 2. 导入ECharts
import * as echarts from "echarts";

// 初始化状态仓库
const sensorStore = useSensorStore();
// 选中的传感器
const selectedSensor = ref("sensor1");
// 图表实例（用于销毁）
let chartInstance = null;
// 图表容器引用
const chartRef = ref(null);
// 报警状态（响应式控制报警区域显示）
const isAlert = ref(false);
// 定时器（模拟实时数据更新）
let dataTimer = null;
// 从本地存储读取系统配置
const systemConfig = ref({
  samplingRate: "100",
  lowerThreshold: "50",
  upperThreshold: "200",
  baudRate: "115200",
});

// 初始化系统配置（从setting页面的本地存储读取）
const initSystemConfig = () => {
  try {
    const savedData = localStorage.getItem("sensorSettings");
    if (savedData) {
      const { settings } = JSON.parse(savedData);
      systemConfig.value = {
        samplingRate: settings.samplingRate || "100",
        lowerThreshold: settings.lowerThreshold || "50",
        upperThreshold: settings.upperThreshold || "200",
        baudRate: settings.baudRate || "115200",
      };
    }
  } catch (error) {
    console.error("读取系统配置失败：", error);
  }
};

// 初始化趋势图
const initChart = () => {
  if (!chartRef.value) return;
  // 初始化ECharts实例
  chartInstance = echarts.init(chartRef.value);
  // 图表配置项
  const option = {
    title: { text: "", left: "center" },
    tooltip: { trigger: "axis" },
    legend: { data: ["压力值(kPa)"], bottom: 0 },
    grid: { left: "3%", right: "4%", bottom: "15%", top: "10%", containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: Array.from({ length: 60 }, (_, i) => `${i}秒前`).reverse(),
    },
    yAxis: {
      type: "value",
      min: Number(systemConfig.value.lowerThreshold) - 10,
      max: Number(systemConfig.value.upperThreshold) + 10,
      axisLabel: { formatter: "{value} kPa" },
    },
    series: [
      {
        name: "压力值(kPa)",
        type: "line",
        data: Array.from(
          { length: 60 },
          () =>
            Math.random() *
              (Number(systemConfig.value.upperThreshold) -
                Number(systemConfig.value.lowerThreshold)) +
            Number(systemConfig.value.lowerThreshold),
        ),
        smooth: true,
        lineStyle: { color: "#667eea", width: 2 },
        itemStyle: { color: "#764ba2" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgba(102, 126, 234, 0.3)",
            },
            {
              offset: 1,
              color: "rgba(118, 75, 162, 0.1)",
            },
          ]),
        },
      },
    ],
  };
  chartInstance.setOption(option);
};

// 处理传感器切换
const handleSensorChange = () => {
  // 更新图表标题和数据
  if (chartInstance) {
    chartInstance.setOption({
      title: { text: `${selectedSensor.value} 压力趋势` },
      series: [
        {
          data: Array.from(
            { length: 60 },
            () =>
              Math.random() *
                (Number(systemConfig.value.upperThreshold) -
                  Number(systemConfig.value.lowerThreshold)) +
              Number(systemConfig.value.lowerThreshold),
          ),
        },
      ],
    });
  }
  // 模拟更新选中传感器的实时数值
  updateSensorValue();
};

// 模拟实时更新传感器数值
const updateSensorValue = () => {
  // 模拟12个传感器的数值（可替换为MQTT订阅的真实数据）
  const newSensorData = {};
  for (let i = 1; i <= 12; i++) {
    const key = `sensor${i}`;
    // 随机生成数值，偶尔超出阈值触发报警
    const randomValue = Math.random() * 250;
    newSensorData[key] = randomValue.toFixed(1);
    // 检查是否超出阈值
    if (
      randomValue < Number(systemConfig.value.lowerThreshold) ||
      randomValue > Number(systemConfig.value.upperThreshold)
    ) {
      isAlert.value = true;
      // 5秒后自动关闭报警（可根据需求调整）
      setTimeout(() => (isAlert.value = false), 5000);
    }
  }
  // 更新状态仓库（需确保sensorStore有sensorData字段且可修改）
  sensorStore.sensorData = newSensorData;

  // 更新趋势图最后一个数据点
  if (chartInstance) {
    const option = chartInstance.getOption();
    const newData = option.series[0].data.slice(1); // 移除第一个数据点
    newData.push(
      Math.random() *
        (Number(systemConfig.value.upperThreshold) - Number(systemConfig.value.lowerThreshold)) +
        Number(systemConfig.value.lowerThreshold),
    );
    chartInstance.setOption({
      series: [{ data: newData }],
    });
  }
};

// 窗口大小变化时重绘图表
const resizeChart = () => {
  if (chartInstance) chartInstance.resize();
};

// 生命周期：挂载时初始化
onMounted(() => {
  // 初始化系统配置
  initSystemConfig();
  // 初始化传感器数据（默认值）
  if (!sensorStore.sensorData) {
    sensorStore.sensorData = {};
    for (let i = 1; i <= 12; i++) {
      sensorStore.sensorData[`sensor${i}`] = "0.0";
    }
  }
  // 初始化图表
  initChart();
  // 监听窗口大小变化
  window.addEventListener("resize", resizeChart);
  // 启动实时数据更新定时器（模拟1秒更新一次）
  dataTimer = setInterval(updateSensorValue, 1000);
});

// 生命周期：卸载时清理
onUnmounted(() => {
  // 销毁图表实例
  if (chartInstance) chartInstance.dispose();
  // 移除事件监听
  window.removeEventListener("resize", resizeChart);
  // 清除定时器
  if (dataTimer) clearInterval(dataTimer);
});

// 监听配置变化（如果setting页面修改了配置，实时更新）
watch([() => systemConfig.value.lowerThreshold, () => systemConfig.value.upperThreshold], () => {
  initChart(); // 重新初始化图表（更新阈值范围）
});
</script>

<template>
  <div>
    <main class="main-content">
      <!-- 实时压力监控面板 -->
      <section class="gauge-panel">
        <h2 class="panel-title">实时压力监控</h2>
        <!-- 压力表容器（修复样式冲突） -->
        <div class="sensor-gauge-container">
          <!-- 12个压力传感器的圆形布局 -->
          <div class="sensor-circle">
            <!-- 传感器1 (0°) -->
            <div
              class="sensor-item"
              style="--angle: 0deg"
              :class="{
                'sensor-item--alert':
                  sensorStore.sensorData.sensor1 < systemConfig.lowerThreshold ||
                  sensorStore.sensorData.sensor1 > systemConfig.upperThreshold,
              }"
            >
              <div class="sensor-dot"></div>
              <div class="sensor-label">传感器1</div>
              <div class="sensor-value">{{ sensorStore.sensorData.sensor1 }} kPa</div>
            </div>
            <!-- 传感器2 (30°) -->
            <div
              class="sensor-item"
              style="--angle: 30deg"
              :class="{
                'sensor-item--alert':
                  sensorStore.sensorData.sensor2 < systemConfig.lowerThreshold ||
                  sensorStore.sensorData.sensor2 > systemConfig.upperThreshold,
              }"
            >
              <div class="sensor-dot"></div>
              <div class="sensor-label">传感器2</div>
              <div class="sensor-value">{{ sensorStore.sensorData.sensor2 }} kPa</div>
            </div>
            <!-- 传感器3 (60°) -->
            <div
              class="sensor-item"
              style="--angle: 60deg"
              :class="{
                'sensor-item--alert':
                  sensorStore.sensorData.sensor3 < systemConfig.lowerThreshold ||
                  sensorStore.sensorData.sensor3 > systemConfig.upperThreshold,
              }"
            >
              <div class="sensor-dot"></div>
              <div class="sensor-label">传感器3</div>
              <div class="sensor-value">{{ sensorStore.sensorData.sensor3 }} kPa</div>
            </div>
            <!-- 传感器4 (90°) -->
            <div
              class="sensor-item"
              style="--angle: 90deg"
              :class="{
                'sensor-item--alert':
                  sensorStore.sensorData.sensor4 < systemConfig.lowerThreshold ||
                  sensorStore.sensorData.sensor4 > systemConfig.upperThreshold,
              }"
            >
              <div class="sensor-dot"></div>
              <div class="sensor-label">传感器4</div>
              <div class="sensor-value">{{ sensorStore.sensorData.sensor4 }} kPa</div>
            </div>
            <!-- 传感器5 (120°) -->
            <div
              class="sensor-item"
              style="--angle: 120deg"
              :class="{
                'sensor-item--alert':
                  sensorStore.sensorData.sensor5 < systemConfig.lowerThreshold ||
                  sensorStore.sensorData.sensor5 > systemConfig.upperThreshold,
              }"
            >
              <div class="sensor-dot"></div>
              <div class="sensor-label">传感器5</div>
              <div class="sensor-value">{{ sensorStore.sensorData.sensor5 }} kPa</div>
            </div>
            <!-- 传感器6 (150°) -->
            <div
              class="sensor-item"
              style="--angle: 150deg"
              :class="{
                'sensor-item--alert':
                  sensorStore.sensorData.sensor6 < systemConfig.lowerThreshold ||
                  sensorStore.sensorData.sensor6 > systemConfig.upperThreshold,
              }"
            >
              <div class="sensor-dot"></div>
              <div class="sensor-label">传感器6</div>
              <div class="sensor-value">{{ sensorStore.sensorData.sensor6 }} kPa</div>
            </div>
            <!-- 传感器7 (180°) -->
            <div
              class="sensor-item"
              style="--angle: 180deg"
              :class="{
                'sensor-item--alert':
                  sensorStore.sensorData.sensor7 < systemConfig.lowerThreshold ||
                  sensorStore.sensorData.sensor7 > systemConfig.upperThreshold,
              }"
            >
              <div class="sensor-dot"></div>
              <div class="sensor-label">传感器7</div>
              <div class="sensor-value">{{ sensorStore.sensorData.sensor7 }} kPa</div>
            </div>
            <!-- 传感器8 (210°) -->
            <div
              class="sensor-item"
              style="--angle: 210deg"
              :class="{
                'sensor-item--alert':
                  sensorStore.sensorData.sensor8 < systemConfig.lowerThreshold ||
                  sensorStore.sensorData.sensor8 > systemConfig.upperThreshold,
              }"
            >
              <div class="sensor-dot"></div>
              <div class="sensor-label">传感器8</div>
              <div class="sensor-value">{{ sensorStore.sensorData.sensor8 }} kPa</div>
            </div>
            <!-- 传感器9 (240°) -->
            <div
              class="sensor-item"
              style="--angle: 240deg"
              :class="{
                'sensor-item--alert':
                  sensorStore.sensorData.sensor9 < systemConfig.lowerThreshold ||
                  sensorStore.sensorData.sensor9 > systemConfig.upperThreshold,
              }"
            >
              <div class="sensor-dot"></div>
              <div class="sensor-label">传感器9</div>
              <div class="sensor-value">{{ sensorStore.sensorData.sensor9 }} kPa</div>
            </div>
            <!-- 传感器10 (270°) -->
            <div
              class="sensor-item"
              style="--angle: 270deg"
              :class="{
                'sensor-item--alert':
                  sensorStore.sensorData.sensor10 < systemConfig.lowerThreshold ||
                  sensorStore.sensorData.sensor10 > systemConfig.upperThreshold,
              }"
            >
              <div class="sensor-dot"></div>
              <div class="sensor-label">传感器10</div>
              <div class="sensor-value">{{ sensorStore.sensorData.sensor10 }} kPa</div>
            </div>
            <!-- 传感器11 (300°) -->
            <div
              class="sensor-item"
              style="--angle: 300deg"
              :class="{
                'sensor-item--alert':
                  sensorStore.sensorData.sensor11 < systemConfig.lowerThreshold ||
                  sensorStore.sensorData.sensor11 > systemConfig.upperThreshold,
              }"
            >
              <div class="sensor-dot"></div>
              <div class="sensor-label">传感器11</div>
              <div class="sensor-value">{{ sensorStore.sensorData.sensor11 }} kPa</div>
            </div>
            <!-- 传感器12 (330°) -->
            <div
              class="sensor-item"
              style="--angle: 330deg"
              :class="{
                'sensor-item--alert':
                  sensorStore.sensorData.sensor12 < systemConfig.lowerThreshold ||
                  sensorStore.sensorData.sensor12 > systemConfig.upperThreshold,
              }"
            >
              <div class="sensor-dot"></div>
              <div class="sensor-label">传感器12</div>
              <div class="sensor-value">{{ sensorStore.sensorData.sensor12 }} kPa</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 压力趋势图面板 -->
      <section class="chart-panel">
        <h2 class="panel-title">压力趋势图</h2>
        <!-- 数据时间范围提示 -->
        <div class="time-range">最近1小时数据（实时更新）</div>
        <!-- 传感器选择下拉框 -->
        <div class="sensor-selector">
          <label for="sensor-select">选择传感器：</label>
          <select
            id="sensor-select"
            class="sensor-select"
            v-model="selectedSensor"
            @change="handleSensorChange"
          >
            <option value="sensor1">传感器1</option>
            <option value="sensor2">传感器2</option>
            <option value="sensor3">传感器3</option>
            <option value="sensor4">传感器4</option>
            <option value="sensor5">传感器5</option>
            <option value="sensor6">传感器6</option>
            <option value="sensor7">传感器7</option>
            <option value="sensor8">传感器8</option>
            <option value="sensor9">传感器9</option>
            <option value="sensor10">传感器10</option>
            <option value="sensor11">传感器11</option>
            <option value="sensor12">传感器12</option>
          </select>
        </div>
        <!-- 图表容器（绑定ref） -->
        <div class="chart-container" ref="chartRef"></div>
      </section>
    </main>

    <section class="bottom-section">
      <!-- 系统参数面板 -->
      <div class="parameters-panel">
        <h2 class="panel-title">系统参数</h2>
        <!-- 参数网格布局 -->
        <div class="parameters-grid">
          <!-- 采样频率参数（关联本地配置） -->
          <div class="param-item">
            <div class="param-label">采样频率</div>
            <div class="param-value">{{ systemConfig.samplingRate }} Hz</div>
          </div>
          <!-- 报警上限参数（关联本地配置） -->
          <div class="param-item">
            <div class="param-label">报警上限</div>
            <div class="param-value">{{ systemConfig.upperThreshold }} kPa</div>
          </div>
          <!-- 报警下限参数（关联本地配置） -->
          <div class="param-item">
            <div class="param-label">报警下限</div>
            <div class="param-value">{{ systemConfig.lowerThreshold }} kPa</div>
          </div>
          <!-- 通信波特率参数（关联本地配置） -->
          <div class="param-item">
            <div class="param-label">通信波特率</div>
            <div class="param-value">{{ systemConfig.baudRate }}</div>
          </div>
        </div>
        <!-- 报警区域（响应式控制显示） -->
        <div class="alert-area" :class="{ show: isAlert }">
          <strong>⚠️ 压力报警</strong><br />
          当前压力超出设定阈值范围！
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 重置默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 传感器圆形布局容器（修复样式冲突，重命名类名） */
.sensor-gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  width: 100%;
}

/* 传感器圆形布局容器 */
.sensor-circle {
  position: relative;
  width: min(400px, 100%); /* 自适应宽度，最大400px */
  height: min(400px, 100%);
  border-radius: 50%;
  border: 2px solid #e0e0e0;
  background: rgba(248, 249, 250, 0.5);
  margin: 20px auto;
}

/* 传感器项目基础样式 */
.sensor-item {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center;
  transform: translate(-50%, -50%) rotate(var(--angle)) translateX(calc(50% - 40px))
    rotate(calc(-1 * var(--angle)));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 80px;
  transition: all 0.3s ease;
}

/* 传感器异常状态样式 */
.sensor-item--alert {
  .sensor-dot {
    background: linear-gradient(45deg, #e74c3c, #c0392b);
    box-shadow: 0 0 10px rgba(231, 76, 60, 0.8);
    animation: pulse-alert 1s infinite;
  }
  .sensor-value {
    color: #e74c3c;
    font-weight: bold;
  }
}

/* 传感器圆点 */
.sensor-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

/* 传感器标签 */
.sensor-label {
  font-size: 12px;
  color: #6c757d;
  text-align: center;
}

/* 传感器数值 */
.sensor-value {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  transition: all 0.3s ease;
}

/* 主要内容区域布局 */
.main-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); /* 自适应列数，最小400px */
  gap: 20px;
  margin: 20px;
}

/* 面板基础样式 */
.gauge-panel,
.chart-panel,
.parameters-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 面板标题样式 */
.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

/* 图表容器样式 */
.chart-container {
  height: 300px;
  position: relative;
  width: 100%;
}

/* 时间范围文本样式 */
.time-range {
  text-align: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #6c757d;
}

/* 传感器选择器样式 */
.sensor-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
}

.sensor-selector label {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.sensor-select {
  padding: 8px 12px;
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

.sensor-select:focus {
  border-color: #667eea;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

/* 底部区域布局 */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin: 0 20px 20px;
}

/* 参数网格布局 */
.parameters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

/* 参数项样式 */
.param-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

/* 参数标签样式 */
.param-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 5px;
}

/* 参数值样式 */
.param-value {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

/* 报警区域基础样式 */
.alert-area {
  background: #fff5f5;
  border: 2px solid #fed7d7;
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
  text-align: center;
  color: #e53e3e;
  display: none;
  animation: fadeIn 0.3s ease;
}

/* 报警区域显示样式 */
.alert-area.show {
  display: block;
}

/* 动画定义 */
@keyframes pulse-alert {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    margin: 10px;
  }

  .bottom-section {
    margin: 0 10px 10px;
  }

  .sensor-circle {
    width: min(300px, 100%);
    height: min(300px, 100%);
  }

  .sensor-item {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(calc(50% - 30px))
      rotate(calc(-1 * var(--angle)));
    min-width: 70px;
  }

  .gauge-panel,
  .chart-panel,
  .parameters-panel {
    padding: 20px 15px;
  }

  .chart-container {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .sensor-selector {
    flex-direction: column;
    gap: 8px;
  }

  .parameters-grid {
    grid-template-columns: 1fr;
  }

  .param-item {
    padding: 10px;
  }

  .param-value {
    font-size: 18px;
  }
}
</style>
