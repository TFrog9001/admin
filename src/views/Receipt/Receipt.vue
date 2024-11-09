<template>
  <div class="container-fluid">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-3xl">Danh sách phiếu nhập</h2>
      <div class="text-end">
        <v-btn @click="createReceipt" color="primary">
        Tạo phiếu nhập
      </v-btn>
      </div>
    </div>

    <div class="bg-white p-2">
      <vue3-datatable
        id="receipt_table"
        :rows="rows"
        :columns="cols"
        :loading="loading"
        :sortable="true"
        :columnFilter="true"
        sortColumn="created_at"
        sortDirection="desc"
        skin="bh-table-striped bh-table-hover bh-table-bordered"
      >
        <template #id="data">
          <strong>#{{ data.value.id }}</strong>
        </template>
        <template #total_amount="data">
          {{ formatCurrency(data.value.total_amount) }}
        </template>
        <template #created_at="data">
          {{ formatDateTime(data.value.created_at) }}
        </template>
        <template #actions="data">
          <div class="flex gap-4">
            <v-icon color="success" @click="editReceipt(data.value.id)">
              mdi-pencil
            </v-icon>
            <v-icon color="error" @click="openConfirmDialog(data.value)">
              mdi-delete
            </v-icon>
          </div>
        </template>
      </vue3-datatable>
    </div>
  </div>

  <!-- Dialog Confirm Delete -->
  <v-dialog v-model="confirmDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa phiếu nhập
        <strong>#{{ receiptToDelete?.id }}</strong> không?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="confirmDelete" color="red">Xóa</v-btn>
        <v-btn @click="confirmDialog = false">Hủy</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import importReceiptService from "../../services/importReceiptService";
import { showNotification } from "../../utils/notification";

const confirmDialog = ref(false);
const receiptToDelete = ref(null);
const router = useRouter();
const loading = ref(true);
const total_rows = ref(0);
const rows = ref([]);
const cols = ref([
  { field: "id", title: "ID", type: "number", width: "10%", sortable: false },
  { field: "receiper_name", title: "Tên nhà phân phối", width: "30%" },
  { field: "user.name", title: "Người lập phiếu", width: "20%" },
  { field: "total_amount", title: "Tổng giá trị phiếu nhập" },
  { field: "created_at", title: "Ngày lập", type: "date" , width: "10%"},
  {
    field: "actions",
    title: "Thao tác",
    width: "10%",
    sort: false,
    filter: false,
    cellClass: "bh-sticky bh-right-0 bh-bg-blue-light action-cell",
  },
]);

const getReceipts = async () => {
  try {
    loading.value = true;
    const response = await importReceiptService.getReceipts();
    rows.value = response.data.slice();
  } catch (error) {
    console.error(error);
  }
  loading.value = false;
};

const editReceipt = (id) => {
  router.push(`/receipt/${id}`);
};

const createReceipt = () => {
  router.push('/receipt/create'); // Thay đổi URL theo trang tạo phiếu nhập của bạn
};

// Mở dialog xác nhận xóa
const openConfirmDialog = (receipt) => {
  receiptToDelete.value = receipt;
  confirmDialog.value = true;
};

// Xác nhận xóa
const confirmDelete = async () => {
  if (receiptToDelete.value) {
    try {
      await importReceiptService.deleteReceipt(receiptToDelete.value.id);
      rows.value = rows.value.filter((row) => row.id !== receiptToDelete.value.id);
      confirmDialog.value = false;
      receiptToDelete.value = null;
      showNotification({
      title: "Xóa thành công",
      message: "Đã tạo thành công phiếu nhập.",
      type: "success",
    });
    } catch (error) {
      console.error(error);
    }
  }
};

const formatDateTime = (date) => {
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  return `${hours}:${minutes} ${formattedDate.replace(/\//g, "-")}`;
};

const formatCurrency = (amount) => {
  return (
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " VND"
  );
};

onMounted(() => {
  getReceipts();
});
</script>

<style scope>
.action-cell {
  border-bottom: 1px solid #eeee !important;
  border-top: 1px solid #eeee !important;
}
</style>
