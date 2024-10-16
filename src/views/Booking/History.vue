<template>
  <div class="container-fluid">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-3xl">Danh sách phiếu đặt sân</h2>
      <div class="text-end">
        <select
          v-model="selectedStatus"
          @change="filterByStatus"
          class="form-select form-select-sm d-inline-block w-auto ms-auto"
        >
          <option value="">Tất cả trạng thái</option>
          <option class="status-paid" value="Đã thanh toán">Đã thanh toán</option>
          <option class="status-booked " value="Đã đặt">Đã đặt</option>
          <option class="status-deposit" value="Đã cọc">Đã cọc</option>
          <option class="status-cancelled" value="Hủy">Hủy</option>
        </select>
      </div>
    </div>

    <div class="bg-white p-2">
      <vue3-datatable
        id="receipt_table"
        :rows="filteredRows"
        :columns="cols"
        :loading="loading"
        :sortable="true"
        :columnFilter="true"
        sortColumn="created_at"
        sortDirection="desc"
        skin="bh-table-striped bh-table-hover bh-table-bordered"
      >
        <template #status-header>
          <div>
            <span>Trạng thái</span>
            <select
              v-model="selectedStatus"
              @change="filterByStatus"
              class="ml-2"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đã thanh toán">Đã thanh toán</option>
              <option value="Đã cọc">Đã cọc</option>
              <option value="Đã đặt">Đã đặt</option>
              <option value="Hủy">Hủy</option>
            </select>
          </div>
        </template>
        <template #id="data">
          <strong>#{{ data.value.id }}</strong>
        </template>
        <template #userInfo="data">
          {{ data.value.userInfo }}
          <v-icon
            class="me-2"
            v-if="data.value.user.vip === '1'"
            color="amber lighten-1"
            icon="mdi-star"
          ></v-icon>
        </template>
        <template #time="data">
          {{
            formatTime(data.value.start_time) +
            " - " +
            formatTime(data.value.end_time)
          }}
        </template>
        <template #field_price="data">
          {{ formatCurrency(data.value.field_price) }}
        </template>
        <template #status="data">
          <div :class="getStatusClass(data.value.status)">
            {{ data.value.status }}
          </div>
        </template>
        <template #actions="data">
          <div class="flex gap-4">
            <v-icon color="success" @click="openEdit(data.value)">
              mdi-pencil
            </v-icon>
            <v-icon color="error" @click="openConfirmDialog(data.value)">
              mdi-delete
            </v-icon>
          </div>
        </template>
      </vue3-datatable>
    </div>

    <!-- Dialog Confirm Delete -->
    <v-dialog v-model="confirmDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 font-bold">
          <v-icon left color="warning">mdi-alert</v-icon>
          Xác nhận xóa
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="text-center">
          Bạn có muốn xóa phiếu đặt <strong>{{ itemDelete?.name }}</strong> có
          ID <strong>#{{ itemDelete?.id }}</strong
          >này không?
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="justify-end px-4">
          <v-btn outlined @click="confirmDialog = false" color="grey">
            Hủy
          </v-btn>
          <v-btn @click="confirmDelete" color="red darken-2">
            <v-icon left>mdi-delete</v-icon>Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import bookingService from "../../services/bookingService";
import { showNotification } from "../../utils/notification";

const router = useRouter();
const loading = ref(true);
const rows = ref([]);
const filteredRows = ref([]); // Dữ liệu đã lọc
const selectedStatus = ref(""); // Trạng thái được chọn
const confirmDialog = ref(false);
const itemDelete = ref(null);

const cols = ref([
  { field: "id", title: "ID", type: "number", sortable: false, width: "5%" },
  { field: "userInfo", title: "Người đặt", type: "string" },
  { field: "field.name", title: "Sân", type: "string" },
  { field: "booking_date", title: "Ngày đặt", type: "date" },
  { field: "time", title: "Thời lượng", filter: false },
  { field: "field_price", title: "Phí sân", filter: false},
  {
    field: "status",
    title: "Trạng thái",
    filter: false,
    sort: false,
  },
  {
    field: "actions",
    title: "Actions",
    width: "5%",
    sort: false,
    filter: false,
  },
]);

// Fetch dữ liệu booking từ API
const fetchBookings = async () => {
  loading.value = true;
  try {
    const response = await bookingService.getAllBookings();
    rows.value = response.data.map((booking) => {
      return {
        ...booking,
        userInfo: `ID: ${booking.user.id} - ${booking.user.name}`,
      };
    });
    filteredRows.value = rows.value;
  } finally {
    loading.value = false;
  }
};

const openEdit = (data) => {
  router.push(`/booking/${data.id}`);
}


/// filter 
const filterByStatus = () => {
  console.log("Selected Status:", selectedStatus.value);

  filteredRows.value = rows.value.filter((row) => {
    console.log("Row status:", row.status);
    return row.status.trim() === selectedStatus.value.trim();
  });

  if (!selectedStatus.value) {
    filteredRows.value = rows.value;
  }

  console.log("Filtered Rows:", filteredRows.value);
};

// Định dạng số tiền
const formatCurrency = (amount) => {
  return (
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " VND"
  );
};

// Định dạng giờ
const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
};

// Lấy class dựa theo trạng thái
const getStatusClass = (status) => {
  switch (status) {
    case "Đã thanh toán":
      return "status-paid";
    case "Đã đặt":
      return "status-booked";
    case "Đã cọc":
      return "status-deposited";
    case "Hủy":
      return "status-cancelled";
    default:
      return "";
  }
};

// Mở dialog xác nhận xóa
const openConfirmDialog = (product) => {
  itemDelete.value = product;
  confirmDialog.value = true;
};

// Xác nhận xóa
const confirmDelete = async () => {
  try {
    await bookingService.deleteBooking(itemDelete.value.id);
    fetchBookings(); // Reload lại danh sách sau khi xóa
    confirmDialog.value = false;
    showNotification({message: "Xóa phiếu đặt thành công", type: "success"})
  } catch (error) {
    console.error("Failed to delete booking", error);
  }
};

// Lấy dữ liệu booking khi trang được tải
onMounted(() => {
  fetchBookings();
});
</script>

<style scope>

</style>
