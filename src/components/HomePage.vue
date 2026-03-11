<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const enterMonitoring = () => {
  router.push("/monitoring-interface");
};

const enterSettings = () => {
  router.push("/setting");
};

const enterHistory = () => {
  router.push("/history");
};
</script>

<template>
  <div>
    <main class="main-grid">
      <!-- 实时监控功能卡片 -->
      <div class="feature-card" @click="enterMonitoring()">
        <!-- 点击卡片触发监控页面跳转 -->
        <div class="card-icon">📊</div>
        <!-- 卡片图标 -->
        <h2 class="card-title">实时监控</h2>
        <!-- 卡片标题 -->
        <p class="card-description">
          <!-- 卡片描述 -->
          实时监控压力数据，智能仪表盘显示，直观展示传感器状态和报警信息
        </p>
        <!-- 功能列表 -->
        <ul class="card-features">
          <li>实时压力数值显示</li>
          <li>直观仪表盘界面</li>
          <li>压力趋势折线图</li>
          <li>智能报警提示</li>
          <li>系统参数监控</li>
        </ul>
        <button class="enter-btn" @click.stop="enterMonitoring()">进入监控</button>
        <!-- 进入按钮 -->
      </div>

      <!-- 参数设置功能卡片 -->
      <div class="feature-card" @click="enterSettings()">
        <!-- 点击卡片触发设置页面跳转 -->
        <div class="card-icon">⚙️</div>
        <!-- 卡片图标 -->
        <h2 class="card-title">参数设置</h2>
        <!-- 卡片标题 -->
        <p class="card-description">
          <!-- 卡片描述 -->
          灵活配置传感器参数，包括采样频率、报警阈值、串口通信等关键设置
        </p>
        <!-- 功能列表 -->
        <ul class="card-features">
          <li>采样频率配置</li>
          <li>报警上下阈值设置</li>
          <li>串口参数配置</li>
          <li>传感器校准</li>
          <li>一键恢复默认</li>
        </ul>
        <button class="enter-btn" @click.stop="enterSettings()">进入设置</button>
        <!-- 进入按钮 -->
      </div>

      <!-- 历史数据功能卡片 -->
      <div class="feature-card" @click="enterHistory()">
        <!-- 点击卡片触发历史数据页面跳转 -->
        <div class="card-icon">📈</div>
        <!-- 卡片图标 -->
        <h2 class="card-title">历史数据</h2>
        <!-- 卡片标题 -->
        <p class="card-description">
          <!-- 卡片描述 -->
          查询历史压力数据，支持时间筛选、数据导出和趋势分析功能
        </p>
        <!-- 功能列表 -->
        <ul class="card-features">
          <li>时间范围筛选</li>
          <li>历史数据表格</li>
          <li>趋势图表分析</li>
          <li>数据统计展示</li>
          <li>Excel数据导出</li>
        </ul>
        <button class="enter-btn" @click.stop="enterHistory()">查看历史</button>
        <!-- 进入按钮 -->
      </div>
    </main>

    <!-- 页脚：显示系统信息、技术规格和应用场景 -->
    <footer class="footer">
      <div class="footer-content">
        <!-- 系统特点 -->
        <div class="footer-section">
          <h4>系统特点</h4>
          <ul>
            <li>实时数据采集与监控</li>
            <li>智能报警与阈值控制</li>
            <li>历史数据查询分析</li>
            <li>灵活的参数配置</li>
          </ul>
        </div>

        <!-- 技术规格 -->
        <div class="footer-section">
          <h4>技术规格</h4>
          <ul>
            <li>采样频率: 10Hz - 1000Hz</li>
            <li>压力范围: 0-1000 kPa</li>
            <li>通信接口: RS485/USB</li>
            <li>精度等级: ±0.1% FS</li>
          </ul>
        </div>

        <!-- 应用场景 -->
        <div class="footer-section">
          <h4>应用场景</h4>
          <ul>
            <li>工业压力监测</li>
            <li>管道压力监控</li>
            <li>液压系统监测</li>
            <li>实验室压力测试</li>
          </ul>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="copyright">© 2026 智能压力传感器监控系统 | 版本 v0.4.7 | 技术支持: HX711系列</div>
    </footer>
  </div>
</template>

<style scoped>
.main-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.feature-card {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  animation: fadeInUp 0.6s ease forwards;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.feature-card:nth-child(1) {
  animation-delay: 0.1s;
}

.feature-card:nth-child(2) {
  animation-delay: 0.2s;
}

.feature-card:nth-child(3) {
  animation-delay: 0.3s;
}

.feature-card:nth-child(4) {
  animation-delay: 0.4s;
}

.feature-card:nth-child(5) {
  animation-delay: 0.5s;
}

.card-icon {
  display: flex;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 15px;
}

.card-description {
  color: #6c757d;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 25px;
}

.card-features {
  margin-bottom: 25px;
}

.card-features li {
  padding: 8px 0;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-features li::before {
  display: flex;
  content: "✓";
  color: #28a745;
  font-weight: bold;
  width: 20px;
  height: 20px;
  background: rgba(40, 167, 69, 0.1);
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.enter-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.enter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.footer-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 16px;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}

.copyright {
  border-top: 1px solid #e9ecef;
  padding-top: 15px;
  color: #6c757d;
  font-size: 14px;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .main-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .feature-card {
    padding: 25px;
  }

  .card-icon {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }

  .card-title {
    font-size: 20px;
  }

  .card-description {
    font-size: 14px;
  }

  .footer {
    padding: 20px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .feature-card {
    padding: 20px;
  }

  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
