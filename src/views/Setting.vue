<script setup>

// 组件名称
defineOptions({
  name: "SettingPage",
});

import { ref, onMounted } from "vue";

// 响应式设置数据
const settings = ref({
  samplingRate: "100",
  lowerThreshold: "50",
  upperThreshold: "200",
  baudRate: "115200",
  dataBits: "8",
  stopBits: "1",
  parity: "none",
  protocolAddress: "ws://127.0.0.1:8083/mqtt",
  zeroCalibration: "0.0",
  fullScaleCalibration: "300.0",
});

// 状态消息
const statusMessage = ref({
  show: false,
  message: "",
  type: "", // 'success' or 'error'
});

// 保存配置
const saveSettings = () => {
  try {
    // 模拟保存到本地存储
    localStorage.setItem("sensorSettings", JSON.stringify(settings.value));
    showStatusMessage("配置保存成功！", "success");
  } catch (error) {
    showStatusMessage("保存配置失败：" + error.message, "error");
  }
};

// 恢复默认配置
const resetToDefault = () => {
  settings.value = {
    samplingRate: "100",
    lowerThreshold: "50",
    upperThreshold: "200",
    baudRate: "115200",
    dataBits: "8",
    stopBits: "1",
    parity: "none",
    protocolAddress: "ws://127.0.0.1:8083/mqtt",
    zeroCalibration: "0.0",
    fullScaleCalibration: "300.0",
  };
  showStatusMessage("已恢复默认配置！", "success");
};

// 显示状态消息
const showStatusMessage = (message, type) => {
  statusMessage.value = {
    show: true,
    message,
    type,
  };
  // 3秒后自动隐藏
  setTimeout(() => {
    statusMessage.value.show = false;
  }, 3000);
};

// 页面加载时从本地存储读取配置
onMounted(() => {
  try {
    const savedSettings = localStorage.getItem("sensorSettings");
    if (savedSettings) {
      settings.value = JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error("读取配置失败：", error);
  }
});
</script>

<template>
  <main class="main-content">
    <div
      class="status-message"
      :class="{
        show: statusMessage.show,
        success: statusMessage.type === 'success',
        error: statusMessage.type === 'error',
      }"
      v-if="statusMessage.show"
    >
      {{ statusMessage.message }}
    </div>

    <form class="settings-form">
      <div class="setting-section">
        <h2 class="section-title">
          <span class="section-icon">📊</span>
          采样配置
        </h2>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">采样频率</label>
            <select class="form-select" v-model="settings.samplingRate">
              <option value="10">10 Hz</option>
              <option value="50">50 Hz</option>
              <option value="100">100 Hz</option>
              <option value="500">500 Hz</option>
              <option value="1000">1000 Hz</option>
            </select>
            <div class="form-help">传感器数据采集频率</div>
          </div>
        </div>
      </div>

      <div class="setting-section">
        <h2 class="section-title">
          <span class="section-icon">⚠️</span>
          报警阈值
        </h2>
        <div class="threshold-group">
          <div class="form-group">
            <label class="form-label">报警下限 (kPa)</label>
            <input
              type="number"
              class="form-input"
              v-model="settings.lowerThreshold"
              min="0"
              max="1000"
              step="0.1"
            />
            <div class="form-help">低于此值将触发下限报警</div>
          </div>
          <div class="form-group">
            <label class="form-label">报警上限 (kPa)</label>
            <input
              type="number"
              class="form-input"
              v-model="settings.upperThreshold"
              min="0"
              max="1000"
              step="0.1"
            />
            <div class="form-help">高于此值将触发上限报警</div>
          </div>
        </div>
      </div>

      <div class="setting-section">
        <h2 class="section-title">
          <span class="section-icon">🔌</span>
          串口通信配置
        </h2>
        <div class="serial-config">
          <div class="form-group">
            <label class="form-label">波特率</label>
            <select class="form-select" v-model="settings.baudRate">
              <option value="9600">9600</option>
              <option value="19200">19200</option>
              <option value="38400">38400</option>
              <option value="57600">57600</option>
              <option value="115200">115200</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">数据位</label>
            <select class="form-select" v-model="settings.dataBits">
              <option value="7">7位</option>
              <option value="8">8位</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">停止位</label>
            <select class="form-select" v-model="settings.stopBits">
              <option value="1">1位</option>
              <option value="2">2位</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">校验位</label>
            <select class="form-select" v-model="settings.parity">
              <option value="none">无</option>
              <option value="even">偶校验</option>
              <option value="odd">奇校验</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">通信协议地址</label>
            <input
              type="text"
              class="form-input"
              v-model="settings.protocolAddress"
              placeholder="例如: ws://127.0.0.1:8083/mqtt"
            />
            <div class="form-help">MQTT 服务器连接地址</div>
          </div>
        </div>
      </div>

      <div class="setting-section">
        <h2 class="section-title">
          <span class="section-icon">📡</span>
          传感器校准
        </h2>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">零点校准值 (kPa)</label>
            <input
              type="number"
              class="form-input"
              v-model="settings.zeroCalibration"
              step="0.1"
              readonly
            />
            <div class="form-help">当前零点偏移值</div>
          </div>
          <div class="form-group">
            <label class="form-label">满量程校准值 (kPa)</label>
            <input
              type="number"
              class="form-input"
              v-model="settings.fullScaleCalibration"
              step="0.1"
            />
            <div class="form-help">传感器满量程值</div>
          </div>
        </div>
      </div>
    </form>

    <div class="button-group">
      <button type="button" class="btn btn-success" @click="saveSettings()">💾 保存配置</button>
      <button type="button" class="btn btn-danger" @click="resetToDefault()">🔄 恢复默认</button>
      <!-- <button type="button" class="btn btn-secondary" @click="goBack()">
        ↩️ 返回首页
      </button> -->
    </div>
  </main>
</template>

<style scoped>
.main-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.settings-form {
  display: grid;
  gap: 30px;
}

.setting-section {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 25px;
  background: #f8f9fa;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.form-input,
.form-select {
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #dc3545;
}

.form-help {
  font-size: 12px;
  color: #6c757d;
}

.threshold-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.serial-config {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.status-message {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: none;
  text-align: center;
}

.status-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-message.show {
  display: block;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .main-content {
    padding: 20px;
  }

  .form-grid,
  .serial-config {
    grid-template-columns: 1fr;
  }

  .threshold-group {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>
