<template>
  <div class="container-fluid">
    <!-- Tiêu đề -->
    <h1 class="text-center my-4 display-6">Thống Kê Sân Bóng</h1>

    <!-- Hàng thống kê tổng quan -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="stat-box p-3 text-center shadow-sm">
          <p class="fw-bold">Tổng Đặt Sân</p>
          <h2 class="text-primary">{{ statistics.total_bookings || 0 }}</h2>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-box p-3 text-center shadow-sm">
          <p class="fw-bold">Doanh Thu</p>
          <h2 class="text-primary">
            {{ formatCurrency(totalRevenue || 0) }}
          </h2>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-box p-3 text-center shadow-sm">
          <p class="fw-bold">Khách Hàng Mới</p>
          <h2 class="text-primary">{{ statistics.new_customers || 0 }}</h2>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-box p-3 text-center shadow-sm">
          <p class="fw-bold">Sân Phổ Biến Nhất</p>
          <h2 class="text-primary">
            {{ statistics.most_popular_field || "N/A" }}
          </h2>
        </div>
      </div>
    </div>

    <!-- Hàng biểu đồ và bảng -->
    <div class="row g-4">
      <!-- Biểu đồ số lượng đặt sân theo ngày -->
      <div class="col-md-6">
        <div class="card p-3 shadow-sm">
          <h5 class="text-center">Số Lượng Đặt Sân Theo Ngày</h5>
          <div v-if="statistics.daily_bookings.length > 0">
            <LineChart :data="statistics.daily_bookings" />
          </div>
          <p v-else class="text-muted text-center">
            Đang tải dữ liệu biểu đồ...
          </p>
        </div>
      </div>

      <!-- Bảng đặt sân gần đây -->
      <div class="col-md-6">
        <div class="card p-3 shadow-sm">
          <h5 class="text-center">Đặt Sân Gần Đây</h5>
          <table class="table table-bordered table-hover">
            <thead class="table-light">
              <tr>
                <th>Sân</th>
                <th>Khách Hàng</th>
                <th>Thời Gian</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="booking in statistics.recent_bookings"
                :key="booking.date + booking.start_time"
              >
                <td>{{ booking.field_name }}</td>
                <td>{{ booking.customer_name }}</td>
                <td>{{ booking.start_time }} - {{ booking.end_time }}</td>
                <td>{{ booking.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Hàng biểu đồ doanh thu -->
    <div class="row g-4 mt-1">
      <div class="col-md-12">
        <div class="card p-3 shadow-sm">
          <h5 class="text-center">Biểu Đồ Doanh Thu</h5>
          <RevenueChart @update:totalRevenue="handleTotalRevenueUpdate" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import LineChart from "../components/LineChart.vue";
import RevenueChart from "../components/RevenueChart.vue";

const totalRevenue = ref(0); // Dữ liệu tổng doanh thu

// Lắng nghe sự kiện 'update:totalRevenue' từ RevenueChart
const handleTotalRevenueUpdate = (newTotalRevenue) => {
  totalRevenue.value = newTotalRevenue; // Cập nhật tổng doanh thu
};

// Component
const statistics = ref({
  total_bookings: 0,
  total_revenue: 0,
  new_customers: 0,
  most_popular_field: "N/A",
  daily_bookings: [],
  recent_bookings: [],
});

// Hàm format tiền tệ
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// Hàm lấy dữ liệu thống kê từ API
const fetchStatistics = async () => {
  try {
    const response = await axios.get("/api/revenue/statistics", {
      params: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      },
    });
    statistics.value = response.data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu thống kê:", error);
    // Dữ liệu mặc định khi gặp lỗi
    statistics.value = {
      total_bookings: 0,
      total_revenue: 0,
      new_customers: 0,
      most_popular_field: "N/A",
      daily_bookings: [],
      recent_bookings: [],
    };
  }
};

// Tự động lấy dữ liệu khi component được mount
onMounted(() => {
  fetchStatistics();
});
</script>

<style scoped>
/* Kiểu dáng tùy chỉnh */
.stat-box {
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card {
  border-radius: 8px;
}

.table {
  font-size: 0.95rem;
}

h1 {
  font-weight: bold;
}
</style>
