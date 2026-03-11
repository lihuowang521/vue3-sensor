//等情况

let currentPage = 1;
let totalPages = 1;
let currentData = [];

function setQuickFilter(period) {
  // 清除所有活动状态
  Array.from(document.getElementsByClassName("quick-filter-btn")).forEach(
    function (btn) {
      btn.classList.remove("active");
    }
  );

  // 设置当前按钮为活动状态
  event.target.classList.add("active");

  const now = new Date();
  let startTime = new Date();

  switch (period) {
    case "1h":
      startTime.setHours(now.getHours() - 1);
      break;
    case "6h":
      startTime.setHours(now.getHours() - 6);
      break;
    case "24h":
      startTime.setDate(now.getDate() - 1);
      break;
    case "7d":
      startTime.setDate(now.getDate() - 7);
      break;
    case "30d":
      startTime.setDate(now.getDate() - 30);
      break;
  }

  // 格式化时间为datetime-local输入框格式
  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  document.getElementById("startTime").value = formatDateTime(startTime);
  document.getElementById("endTime").value = formatDateTime(now);
}

function queryData() {
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  if (!startTime || !endTime) {
    alert("请选择开始时间和结束时间");
    return;
  }

  if (new Date(startTime) >= new Date(endTime)) {
    alert("开始时间必须早于结束时间");
    return;
  }

  showLoading();

  // 从后端API获取历史数据
  fetch("http://localhost:8000/api/history/data")
    .then((response) => response.json())
    .then((data) => {
      // 处理数据
      currentData = data.data.map((item) => {
        const pressure = item.pressure;
        let status;
        if (pressure > 1.5 || pressure < 0.5) {
          status = "alarm";
        } else if (pressure > 1.3 || pressure < 0.7) {
          status = "warning";
        } else {
          status = "normal";
        }

        return {
          time: new Date(item.timestamp).toLocaleString("zh-CN"),
          pressure: pressure.toFixed(2),
          status: status,
          frequency: "100 Hz",
          device: "正常",
        };
      });

      totalPages = Math.ceil(currentData.length / 20);
      currentPage = 1;
      displayData();
      displayChart();
      hideLoading();
    })
    .catch((error) => {
      console.error("获取历史数据失败:", error);
      hideLoading();
      showNoData();
    });
}

function generateMockData() {
  currentData = [];
  const startTime = new Date(document.getElementById("startTime").value);
  const endTime = new Date(document.getElementById("endTime").value);
  const timeDiff = endTime - startTime;
  const hours = timeDiff / (1000 * 60 * 60);
  const dataPoints = Math.min(Math.floor(hours * 10), 100); // 最多100个数据点

  for (let i = 0; i < dataPoints; i++) {
    const timestamp = new Date(
      startTime.getTime() + (timeDiff / dataPoints) * i
    );
    const pressure = 120 + Math.random() * 60 - 30; // 90-150 kPa

    let status;
    if (pressure > 200 || pressure < 50) {
      status = "alarm";
    } else if (pressure > 180 || pressure < 70) {
      status = "warning";
    } else {
      status = "normal";
    }

    currentData.push({
      time: timestamp.toLocaleString("zh-CN"),
      pressure: pressure.toFixed(1),
      status: status,
      frequency: "100 Hz",
      device: "正常",
    });
  }

  totalPages = Math.ceil(currentData.length / 20);
  currentPage = 1;
  displayData();
  displayChart();
}

function displayData() {
  const tableBody = document.getElementById("dataTableBody");
  const startIndex = (currentPage - 1) * 20;
  const endIndex = Math.min(startIndex + 20, currentData.length);
  const pageData = currentData.slice(startIndex, endIndex);

  tableBody.innerHTML = "";

  pageData.forEach((row) => {
    const statusClass = `status-${row.status}`;
    const statusText = {
      normal: "正常",
      warning: "警告",
      alarm: "报警",
    }[row.status];

    const statusColor = {
      normal: "#28a745",
      warning: "#ffc107",
      alarm: "#dc3545",
    }[row.status];

    tableBody.innerHTML += `
                    <tr>
                        <td>${row.time}</td>
                        <td>${row.pressure}</td>
                        <td><span class="${statusClass}" style="color: ${statusColor}">${statusText}</span></td>
                        <td>${row.frequency}</td>
                        <td>${row.device}</td>
                    </tr>
                `;
  });

  document.getElementById(
    "pageInfo"
  ).textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
  document.getElementById("prevBtn").disabled = currentPage <= 1;
  document.getElementById("nextBtn").disabled = currentPage >= totalPages;
}

function displayChart() {
  const chartContainer = document.getElementById("chartContainer");

  if (currentData.length === 0) {
    chartContainer.innerHTML = `
                    <div class="chart-placeholder">
                        📊 压力趋势折线图<br>
                        <small>选择时间范围后显示数据</small>
                    </div>
                `;
    return;
  }

  // 简化的图表显示
  const maxPressure = Math.max(
    ...currentData.map((d) => parseFloat(d.pressure))
  );
  const minPressure = Math.min(
    ...currentData.map((d) => parseFloat(d.pressure))
  );
  const avgPressure =
    currentData.reduce((sum, d) => sum + parseFloat(d.pressure), 0) /
    currentData.length;

  chartContainer.innerHTML = `
                <div style="text-align: center;">
                    <h3>数据统计 (${currentData.length} 个数据点)</h3>
                    <div style="margin: 20px 0;">
                        <div style="display: inline-block; margin: 0 20px;">
                            <div style="font-size: 24px; color: #e74c3c; font-weight: bold;">${maxPressure.toFixed(
                              1
                            )}</div>
                            <div style="font-size: 12px; color: #6c757d;">最大值 (kPa)</div>
                        </div>
                        <div style="display: inline-block; margin: 0 20px;">
                            <div style="font-size: 24px; color: #667eea; font-weight: bold;">${avgPressure.toFixed(
                              1
                            )}</div>
                            <div style="font-size: 12px; color: #6c757d;">平均值 (kPa)</div>
                        </div>
                        <div style="display: inline-block; margin: 0 20px;">
                            <div style="font-size: 24px; color: #27ae60; font-weight: bold;">${minPressure.toFixed(
                              1
                            )}</div>
                            <div style="font-size: 12px; color: #6c757d;">最小值 (kPa)</div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(90deg, #27ae60, #f39c12, #e74c3c); height: 20px; border-radius: 10px; margin: 20px auto; max-width: 300px; position: relative;">
                        <div style="position: absolute; left: 50%; top: -25px; transform: translateX(-50%); 
                                    width: 2px; height: 30px; background: #333;"></div>
                        <div style="position: absolute; right: 0; top: -25px; font-size: 12px;">${maxPressure.toFixed(
                          0
                        )}</div>
                        <div style="position: absolute; left: 0; top: -25px; font-size: 12px;">${minPressure.toFixed(
                          0
                        )}</div>
                        <div style="position: absolute; left: 50%; top: -45px; transform: translateX(-50%); 
                                    font-size: 12px; background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #ccc;">
                            ${avgPressure.toFixed(1)} kPa
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #6c757d; margin-top: 10px;">
                        压力范围: ${minPressure.toFixed(
                          1
                        )} - ${maxPressure.toFixed(1)} kPa
                    </div>
                </div>
            `;
}

function changePage(direction) {
  if (direction === "prev" && currentPage > 1) {
    currentPage--;
  } else if (direction === "next" && currentPage < totalPages) {
    currentPage++;
  }
  displayData();
}

function exportToExcel() {
  if (currentData.length === 0) {
    alert("没有数据可导出");
    return;
  }

  // 创建CSV格式的数据
  let csvContent = "时间,压力值(kPa),状态,采样频率,设备状态\n";

  currentData.forEach((row) => {
    const statusText = {
      normal: "正常",
      warning: "警告",
      alarm: "报警",
    }[row.status];
    csvContent += `${row.time},${row.pressure},${statusText},${row.frequency},${row.device}\n`;
  });

  // 下载文件
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `压力传感器历史数据_${new Date().toISOString().slice(0, 10)}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link); // 临时添加到DOM，触发下载的必要步骤
  link.click(); // 触发下载
  document.body.removeChild(link); // 清理临时元素
}

//上面的代码要移动到home.js

function showLoading() {
  document.getElementById("loading").classList.add("show");
  document.getElementById("dataTableContainer").style.display = "none";
  document.getElementById("noData").style.display = "none";
  document.getElementById("pagination").style.display = "none";
}

function hideLoading() {
  document.getElementById("loading").classList.remove("show");

  if (currentData.length === 0) {
    document.getElementById("noData").style.display = "block";
  } else {
    document.getElementById("dataTableContainer").style.display = "block";
    document.getElementById("pagination").style.display = "flex";
    displayData();
  }
}

// 初始化
document.addEventListener("DOMContentLoaded", function () {
  updateTime();
  setInterval(updateTime, 1000);

  // 设置默认时间为最近1小时
  setQuickFilter("1h");
});
