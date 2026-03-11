function validateInputs() {
  const lowerThreshold = document.getElementById("lowerThreshold").value;
  const upperThreshold = document.getElementById("upperThreshold").value;

  // 清除错误状态
  document.getElementById("lowerThreshold").classList.remove("error");
  document.getElementById("upperThreshold").classList.remove("error");

  let isValid = true;

  if (parseFloat(lowerThreshold) >= parseFloat(upperThreshold)) {
    document.getElementById("lowerThreshold").classList.add("error");
    document.getElementById("upperThreshold").classList.add("error");
    showMessage("下限阈值必须小于上限阈值", "error");
    isValid = false;
  }

  return isValid;
}

function showMessage(message, type) {
  const statusMessage = document.getElementById("statusMessage");
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type} show`;

  setTimeout(() => {
    statusMessage.classList.remove("show");
  }, 3000);
}

function saveSettings() {
  if (!validateInputs()) {
    return;
  }

  const settings = {
    design_pressure: document.getElementById("upperThreshold").value,
    noise_level: 0.1,
  };

  // 发送设置到后端API
  fetch("http://localhost:8000/api/system/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  })
    .then((response) => response.json())
    .then((data) => {
      showMessage("✅ 设置已保存成功！", "success");
    })
    .catch((error) => {
      console.error("保存设置失败:", error);
      showMessage("❌ 设置保存失败，请重试！", "error");
    });
}

function resetToDefault() {
  if (confirm("确定要恢复默认设置吗？这将清除所有自定义配置。")) {
    document.getElementById("samplingRate").value = "100";
    document.getElementById("lowerThreshold").value = "50";
    document.getElementById("upperThreshold").value = "200";
    document.getElementById("baudRate").value = "115200";
    document.getElementById("dataBits").value = "8";
    document.getElementById("stopBits").value = "1";
    document.getElementById("parity").value = "none";
    document.getElementById("fullScaleCalibration").value = "300.0";

    showMessage("🔄 已恢复默认设置", "success");
  }
}

// 页面加载时的初始化
document.addEventListener("DOMContentLoaded", function () {
  updateTime();
  setInterval(updateTime, 1000);

  // 添加输入验证监听器
  document
    .getElementById("lowerThreshold")
    .addEventListener("input", validateInputs);
  document
    .getElementById("upperThreshold")
    .addEventListener("input", validateInputs);
});
