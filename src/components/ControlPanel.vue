<script setup>
import { ref } from "vue";
import { initMqtt, disconnect, updateMqttConfig, defaultMqttConfig } from "@/utils/mqtt";
import { useSensorStore } from "@/stores/sensorStore";

const sensorStore = useSensorStore();
const isConnected = ref(false);
const mqttBroker = ref(defaultMqttConfig.broker);
const mqttPort = ref(defaultMqttConfig.port);
const mqttUsername = ref(defaultMqttConfig.username);
const mqttPassword = ref(defaultMqttConfig.password);

// 处理MQTT消息
const handleMessage = (topic, data) => {
  console.log("收到MQTT消息:", topic, data);
  // 更新传感器数据
  sensorStore.updateSensorData(data);
};

// 显示提示消息
const showMessage = (message, type = "info") => {
  // 创建提示元素
  const messageElement = document.createElement("div");
  messageElement.className = `mqtt-message mqtt-message-${type}`;
  messageElement.textContent = message;
  messageElement.style.position = "fixed";
  messageElement.style.top = "20px";
  messageElement.style.right = "20px";
  messageElement.style.padding = "10px 15px";
  messageElement.style.borderRadius = "8px";
  messageElement.style.color = "white";
  messageElement.style.fontSize = "14px";
  messageElement.style.fontWeight = "500";
  messageElement.style.zIndex = "9999";
  messageElement.style.animation = "slideIn 0.3s ease-in-out";

  // 设置不同类型的背景色
  if (type === "success") {
    messageElement.style.backgroundColor = "#28a745";
  } else if (type === "error") {
    messageElement.style.backgroundColor = "#dc3545";
  } else {
    messageElement.style.backgroundColor = "#6c757d";
  }

  // 添加到页面
  document.body.appendChild(messageElement);

  // 3秒后移除
  setTimeout(() => {
    messageElement.style.animation = "slideOut 0.3s ease-in-out";
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 300);
  }, 3000);
};

// 切换MQTT连接状态
const toggleMqttConnection = () => {
  if (isConnected.value) {
    // 断开连接
    disconnect();
    isConnected.value = false;
    console.log("MQTT连接已断开");
    showMessage("MQTT连接已断开", "info");
  } else {
    // 连接到MQTT
    updateMqttConfig({
      broker: mqttBroker.value,
      port: mqttPort.value,
      username: mqttUsername.value,
      password: mqttPassword.value,
    });
    console.log("正在连接MQTT...");
    showMessage("正在连接MQTT...", "info");
    initMqtt(handleMessage, (connected, message) => {
      isConnected.value = connected;
      console.log(`MQTT连接状态: ${connected ? "成功" : "失败"}`, message);
      if (connected) {
        showMessage("MQTT连接成功", "success");
      } else {
        showMessage(`MQTT连接失败 (${message})`, "error");
      }
    });
  }
};
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
            v-model="mqttBroker"
            placeholder="MQTT Broker地址"
            class="mqtt-input"
          />
        </div>
        <div class="input-group">
          <label>端口</label>
          <input type="number" v-model="mqttPort" placeholder="端口" class="mqtt-input" />
        </div>
        <div class="input-group">
          <label>用户名</label>
          <input type="text" v-model="mqttUsername" placeholder="用户名" class="mqtt-input" />
        </div>
        <div class="input-group">
          <label>密码</label>
          <input type="password" v-model="mqttPassword" placeholder="密码" class="mqtt-input" />
        </div>
        <div class="button-group">
          <button
            class="control-btn"
            :class="{ 'btn-success': isConnected, 'btn-primary': !isConnected }"
            @click="toggleMqttConnection"
          >
            "连接MQTT"
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
      <router-link class="control-btn btn-secondary" to="/calibrate-sensor"
        >🎯 传感器校准</router-link
      >
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
  display: flex;
  align-items: flex-end;
}

.button-group .control-btn {
  width: 100%;
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

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mqtt-config {
    flex-direction: column;
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
