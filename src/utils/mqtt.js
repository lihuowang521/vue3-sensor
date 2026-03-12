import mqtt from "mqtt";
import { ref } from "vue";

// 默认MQTT配置
export const defaultMqttConfig = ref({
  broker: "va1af2fe.ala.cn-hangzhou.emqxsl.cn",
  port: 8084,
  topic: "sensor/data",
  username: "qqqqwwww",
  password: "123456",
});

// 连接状态
export const isConnected = ref(false);

// 🔥 新增：响应式变量保存订阅到的传感器数据（供页面使用）
export const receivedSensorData = ref(null);
// 🔥 新增：保存历史数据（可选，用于趋势图/历史页面）
export const sensorDataHistory = ref([]);

// 更新MQTT配置
export const updateMqttConfig = (newConfig) => {
  Object.assign(defaultMqttConfig.value, newConfig);
};

// MQTT客户端实例
export let client = null;

// 连接MQTT函数（补充接收消息逻辑）
export const connectMqtt = () => {
  // 配置校验
  if (!defaultMqttConfig.value.broker) {
    alert("请填写MQTT连接地址！");
    return null;
  }
  if (
    isNaN(defaultMqttConfig.value.port) ||
    defaultMqttConfig.value.port < 0 ||
    defaultMqttConfig.value.port > 65535
  ) {
    alert("请填写合法的端口号（0-65535）！");
    return null;
  }

  // 生成clientId
  const clientId = "emqx_vue3_" + Math.random().toString(16).substring(2, 8);

  // 断开已有连接
  if (client) {
    client.end();
    client = null;
  }

  try {
    client = mqtt.connect(
      `wss://${defaultMqttConfig.value.broker}:${defaultMqttConfig.value.port}/mqtt`,
      {
        clientId: clientId,
        username: defaultMqttConfig.value.username,
        password: defaultMqttConfig.value.password,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
      },
    );

    // 连接成功
    client.on("connect", () => {
      console.log("MQTT连接成功！");
      isConnected.value = true;
      // 订阅主题
      client.subscribe(defaultMqttConfig.value.topic, (err) => {
        if (!err) {
          console.log(`订阅主题 ${defaultMqttConfig.value.topic} 成功`);
          alert(`订阅主题 ${defaultMqttConfig.value.topic} 成功`);
        }
      });
    });

    // 🔥 核心补充：监听收到的消息（订阅数据）
    client.on("message", (topic, payload) => {
      try {
        // 1. 将二进制payload转为JSON对象（传感器数据）
        const data = JSON.parse(payload.toString());
        console.log(`收到${topic}主题的消息：`, data);

        // 2. 保存到响应式变量（供页面实时显示）
        receivedSensorData.value = data;

        // 3. 保存到历史数据（可选，限制最多100条，避免内存溢出）
        sensorDataHistory.value.push({
          ...data,
          timestamp: new Date().toLocaleString(), // 追加时间戳
        });
        if (sensorDataHistory.value.length > 100) {
          sensorDataHistory.value.shift(); // 只保留最新100条
        }

        // 4. 可选：保存到本地存储（持久化，页面刷新不丢失）
        localStorage.setItem("latestSensorData", JSON.stringify(receivedSensorData.value));
        localStorage.setItem("sensorDataHistory", JSON.stringify(sensorDataHistory.value));
      } catch (err) {
        console.error("解析MQTT消息失败：", err);
      }
    });

    // 连接错误
    client.on("error", (err) => {
      console.error("MQTT连接失败：", err);
      isConnected.value = false;
      alert(`MQTT连接失败：${err.message}`);
      client = null;
    });

    // 连接断开
    client.on("close", () => {
      console.log("MQTT连接已断开");
      isConnected.value = false;
      client = null;
    });

    return client;
  } catch (err) {
    console.error("创建MQTT连接失败：", err);
    alert(`创建连接失败：${err.message}`);
    return null;
  }
};

// 断开MQTT连接
export const disconnectMqtt = () => {
  if (client) {
    client.end();
    client = null;
    isConnected.value = false;
    console.log("手动断开MQTT连接");
  }
};

// 发布消息配置
const publish = ref({
  topic: defaultMqttConfig.value.topic,
  payload: {
    pipe_id: "P001",
    flange_id: "F01",
    sensor_position: 1,
    position_angle: 0.0,
    pressure: 1.0,
    raw_pressure: 1.0,
    battery_voltage: 3.5,
    signal_strength: -70,
    parsed_time: "2026-03-11 10:00:00",
    is_abnormal: 0,
  },
  qos: 0,
});

// 发布消息
export const doPublish = () => {
  const { topic, qos, payload } = publish.value;

  try {
    const jsonPayload = JSON.stringify(payload);
    client.publish(topic, jsonPayload, { qos }, (error) => {
      if (error) {
        console.error("MQTT 发布失败:", error);
        return;
      }
      console.log("发布成功，原始数据：", payload);
      console.log("发布的 JSON 字符串：", jsonPayload);
    });
  } catch (err) {
    console.error("JSON 序列化失败:", err);
  }
};

// 🔥 新增：初始化时从本地存储加载历史数据（可选）
export const initSensorData = () => {
  const latestData = localStorage.getItem("latestSensorData");
  const historyData = localStorage.getItem("sensorDataHistory");
  if (latestData) {
    receivedSensorData.value = JSON.parse(latestData);
  }
  if (historyData) {
    sensorDataHistory.value = JSON.parse(historyData);
  }
};
