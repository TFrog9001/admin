<template>
  <div class="container-fluid">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-3xl">Danh sách dịch vụ</h2>
      <div class="text-end">
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>Thêm dịch vụ
        </v-btn>
      </div>
    </div>

    <div class="bg-white p-2">
      <vue3-datatable
        id="service_table"
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
        <template #fee="data">
          {{ formatCurrency(data.value.fee) }}
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
          Bạn có muốn xóa dịch vụ <strong>{{ itemDelete?.service }}</strong> có
          ID <strong>#{{ itemDelete?.id }}</strong> này không?
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

    <!-- Dialog Edit Service -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 font-bold">
          <v-icon left color="primary">mdi-pencil</v-icon>
          Chỉnh sửa dịch vụ
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4 pb-8">
          <v-text-field
            v-model="editedService.service"
            label="Tên dịch vụ"
            dense
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="editedService.description"
            label="Mô tả"
            dense
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="editedService.fee"
            label="Giá dịch vụ"
            type="number"
            dense
            variant="outlined"
          ></v-text-field>
          <v-select
            v-model="editedService.role_id"
            :items="roles"
            item-title="role_name"
            item-value="id"
            label="Vai trò"
            dense
            variant="outlined"
            class="mb-4"
          ></v-select>
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

    <!-- Dialog Create Service -->
    <v-dialog v-model="createDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 font-bold">
          <v-icon left color="primary">mdi-plus</v-icon>
          Thêm dịch vụ mới
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4 pb-8">
          <v-text-field
            v-model="newService.service"
            label="Tên dịch vụ"
            dense
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="newService.description"
            label="Mô tả"
            dense
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="newService.fee"
            label="Giá dịch vụ"
            type="number"
            dense
            variant="outlined"
          ></v-text-field>
          <v-select
            v-model="newService.role_id"
            :items="roles"
            item-title="role_name"
            item-value="id"
            label="Vai trò"
            dense
            variant="outlined"
            class="mb-4"
          >
          </v-select>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="justify-end px-4">
          <v-btn variant="outlined" @click="createDialog = false" color="grey">
            Hủy
          </v-btn>
          <v-btn @click="createService" color="primary">
            <v-icon left>mdi-content-save</v-icon>Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import serviceService from "../../services/serviceService";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import { showNotification } from "../../utils/notification";

const roles = ref([]);

const loading = ref(true);
const rows = ref([]);
const cols = ref([
  { field: "id", title: "ID", type: "number", width: "10%", sortable: false },
  { field: "service", title: "Tên dịch vụ", width: "20%" },
  { field: "role.role_name", title: "Thuộc nhóm", width: "20%" },
  { field: "description", title: "Mô tả", width: "30%" },
  { field: "fee", title: "Giá dịch vụ" },
  {
    field: "actions",
    title: "Thao tác",
    width: "10%",
    sort: false,
    filter: false,
    cellClass: "bh-sticky bh-right-0 bh-bg-blue-light action-cell",
  },
]);

const editedService = ref({});
const newService = ref({});
const confirmDialog = ref(false);
const editDialog = ref(false);
const createDialog = ref(false);
const itemDelete = ref(null);

const fetchServices = async () => {
  loading.value = true;
  try {
    const response = await serviceService.getServices();
    rows.value = response.data;
  } finally {
    loading.value = false;
  }
};

// Mở dialog tạo mới
const openCreateDialog = () => {
  newService.value = {};
  createDialog.value = true;
};

// Tạo dịch vụ mới
const createService = async () => {
  try {
    await serviceService.createService(newService.value);
    fetchServices();
    showNotification({
      title: "Thêm thành công",
      message: "Đã tạo thành công dịch vụ mới.",
      type: "success",
    });
    createDialog.value = false;
  } catch (error) {
    console.error("Failed to create service", error);
  }
};

// Mở dialog sửa
const openEdit = (service) => {
  editedService.value = { ...service };
  editDialog.value = true;
};

// Lưu chỉnh sửa dịch vụ
const saveEdit = async () => {
  try {
    await serviceService.updateService(
      editedService.value.id,
      editedService.value
    );
    fetchServices();
    showNotification({
      title: "Cập nhật thành công",
      message: "Dịch vụ đã được cập nhật.",
      type: "success",
    });
    editDialog.value = false;
  } catch (error) {
    console.error("Failed to update service", error);
  }
};

// Mở dialog xác nhận xóa
const openConfirmDialog = (service) => {
  itemDelete.value = service;
  confirmDialog.value = true;
};

// Xác nhận xóa dịch vụ
const confirmDelete = async () => {
  try {
    await serviceService.deleteService(itemDelete.value.id);
    fetchServices();
    showNotification({
      title: "Xóa thành công",
      message: "Dịch vụ đã được xóa.",
      type: "success",
    });
    confirmDialog.value = false;
  } catch (error) {
    console.error("Failed to delete service", error);
  }
};

// Định dạng tiền tệ
const formatCurrency = (amount) => {
  return (
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " VND"
  );
};

const fetchRoles = async () => {
  try {
    const response = await serviceService.getRoles();

    roles.value = response.data;
  } catch (error) {
    console.error("Failed", error);
  }
};

onMounted(() => {
  fetchRoles();
  fetchServices();
});
</script>

<style scoped>
.action-cell {
  display: flex;
  justify-content: flex-end;
}
</style>
