<template>
  <div class="container-fluid my-5">
    <!-- Tổng quan -->
    <div class="row" v-if="dataLoaded">
      <div class="col-12">
        <h2 class="text-center">Thống kê doanh thu {{ time }}</h2>
        <div class="row my-3">
          <div class="col-md-4">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">Tổng Doanh thu</h5>
                <p class="card-text">{{ currency(totalRevenue) }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">Tổng COGS</h5>
                <p class="card-text">{{ currency(totalCOGS) }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">Lợi nhuận từ Sản phẩm</h5>
                <p class="card-text">{{ currency(profitSupply) }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">Lợi nhuận từ Dịch vụ</h5>
                <p class="card-text">{{ currency(profitService) }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">Lợi nhuận từ Phí sân</h5>
                <p class="card-text">{{ currency(profitCourtFee) }}</p>
              </div>
            </div>
          </div>
          <!-- Lợi nhuận từ Tiền cọc của đơn hủy -->
          <div class="col-md-4">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">Lợi nhuận từ Tiền cọc (Đơn hủy)</h5>
                <p class="card-text">{{ currency(profitDepositCanceled) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <!-- Danh sách sản phẩm -->
        <div class="card p-3 shadow-sm">
          <h3 class="my-4">Danh sách Sản phẩm</h3>
          <table class="table table-bordered table-hover" v-if="dataLoaded">
            <thead class="table-light">
              <tr>
                <th>Tên Sản phẩm</th>
                <th>Số lượng bán</th>
                <th>Doanh thu</th>
                <th>Giá vốn</th>
                <th>Lợi nhuận</th>
                <th>Tồn kho hiện tại</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="supply in supplies" :key="supply.supply_id">
                <td>{{ supply.supply_name }}</td>
                <td>{{ supply.total_sold_quantity }}</td>
                <td>{{ currency(supply.total_sold_amount) }}</td>
                <td>{{ currency(supply.fifo_cost) }}</td>
                <td>{{ currency(supply.profit) }}</td>
                <td>{{ supply.current_stock }}</td>
              </tr>
            </tbody>
          </table>
          <!-- Loader khi dữ liệu đang tải -->
          <div v-else class="text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col">
        <!-- Danh sách dịch vụ -->
        <div class="card p-3 shadow-sm">
          <h3 class="my-4">Danh sách Dịch vụ</h3>
          <table class="table table-bordered table-hover" v-if="dataLoaded">
            <thead class="table-light">
              <tr>
                <th>Tên Dịch vụ</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(service, serviceId) in services" :key="serviceId">
                <td>{{ service.service_name }}</td>
                <td>{{ currency(service.total_revenue) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Loader khi dữ liệu đang tải -->
          <div v-else class="text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../axios/api";
import { useRoute } from "vue-router";

const route = useRoute();
const time = route.query.time;

// Dữ liệu trạng thái
const dataLoaded = ref(false);
const totalRevenue = ref(0);
const totalCOGS = ref(0);
const profitSupply = ref(0);
const profitService = ref(0);
const profitCourtFee = ref(0);
const profitDepositCanceled = ref(0);
const supplies = ref([]);
const services = ref({});

// Gọi API khi component được mounted
onMounted(() => {
  api
    .get(`revenue?time=${time}`)
    .then((response) => {
      const data = response.data;

      // Cập nhật dữ liệu từ API
      totalRevenue.value = data.total_revenue;
      totalCOGS.value = data.total_cogs;
      profitSupply.value = data.profit_supply;
      profitService.value = data.profit_service;
      profitCourtFee.value = data.profit_court_fee;
      profitDepositCanceled.value = data.profit_deposit_canceled;
      supplies.value = data.supplies;
      services.value = data.services;

      // Đánh dấu đã tải dữ liệu xong
      dataLoaded.value = true;
    })
    .catch((error) => {
      console.error("Có lỗi khi gọi API:", error);
    });
});

// Hàm định dạng tiền tệ
const currency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
</script>

<style scoped>
/* Custom styles */
h2 {
  color: #007bff;
}

.card {
  border-radius: 8px;
}

.card-title {
  font-size: 1.2em;
  color: #333;
}

.card-text {
  font-size: 1.1em;
  font-weight: bold;
  color: #007bff;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}
</style>
