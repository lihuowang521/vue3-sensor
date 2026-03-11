// //正常节点的获取
// var chart_container = document.getElementById("chart-container");
// //将节点转化为echarts的对象节点
// var chart_container_myChart = echarts.init(chart_container);
// //数据的配置
// var chart_container_option = {
//   // 大标题
//   title: {
//     text: "压力趋势图",
//     left: "center",
//   },
//   // 提示框
//   tooltip: {
//     trigger: "压力",
//     formatter: function (params) {
//       return params[0].name + "<br/>压力: " + params[0].value + " kPa";
//     },
//   },
//   // x轴
//   xAxis: {
//     type: "category",
//     data: [],
//     axisLabel: {
//       rotate: 45,
//     },
//   },
//   yAxis: {
//     type: "value",
//     name: "压力 (kPa)",
//     min: 60,
//     max: 200,
//   },
//   series: [
//     {
//       data: [130, 152, 153, 154, 155, 156, 89],
//       type: "line", // 折线图
//       smooth: true,
//       symbol: "circle",
//       symbolSize: 6,
//       lineStyle: {
//         width: 3,
//         color: "#1890ff",
//       },
//       itemStyle: {
//         color: "#1890ff",
//       },
//       areaStyle: {
//         color: {
//           type: "linear",
//           x: 0,
//           y: 0,
//           x2: 0,
//           y2: 1,
//           colorStops: [
//             {
//               offset: 0,
//               color: "rgba(24, 144, 255, 0.3)",
//             },
//             {
//               offset: 1,
//               color: "rgba(24, 144, 255, 0.1)",
//             },
//           ],
//         },
//       },
//     },
//   ],
// };

// // 数据和节点进行结合
// chart_container_option &&
//   chart_container_myChart.setOption(chart_container_option);

/* 更新图表数据函数 */
function updateChart() {
  // 获取选中的传感器
  const selectedSensor = document.getElementById("sensor-select").value;
  const sensorIndex = selectedSensor.replace("sensor", "") - 1;

  // 从后端API获取历史数据
  fetch(`http://localhost:8000/api/history/pressure?sensor=${sensorIndex + 1}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.timestamps && data.values) {
        // 更新图表数据
        chart_container_option.xAxis.data = data.timestamps;
        chart_container_option.series[0].data = data.values;
        chart_container_myChart.setOption(chart_container_option);
      }
    })
    .catch((error) => {
      console.error("获取历史数据失败:", error);
    });
}

// 绑定传感器选择事件
document
  .getElementById("sensor-select")
  .addEventListener("change", updateChart);

/* 更新压力数据函数 */
/* 从后端API获取实时压力数据并更新到界面，同时检查报警状态 */
function updatePressure() {
  // 获取页面中显示压力值的元素
  const alertArea = document.querySelector("#alertArea");

  // 从后端API获取实时压力数据
  fetch("http://localhost:8000/api/realtime/pressure")
    .then((response) => response.json()) // 解析JSON响应
    .then((data) => {
      // 检查数据格式
      if (data.sensors && Array.isArray(data.sensors)) {
        // 更新12个传感器的数据
        data.sensors.forEach((sensor, index) => {
          const sensorId = `sensor${index + 1}`;
          const sensorElement = document.getElementById(sensorId);
          if (sensorElement) {
            sensorElement.textContent = `${sensor.value.toFixed(2)} kPa`;

            // 根据压力值设置不同的颜色
            if (sensor.value > 150) {
              sensorElement.style.color = "#ff4d4f";
            } else if (sensor.value < 80) {
              sensorElement.style.color = "#1890ff";
            } else {
              sensorElement.style.color = "#52c41a";
            }
          }
        });
      }

      // 检查是否需要报警
      if (data.is_warning) {
        alertArea.classList.add("show"); // 显示报警区域
        // 更新报警信息内容
        alertArea.innerHTML = `<strong>⚠️ ${data.risk_level || "压力"}风险</strong><br>当前压力: ${data.pressure?.toFixed(2) || "未知"} ${data.unit || "kPa"}<br>偏差: ${data.deviation_percent || "0"}%`;
      } else {
        alertArea.classList.remove("show"); // 隐藏报警区域
      }
    })
    .catch((error) => {
      console.error("获取压力数据失败:", error); // 捕获并记录错误

      // 显示错误信息
      const alertArea = document.getElementById("alertArea");
      if (alertArea) {
        alertArea.classList.add("show");
        alertArea.innerHTML = `<strong>⚠️ 数据获取失败</strong><br>无法连接到后端服务器，请检查网络连接`;
      }
    });
}

/* 导出数据函数 */
/* 将当前压力数据导出为CSV文件 */
function exportData() {
  // 收集当前数据
  const currentData = {
    timestamp: new Date().toLocaleString("zh-CN"), // 当前时间
    pressure: document.getElementById("pressureValue").textContent, // 当前压力值
    device: "PS-2000", // 设备型号
    status: "正常", // 设备状态
  };

  // 创建CSV内容
  let csvContent = "时间,压力值(kPa),设备状态\n";
  csvContent += `${currentData.timestamp},${currentData.pressure},${currentData.status}\n`;

  // 创建Blob对象并下载
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  // 设置文件名（包含当前日期）
  link.setAttribute(
    "download",
    `压力传感器实时数据_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link); // 临时添加到DOM，触发下载的必要步骤
  link.click(); // 触发下载
  document.body.removeChild(link); // 清理临时元素
}

//上面的代码要移动到home.js
//下面的可能也要

/* 传感器校准函数 */
/* 模拟传感器零点校准功能 */
function calibrateSensor() {
  // 弹出确认对话框
  if (confirm("确定要对传感器进行零点校准吗？\n这将重置当前的零点偏移值。")) {
    // 生成模拟的零点偏移值（-1到1之间的随机数）
    const zeroValue = (Math.random() * 2 - 1).toFixed(2);
    // 更新页面上的压力值显示
    document.getElementById("pressureValue").textContent = zeroValue;
    document.getElementById("gaugeValue").textContent = zeroValue;
    // 显示校准完成提示
    alert(`✅ 传感器校准完成！\n新的零点偏移值: ${zeroValue} kPa`);
  }
}

/* 更新系统参数函数 */
function updateSystemParams() {
  fetch("http://localhost:8000/api/system/params")
    .then((response) => response.json())
    .then((data) => {
      // 更新系统参数
      const paramsGrid = document.querySelector(".parameters-grid");
      if (paramsGrid) {
        if (data.sampling_rate) {
          const samplingRateItem = paramsGrid.querySelector(
            ".param-item:nth-child(1) .param-value",
          );
          if (samplingRateItem) {
            samplingRateItem.textContent = `${data.sampling_rate} Hz`;
          }
        }

        if (data.alarm_upper_limit) {
          const alarmUpperItem = paramsGrid.querySelector(
            ".param-item:nth-child(2) .param-value",
          );
          if (alarmUpperItem) {
            alarmUpperItem.textContent = `${data.alarm_upper_limit} kPa`;
          }
        }

        if (data.alarm_lower_limit) {
          const alarmLowerItem = paramsGrid.querySelector(
            ".param-item:nth-child(3) .param-value",
          );
          if (alarmLowerItem) {
            alarmLowerItem.textContent = `${data.alarm_lower_limit} kPa`;
          }
        }

        if (data.baud_rate) {
          const baudRateItem = paramsGrid.querySelector(
            ".param-item:nth-child(4) .param-value",
          );
          if (baudRateItem) {
            baudRateItem.textContent = data.baud_rate;
          }
        }
      }
    })
    .catch((error) => {
      console.error("获取系统参数失败:", error);
    });
}

const app = new Vue({
  el: "#app",
  data: {
    pressureValue: "0.0",
    gaugeValue: "0.0",
    timestamp: "0000-00-00 00:00:00",
    chartData: [],
    chartTime: [],
  },
  mounted() {
    // // 页面加载时立即更新一次压力数据
    // updatePressure();
    this.myChart = echarts.init(document.querySelector("#chart-container"));
    // 配置图表选项
    this.myChart.setOption(
      (Option = {
        xAxis: {
          type: "category",
          data: this.chartTime,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.chartData,
            type: "line",
          },
        ],
      }),
    );
  },
});

/* 页面初始化 */
updateTime(); // 立即更新一次时间
updatePressure(); // 立即更新一次压力数据
updateChart(); // 立即更新一次图表数据
updateSystemParams(); // 立即更新一次系统参数

setInterval(updateTime, 1000); // 每秒更新一次时间
setInterval(updatePressure, 2000); // 每2秒更新一次压力数据
setInterval(updateChart, 5000); // 每5秒更新一次图表数据
setInterval(updateSystemParams, 10000); // 每10秒更新一次系统参数

// 窗口大小改变时重新初始化图表
window.addEventListener("resize", function () {
  chart_container_myChart.resize();
});
