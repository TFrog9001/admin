<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import Chart from "chart.js/auto";

// Nhận props
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

// Tham chiếu đến phần tử canvas
const chartCanvas = ref(null);
let chartInstance = null;

// Hàm render biểu đồ
const renderChart = () => {
  if (!chartCanvas.value) {
    console.warn("Canvas element chưa sẵn sàng.");
    return;
  }

  if (!Array.isArray(props.data) || props.data.length === 0) {
    console.warn("Dữ liệu truyền vào LineChart không hợp lệ hoặc trống.");
    return;
  }

  // Xử lý dữ liệu: labels và counts
  const labels = props.data.map((item) => `Ngày ${item.day}`);
  const counts = props.data.map((item) => item.count);

  // Nếu biểu đồ đã tồn tại, cập nhật dữ liệu
  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = counts;
    chartInstance.update();
  } else {
    // Nếu chưa có biểu đồ, tạo mới
    const ctx = chartCanvas.value.getContext("2d");
    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Số Lượng Đặt Sân",
            data: counts,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.raw.toLocaleString()} lượt`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Ngày",
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Số lượt đặt sân",
            },
            ticks: {
              callback: (value) => `${value.toLocaleString()} lượt`,
            },
          },
        },
      },
    });
  }
};

onMounted(() => {
  console.log("Mounted props.data:", props.data);
  renderChart(); // Gọi renderChart khi DOM đã sẵn sàng
});

watch(
  () => props.data,
  (newData) => {
    console.log("Updated props.data:", newData);
    renderChart();
  },
  { immediate: true }
);

// Dọn dẹp biểu đồ khi component bị hủy
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: 258px;
}
</style>
