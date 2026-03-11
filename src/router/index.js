import { createRouter, createWebHashHistory } from "vue-router";

import MonitoringInterface from "@/views/MonitoringInterface.vue";
import Setting from "@/views/Setting.vue";
import History from "@/views/History.vue";
import ExportData from "@/views/ExportData.vue";
import CalibrateSensor from "@/views/CalibrateSensor.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/monitoring-interface", component: MonitoringInterface },
    { path: "/setting", component: Setting },
    { path: "/history", component: History },
    { path: "/export-data", component: ExportData },
    { path: "/calibrate-sensor", component: CalibrateSensor },
  ],
});

export default router;
