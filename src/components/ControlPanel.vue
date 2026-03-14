<script setup>
import {
  isConnected,
  updateMqttConfig,
  defaultMqttConfig,
  connectMqtt,
  disconnectMqtt,
} from "@/utils/mqtt";
// import { useSensorStore } from "@/stores/sensorStore";

// const sensorStore = useSensorStore();
const mqttConfig = defaultMqttConfig.value;
</script>

<template>
  <div class="controls-panel">
    <h2 class="panel-title">功能控制</h2>
    <!-- MQTT连接控制 -->
    <div class="mqtt-connection">
      <div class="mqtt-config">
        <div class="input-group">
          <label>连接地址</label>
          <input
            type="text"
            v-model.trim="mqttConfig.broker"
            placeholder="MQTT Broker地址"
            class="mqtt-input"
          />
        </div>
        <div class="input-group">
          <label>端口</label>
          <input
            type="number"
            v-model.trim.number="mqttConfig.port"
            placeholder="端口"
            class="mqtt-input"
          />
        </div>
        <div class="input-group">
          <label>用户名</label>
          <input
            type="text"
            v-model.trim="mqttConfig.username"
            placeholder="用户名"
            class="mqtt-input"
          />
        </div>
        <div class="input-group">
          <label>主题</label>
          <input
            type="text"
            v-model.trim="mqttConfig.topic"
            placeholder="主题"
            class="mqtt-input"
          />
        </div>
        <div class="input-group">
          <label>密码</label>
          <input
            type="password"
            v-model="mqttConfig.password"
            placeholder="密码"
            class="mqtt-input"
          />
        </div>
        <div class="button-group">
          <button
            class="control-btn btn-primary"
            @click="
              updateMqttConfig({
                broker: mqttConfig.broker,
                port: mqttConfig.port,
                topic: mqttConfig.topic,
                username: mqttConfig.username,
                password: mqttConfig.password,
              })
            "
          >
            保存配置
          </button>
          <button
            class="control-btn"
            :class="{ 'btn-success': isConnected, 'btn-primary': !isConnected }"
            @click="connectMqtt"
            :disabled="isConnected"
          >
            {{ isConnected ? "已连接" : "连接MQTT" }}
          </button>
          <button
            class="control-btn"
            :class="{ 'btn-danger': !isConnected, 'btn-warning': isConnected }"
            @click="disconnectMqtt"
            :disabled="!isConnected"
          >
            断开MQTT
          </button>
        </div>
      </div>
      <div
        class="connection-status"
        :class="{ connected: isConnected, disconnected: !isConnected }"
      >
        {{ isConnected ? "已连接" : "未连接" }}
      </div>
    </div>
    <!-- 控制按钮网格 -->
    <div class="controls-grid">
      <router-link class="control-btn btn-primary" to="/monitoring-interface"
        >🔍 监控界面</router-link
      >
      <router-link class="control-btn btn-primary" to="/setting">⚙️ 参数设置</router-link>
      <router-link class="control-btn btn-secondary" to="/history">📊 历史数据</router-link>
      <router-link class="control-btn btn-success" to="/export-data">📁 导出数据</router-link>
    </div>
  </div>
</template>

<style scoped>
.controls-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

/* MQTT连接控制样式 */
.mqtt-connection {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
}

.mqtt-config {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.button-group {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-size: 12px;
  font-weight: 500;
  color: #495057;
  text-align: left;
}

.mqtt-input {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 14px;
  color: #495057;
  background-color: white;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.mqtt-input:focus {
  border-color: #667eea;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.button-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.button-group .control-btn {
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.button-group .control-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.button-group .control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.connection-status {
  font-size: 14px;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 6px;
  display: inline-block;
}

.connection-status.connected {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.connection-status.disconnected {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.control-btn {
  padding: 15px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  text-decoration: none;
  color: white;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.btn-secondary {
  background: #6c757d;
}

.btn-success {
  background: #28a745;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-danger {
  background: #dc3545;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mqtt-config {
    grid-template-columns: 1fr;
  }

  .button-group {
    grid-template-columns: 1fr;
  }

  .mqtt-input {
    width: 100%;
  }

  .controls-grid {
    grid-template-columns: 1fr;
  }

  .control-btn {
    width: 100%;
  }
}

/* 消息提示动画 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
