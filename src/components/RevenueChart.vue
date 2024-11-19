<template>
  <div>
    <div style="margin-bottom: 20px">
      <label for="yearSelect">Chọn năm: </label>
      <select id="yearSelect" v-model="selectedYear" @change="updateChart">
        <option v-for="year in availableYears" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>
    <canvas id="revenueChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";
import revenueService from "../services/revenueService";

// Danh sách năm từ 2022 đến năm hiện tại
const currentYear = new Date().getFullYear();
const availableYears = Array.from(
  { length: currentYear - 2022 + 1 },
  (_, i) => 2022 + i
);

const selectedYear = ref(currentYear); // Năm mặc định là năm hiện tại
let chartInstance = null; // Lưu instance của biểu đồ để cập nhật

// Hàm lấy dữ liệu và render biểu đồ
const fetchAndRenderChart = async (year) => {
  try {
    // Gọi API để lấy dữ liệu
    const response = await revenueService.fetchYearlyRevenue(year);
    console.log(response);
    
    const monthlyData = response.monthly_revenue;

    // Chuẩn bị dữ liệu cho biểu đồ
    const labels = monthlyData.map((item) => `Tháng ${item.month}`);
    const revenueFromFields = monthlyData.map((item) =>
      parseFloat(item.revenue_from_fields)
    );
    const revenueFromServices = monthlyData.map((item) =>
      parseFloat(item.revenue_from_services)
    );
    const revenueFromSupplies = monthlyData.map((item) =>
      parseFloat(item.revenue_from_supplies)
    );

    // Nếu biểu đồ đã tồn tại, cập nhật dữ liệu
    if (chartInstance) {
      chartInstance.data.labels = labels;
      chartInstance.data.datasets[0].data = revenueFromFields;
      chartInstance.data.datasets[1].data = revenueFromServices;
      chartInstance.data.datasets[2].data = revenueFromSupplies;
      chartInstance.update();
    } else {
      // Tạo biểu đồ mới
      const ctx = document.getElementById("revenueChart").getContext("2d");
      chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Doanh thu từ sân bóng",
              data: revenueFromFields,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
            {
              label: "Doanh thu từ dịch vụ",
              data: revenueFromServices,
              backgroundColor: "rgba(255, 99, 132, 0.6)",
            },
            {
              label: "Doanh thu từ vật tư",
              data: revenueFromSupplies,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: (context) =>
                  `${
                    context.dataset.label
                  }: ${context.raw.toLocaleString()} VND`,
              },
            },
          },
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: {
                callback: (value) => `${value.toLocaleString()} VND`,
              },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
  }
};

// Hàm cập nhật biểu đồ khi năm được chọn thay đổi
const updateChart = () => {
  fetchAndRenderChart(selectedYear.value);
};

// Khi component được mount, tải biểu đồ cho năm hiện tại
onMounted(() => {
  fetchAndRenderChart(selectedYear.value);
});
</script>

<style>
canvas {
  max-width: 100%;
  height: auto;
}
</style>
