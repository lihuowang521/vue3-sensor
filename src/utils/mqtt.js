import mqtt from "mqtt";
import { ref } from "vue";

export let defaultMqttConfig = {
  broker: "va1af2fe.ala.cn-hangzhou.emqxsl.cn",
  port: 8884,
  topic: "sensor/data",
  username: "qqqqwwww",
  password: "123456",
};
const clientId = "emqx_vue3_" + Math.random().toString(16).substring(2, 8);

// MQTT连接配置
let mqttConfig = { ...defaultMqttConfig };

// 更新MQTT配置
export const updateMqttConfig = (config) => {
  mqttConfig = { ...mqttConfig, ...config };
};

let client = mqtt.connect(`wss://${mqttConfig.broker}:${mqttConfig.port}/mqtt`, {
  clientId: clientId,
  username: mqttConfig.username,
  password: mqttConfig.password,
  // ...other options
});

// 设置将要订阅的主题和 QoS
const subscription = ref({
  topic: mqttConfig.topic,
  qos: 0,
});

const doSubscribe = () => {
  const { topic, qos } = subscription.value;
  client.subscribe(topic, { qos }, (error, granted) => {
    if (error) {
      console.log("subscribe error:", error);
      return;
    }
    console.log("subscribe successfully:", granted);
  });
};

const doUnSubscribe = () => {
  const { topic, qos } = subscription.value;
  client.unsubscribe(topic, { qos }, (error) => {
    if (error) {
      console.log("unsubscribe error:", error);
      return;
    }
    console.log(`unsubscribed topic: ${topic}`);
  });
};

// let messageCallback = null;

// // 初始化MQTT连接
// export const initMqtt = (callback, connectionCallback) => {
//   // 优化：先断开旧连接，避免重复创建
//   if (client) {
//     client.end();
//     client = null;
//   }
//   const url = `wss://${mqttConfig.broker}:${mqttConfig.port}/mqtt`;

//   // 创建客户端
//   client = mqtt.connect(url, {
//     username: mqttConfig.username,
//     password: mqttConfig.password,
//     clean: true,
//     connectTimeout: 4000,
//     reconnection: true,
//     reconnectionAttempts: 5,
//     reconnectionDelay: 1000,
//   });

//   // 保存回调函数
//   messageCallback = callback;

//   // 连接成功事件
//   client.on("connect", () => {
//     console.log("MQTT连接成功");
//     // 订阅主题
//     client.subscribe(mqttConfig.topic, (err) => {
//       if (err) {
//         console.error("订阅主题失败:", err);
//         if (connectionCallback) {
//           connectionCallback(false, "订阅主题失败");
//         }
//       } else {
//         console.log("订阅主题成功:", mqttConfig.topic);
//         if (connectionCallback) {
//           connectionCallback(true, "连接成功");
//         }
//       }
//     });
//   });

//   // 接收消息事件
//   client.on("message", (topic, message) => {
//     console.log("收到消息:", topic, message.toString());
//     if (messageCallback) {
//       try {
//         const data = JSON.parse(message.toString());
//         messageCallback(topic, data);
//       } catch (error) {
//         console.error("解析消息失败:", error);
//       }
//     }
//   });

//   // 连接错误事件
//   client.on("error", (error) => {
//     console.error("MQTT连接错误:", error);
//     console.log("错误原因:", error.message || error);
//     if (connectionCallback) {
//       connectionCallback(false, error.message);
//     }
//   });

//   // 断开连接事件
//   client.on("close", () => {
//     console.log("MQTT连接断开");
//   });
// };

// // 发布消息
// export const publish = (topic, message) => {
//   if (client && client.connected) {
//     client.publish(topic, message, (err) => {
//       if (err) {
//         console.error("发布消息失败:", err);
//       }
//     });
//   } else {
//     console.error("MQTT客户端未连接");
//   }
// };

// // 订阅主题
// export const subscribe = (topic) => {
//   if (client && client.connected) {
//     client.subscribe(topic, (err) => {
//       if (err) {
//         console.error("订阅主题失败:", err);
//       } else {
//         console.log("订阅主题成功:", topic);
//       }
//     });
//   } else {
//     console.error("MQTT客户端未连接");
//   }
// };

// // 取消订阅
// export const unsubscribe = (topic) => {
//   if (client && client.connected) {
//     client.unsubscribe(topic, (err) => {
//       if (err) {
//         console.error("取消订阅失败:", err);
//       } else {
//         console.log("取消订阅成功:", topic);
//       }
//     });
//   } else {
//     console.error("MQTT客户端未连接");
//   }
// };

// // 断开连接
// export const disconnect = () => {
//   if (client) {
//     client.end();
//     client = null;
//   }
// };
