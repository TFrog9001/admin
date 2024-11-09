<template>
  <div class="container-fluid">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-3xl">Danh sách đồ ăn thức uống</h2>
      <div class="text-end"></div>
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
        <template #price="data">
          {{ formatCurrency(data.value.price) }}
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
        <v-card-text class="pt-4 pb-8 text-center">
          Bạn có muốn xóa sản phẩm <strong>{{ itemDelete?.name }}</strong> có ID
          <strong>#{{ itemDelete?.id }}</strong
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

    <!-- Dialog Edit Product -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 font-bold">
          <v-icon left color="primary">mdi-pencil</v-icon>
          Chỉnh sửa sản phẩm
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4 pb-8">
          <v-text-field
            v-model="editedProduct.name"
            label="Tên sản phẩm"
            dense
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="editedProduct.serial_number"
            label="Số serial"
            dense
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="editedProduct.price"
            label="Giá bán"
            type="number"
            dense
            variant="outlined"
          ></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="justify-end px-4">
          <v-btn variant="outlined" @click="editDialog = false" color="grey">
            Hủy
          </v-btn>
          <v-btn @click="saveEdit" color="primary">
            <v-icon left>mdi-content-save</v-icon>Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import supplyService from "../../services/supplyService";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import { showNotification } from "../../utils/notification";

const loading = ref(true);
const rows = ref([]);
const cols = ref([
  { field: "id", title: "ID", type: "number", width: "10%", sortable: false },
  { field: "serial_number", title: "Số serial", width: "30%" },
  { field: "name", title: "Tên sản phẩm", width: "20%" },
  { field: "quantity", title: "Số lượng", type: "number", width: "20%" },
  { field: "price", title: "Giá bán" },
  {
    field: "actions",
    title: "Thao tác",
    width: "10%",
    sort: false,
    filter: false,
    cellClass: "bh-sticky bh-right-0 bh-bg-blue-light action-cell",
  },
]);

const editedProduct = ref({});
const confirmDialog = ref(false);
const editDialog = ref(false);
const itemDelete = ref(null);

const fetchSupplies = async () => {
  loading.value = true;
  try {
    const response = await supplyService.getSupplies();
    rows.value = response.data;
  } finally {
    loading.value = false;
  }
};

// Mở dialog sửa
const openEdit = (product) => {
  editedProduct.value = { ...product };
  editDialog.value = true;
};

// Lưu chỉnh sửa sản phẩm
const saveEdit = async () => {
  try {
    await supplyService.updateSupply(
      editedProduct.value.id,
      editedProduct.value
    );
    fetchSupplies();
    showNotification({
      title: "Cập nhật thành công",
      message: "Sản phẩm đã được cập nhật.",
      type: "success",
    });
    editDialog.value = false;
  } catch (error) {
    console.error("Failed to update product", error);
  }
};

// Mở dialog xác nhận xóa
const openConfirmDialog = (product) => {
  itemDelete.value = product;
  confirmDialog.value = true;
};

// Xác nhận xóa sản phẩm
const confirmDelete = async () => {
  try {
    await supplyService.deleteSupply(itemDelete.value.id);
    fetchSupplies();
    showNotification({
      title: "Xóa thành công",
      message: "Sản phẩm đã được xóa.",
      type: "success",
    });
    confirmDialog.value = false;
  } catch (error) {
    console.error("Failed to delete product", error);
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
  fetchSupplies();
});
</script>
