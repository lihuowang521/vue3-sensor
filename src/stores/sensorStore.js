import { defineStore } from "pinia";
import { ref } from "vue";

export const useSensorStore = defineStore("sensor", () => {
  // 响应式状态
  const sensorData = ref({
    sensor1: "0.0 kPa",
    sensor2: "0.0 kPa",
    sensor3: "0.0 kPa",
    sensor4: "0.0 kPa",
    sensor5: "0.0 kPa",
    sensor6: "0.0 kPa",
    sensor7: "0.0 kPa",
    sensor8: "0.0 kPa",
    sensor9: "0.0 kPa",
    sensor10: "0.0 kPa",
    sensor11: "0.0 kPa",
    sensor12: "0.0 kPa",
  });

  const selectedPipeline = ref(1);
  const selectedFlange = ref(1);
  const historyData = ref([]);
  const chartData = ref([]);

  // 计算属性
  const getSensorValue = (sensorId) => {
    return sensorData.value[sensorId] || "0.0 kPa";
  };

  // 方法
  const updateSensorData = (data) => {
    // 处理后端传来的数据格式
    try {
      if (data && typeof data !== "undefined" && data !== null) {
        // 检查数据是否为数组（可能包含多个传感器数据）
        if (Array.isArray(data)) {
          // 处理数组格式数据
          const sensorDataMap = {};
          let timestamp = new Date().toISOString();
          data.forEach((item) => {
            if (
              item &&
              typeof item === "object" &&
              typeof item.sensor_position === "number" &&
              typeof item.pressure === "number" &&
              !isNaN(item.pressure)
            ) {
              // 检查是否匹配当前选中的管线和法兰
              const currentPipeId = `P${String(selectedPipeline.value).padStart(3, "0")}`;
              const currentFlangeId = `F${String(selectedFlange.value).padStart(2, "0")}`;

              // 只处理当前选中的管线和法兰的数据
              if (item.pipe_id === currentPipeId && item.flange_id === currentFlangeId) {
                // 使用后端提供的时间戳（如果有）
                if (item.parsed_time) {
                  timestamp = new Date(item.parsed_time).toISOString();
                }
                const sensorKey = `sensor${item.sensor_position}`;
                // 转换单位：MPa 到 kPa
                const pressureInKPa = item.pressure * 1000;
                if (!isNaN(pressureInKPa) && sensorData.value.hasOwnProperty(sensorKey)) {
                  sensorDataMap[sensorKey] = pressureInKPa;
                  // 更新传感器数据
                  sensorData.value[sensorKey] = `${pressureInKPa.toFixed(1)} kPa`;
                }
              }
            }
          });
          // 保存到历史数据
          if (Object.keys(sensorDataMap).length > 0) {
            saveToHistory(sensorDataMap, timestamp);
            // 更新图表数据
            updateChartData(sensorDataMap);
          }
        } else if (typeof data === "object") {
          // 处理单个对象格式数据
          if (
            typeof data.sensor_position === "number" &&
            typeof data.pressure === "number" &&
            !isNaN(data.pressure)
          ) {
            // 检查是否匹配当前选中的管线和法兰
            const currentPipeId = `P${String(selectedPipeline.value).padStart(3, "0")}`;
            const currentFlangeId = `F${String(selectedFlange.value).padStart(2, "0")}`;

            // 只处理当前选中的管线和法兰的数据
            if (data.pipe_id === currentPipeId && data.flange_id === currentFlangeId) {
              // 使用后端提供的时间戳（如果有）
              let timestamp = new Date().toISOString();
              if (data.parsed_time) {
                timestamp = new Date(data.parsed_time).toISOString();
              }
              // 单个传感器数据
              const sensorKey = `sensor${data.sensor_position}`;
              // 转换单位：MPa 到 kPa
              const pressureInKPa = data.pressure * 1000;
              if (!isNaN(pressureInKPa) && sensorData.value.hasOwnProperty(sensorKey)) {
                sensorData.value[sensorKey] = `${pressureInKPa.toFixed(1)} kPa`;
                // 保存到历史数据
                const sensorDataMap = {
                  [sensorKey]: pressureInKPa,
                };
                saveToHistory(sensorDataMap, timestamp);
                updateChartData(sensorDataMap);
              }
            }
          } else {
            // 兼容旧格式数据
            for (const key in data) {
              if (
                sensorData.value.hasOwnProperty(key) &&
                typeof data[key] === "number" &&
                !isNaN(data[key])
              ) {
                sensorData.value[key] = `${data[key].toFixed(1)} kPa`;
              }
            }
            saveToHistory(data);
            updateChartData(data);
          }
        }
      }
    } catch (error) {
      console.error("更新传感器数据失败:", error);
    }
  };

  const saveToHistory = (data, timestamp = new Date().toISOString()) => {
    const historyItem = {
      timestamp,
      pipeline: selectedPipeline.value,
      flange: selectedFlange.value,
      data: { ...data },
    };

    historyData.value.push(historyItem);

    // 限制历史数据长度，只保留最近1000条
    if (historyData.value.length > 1000) {
      historyData.value.shift();
    }
  };

  const updateChartData = (data) => {
    const timestamp = new Date().toLocaleTimeString();
    const newData = {
      timestamp,
      ...data,
    };

    chartData.value.push(newData);

    // 限制图表数据长度，只保留最近60个数据点
    if (chartData.value.length > 60) {
      chartData.value.shift();
    }
  };

  const setSelectedPipeline = (pipeline) => {
    selectedPipeline.value = pipeline;
  };

  const setSelectedFlange = (flange) => {
    selectedFlange.value = flange;
  };

  const exportDataToCSV = () => {
    if (historyData.value.length === 0) {
      return null;
    }

    // CSV表头
    const headers = [
      "时间戳",
      "管线",
      "法兰",
      "传感器1",
      "传感器2",
      "传感器3",
      "传感器4",
      "传感器5",
      "传感器6",
      "传感器7",
      "传感器8",
      "传感器9",
      "传感器10",
      "传感器11",
      "传感器12",
    ];

    // 转换数据为CSV行
    const rows = historyData.value.map((item) => {
      return [
        item.timestamp,
        item.pipeline,
        item.flange,
        item.data.sensor1 || 0,
        item.data.sensor2 || 0,
        item.data.sensor3 || 0,
        item.data.sensor4 || 0,
        item.data.sensor5 || 0,
        item.data.sensor6 || 0,
        item.data.sensor7 || 0,
        item.data.sensor8 || 0,
        item.data.sensor9 || 0,
        item.data.sensor10 || 0,
        item.data.sensor11 || 0,
        item.data.sensor12 || 0,
      ];
    });

    // 组合表头和数据
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    // 创建Blob对象
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // 创建下载链接
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `传感器数据_${new Date().toISOString().slice(0, 19).replace(/[-:]/g, "")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    sensorData,
    selectedPipeline,
    selectedFlange,
    historyData,
    chartData,
    getSensorValue,
    updateSensorData,
    setSelectedPipeline,
    setSelectedFlange,
    exportDataToCSV,
  };
});
