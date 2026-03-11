function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  document.getElementById("currentTime").textContent = timeString;
}

function enterMonitoring() {
  window.location.href = "智能压力传感器监控界面.html";
}

function enterSettings() {
  window.location.href = "智能压力传感器设置页面.html";
}

function enterHistory() {
  window.location.href = "智能压力传感器历史数据页面.html";
}

function goBack() {
  if (confirm("确定要返回监控页面吗？")) {
    window.location.href = "智能压力传感器监控界面.html";
  }
}

// 初始化
document.addEventListener("DOMContentLoaded", function () {
  updateTime();
  setInterval(updateTime, 1000);
});
