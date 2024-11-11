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
        <template #name="data">
          <div
            class="d-flex justify-content-between align-items-center"
            style="height: 100%"
          >
            <span class="text-start">{{ data.value.name }}</span>
            <img
              v-if="data.value.image"
              :src="`http://127.0.0.1:8000/storage/${data.value.image}`"
              alt="Product Image"
              width="50"
              height="50"
              class="ms-2"
            />
          </div>
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
          <!-- Trường tên sản phẩm -->
          <v-text-field
            v-model="editedProduct.name"
            label="Tên sản phẩm"
            dense
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <!-- Trường số serial -->
          <v-text-field
            v-model="editedProduct.serial_number"
            label="Số serial"
            dense
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <!-- Trường giá bán -->
          <v-text-field
            v-model="editedProduct.price"
            label="Giá bán"
            type="number"
            dense
            variant="outlined"
          ></v-text-field>

          <!-- Hiển thị hình ảnh hiện tại và trường upload ảnh mới -->
          <div class="mt-4">
            <label>Hình ảnh hiện tại:</label>
            <img
              v-if="editedProduct.image && !newImageUrl"
              :src="`http://127.0.0.1:8000/storage/${editedProduct.image}`"
              alt="Current Image"
              width="100"
              height="100"
              class="mb-4"
              style="object-fit: contain; border-radius: 4px;"
            />
            <img
              v-if="newImageUrl"
              :src="newImageUrl"
              alt="New Image Preview"
              width="100"
              height="100"
              class="mb-4"
            />
            <v-file-input
              label="Upload hình ảnh mới"
              prepend-icon="mdi-camera"
              dense
              variant="outlined"
              @change="previewImage"
              accept="image/*"
            ></v-file-input>
          </div>
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
  { field: "serial_number", title: "Số serial", width: "10%" },
  { field: "name", title: "Tên sản phẩm", width: "20%" },
  { field: "quantity", title: "Số lượng", type: "number", width: "10%" },
  { field: "price", title: "Giá bán", width: "15%" },
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
const newImageFile = ref(null); // File ảnh mới
const newImageUrl = ref(null); // URL tạm thời của ảnh mới để preview
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
  newImageUrl.value = null; // Đặt lại URL tạm thời khi mở dialog mới
  newImageFile.value = null; // Đặt lại file ảnh mới khi mở dialog mới
  editDialog.value = true;
};

// Hàm hiển thị preview ảnh mới
const previewImage = (event) => {
  const file = event.target.files[0];
  if (file) {
    newImageFile.value = file;
    newImageUrl.value = URL.createObjectURL(file); // Hiển thị ảnh tạm thời
  }
};

// Lưu chỉnh sửa sản phẩm
const saveEdit = async () => {
  try {
    const formData = new FormData();
    formData.append("name", editedProduct.value.name);
    formData.append("serial_number", editedProduct.value.serial_number);
    formData.append("price", editedProduct.value.price);

    // Kiểm tra xem có file ảnh mới không và thêm vào formData
    if (newImageFile.value) {
      formData.append("image", newImageFile.value);
    }

    await supplyService.updateSupply(editedProduct.value.id, formData);
    fetchSupplies();
    showNotification({
      title: "Cập nhật thành công",
      message: "Sản phẩm đã được cập nhật.",
      type: "success",
    });
    editDialog.value = false;
    newImageUrl.value = null; // Reset ảnh tạm thời sau khi lưu
    newImageFile.value = null; // Reset file ảnh mới sau khi lưu
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
