<template>
  <div class="container-fluid">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-3xl">Danh sách nhân viên</h2>
      <div class="text-end">
        <v-btn @click="openDialog" color="primary"> Thêm nhân viên </v-btn>
      </div>
    </div>

    <div class="bg-white p-2">
      <vue3-datatable
        id="staff_table"
        :rows="rows"
        :columns="cols"
        :loading="loading"
        :sortable="true"
        :columnFilter="true"
        sortColumn="id"
        sortDirection="asc"
        skin="bh-table-striped bh-table-hover bh-table-bordered"
      >
        <template #id="data">
          <strong>#{{ data.value.id }}</strong>
        </template>
        <template #role="data">
          {{ data.value.role.role_name }}
        </template>
        <template #userInfo="data">
          <div
            class="d-flex justify-content-between align-items-center"
            style="height: 100%"
          >
            <span class="text-start">{{ data.value.name }}</span>
            <img
              v-if="data.value.avatar"
              :src="`http://127.0.0.1:8000/storage/${data.value.avatar}`"
              alt="Product Image"
              width="50"
              height="50"
              class="ms-2 mr-4"
            />
            <img
              v-else="data.value.avatar"
              src="https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png"
              alt="Product Image"
              width="50"
              height="50"
              class="ms-2 mr-4"
            />
          </div>
        </template>
        <template #actions="data">
          <div class="flex gap-4">
            <v-icon color="success" @click="openDialog(data.value)">
              mdi-pencil
            </v-icon>
            <v-icon color="error" @click="openConfirmDialog(data.value)">
              mdi-delete
            </v-icon>
          </div>
        </template>
      </vue3-datatable>
    </div>

    <!-- Dialog thêm/sửa nhân viên -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 bg-teal-darken-2">
          Thêm/Sửa Nhân viên
        </v-card-title>
        <v-card-text>
          <v-form ref="form" autocomplete="off" @submit.prevent="saveStaff">
            <!-- Tên -->
            <v-text-field
              prepend-inner-icon="mdi-account-outline"
              v-model="editedStaff.name"
              label="Tên"
              :rules="[rules.required, rules.maxLength50]"
              required
            />
            <!-- Email -->
            <v-text-field
              prepend-inner-icon="mdi-email-outline"
              v-model="editedStaff.email"
              label="Email"
              :rules="[rules.required, rules.email]"
              required
            />
            <!-- Số điện thoại -->
            <v-text-field
              prepend-inner-icon="mdi-phone"
              v-model="editedStaff.phone"
              label="Số điện thoại"
              :rules="[rules.required, rules.phone]"
            />
            <!-- Mật khẩu -->
            <v-text-field
              prepend-inner-icon="mdi-lock-outline"
              autocomplete="new-password"
              v-model="editedStaff.password"
              :type="showPassword ? 'text' : 'password'"
              label="Mật khẩu"
              :rules="[rules.required, rules.password]"
            />
            <!-- Xác nhận mật khẩu -->
            <v-text-field
              prepend-inner-icon="mdi-replay"
              v-model="editedStaff.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              label="Xác nhận mật khẩu"
              :rules="[rules.required, rules.confirmPassword]"
            />
            <!-- Chọn vai trò -->
            <v-select
              prepend-inner-icon="mdi-shield-account-outline"
              v-model="editedStaff.role"
              :items="roles"
              item-title="role_name"
              item-value="id"
              label="Vai trò"
              required
            ></v-select>
            <!-- Upload ảnh -->
            <v-file-input
              v-model="editedStaff.avatar"
              label="Chọn ảnh đại diện"
              prepend-icon="mdi-image"
              accept="image/*"
              :rules="[rules.required]"
              variant="underlined"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveStaff">Lưu</v-btn>
          <v-btn @click="dialog = false">Hủy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog xác nhận xóa -->
    <v-dialog v-model="confirmDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon left color="warning">mdi-alert</v-icon>
          Xác nhận xóa
        </v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa nhân viên
          <strong
            >#{{ staffToDelete?.id + " - " + staffToDelete?.name }}</strong
          >
          không?
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="confirmDelete">Xóa</v-btn>
          <v-btn @click="confirmDialog = false">Hủy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import api from "../../axios/api";

const dialog = ref(false);
const confirmDialog = ref(false);
const staffToDelete = ref(null);
const loading = ref(true);
const rows = ref([]);
const roles = ref([]);
const cols = ref([
  { field: "id", title: "ID", type: "number", width: "10%" },
  { field: "userInfo", title: "Tên nhân viên", type: "string" },
  { field: "email", title: "Email", width: "30%" },
  { field: "phone", title: "Số điện thoại", width: "20%" },
  { field: "role", title: "Vai trò", width: "5%" },
  {
    field: "actions",
    title: "Actions",
    width: "10%",
    sortable: false,
    filter: false,
    cellClass: "action-cell",
  },
]);

const editedStaff = ref({
  id: null,
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: null,
  avatar: null,
});

const rules = {
  required: (value) => !!value || "Trường này là bắt buộc.",
  maxLength: (value) =>
    (value ? value.length <= 50 : true) || "Tối đa 50 ký tự.",
  email: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Email không hợp lệ.",
  phone: (value) =>
    /^\d{10}$/.test(value) || "Số điện thoại phải là 10 chữ số.",
  password: (value) =>
    (value ? value.length >= 8 : true) || "Mật khẩu ít nhất 8 ký tự",
  matchPassword: () =>
    editedStaff.value.password === editedStaff.value.confirmPassword ||
    "Mật khẩu xác nhận không khớp.",
};

const getRoles = async () => {
  try {
    const response = await api.get("/roles");
    roles.value = response.data.filter((role) => role.role_name !== "User");
  } catch (error) {
    console.error("Lỗi khi lấy roles:", error);
  }
};

const getStaffs = async () => {
  try {
    loading.value = true;
    const response = await api.get("/users/staffs");
    rows.value = response.data.users;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const openDialog = (staff = null) => {
  if (staff) {
    editedStaff.value = { ...staff, avatar: null }; // Đặt avatar = null để không ghi đè ảnh hiện tại
  } else {
    editedStaff.value = {
      id: null,
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: null,
      avatar: null,
    };
  }
  dialog.value = true;
};

const saveStaff = async () => {
  try {
    const formData = new FormData();
    formData.append("name", editedStaff.value.name);
    formData.append("email", editedStaff.value.email);
    formData.append("phone", editedStaff.value.phone);
    formData.append("password", editedStaff.value.password);
    formData.append("password_confirmation", editedStaff.value.confirmPassword);
    formData.append("role", editedStaff.value.role);

    if (editedStaff.value.avatar) {
      formData.append("avatar", editedStaff.value.avatar);
    }

    if (editedStaff.value.id) {
      console.log(editedStaff.value);
      
      await api.post(`/users/${editedStaff.value.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await api.post("/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    getStaffs();
    dialog.value = false;
  } catch (error) {
    console.error("Lỗi khi lưu nhân viên:", error);
    alert("Đã xảy ra lỗi khi lưu nhân viên.");
  }
};

const openConfirmDialog = (staff) => {
  staffToDelete.value = staff;
  confirmDialog.value = true;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/users/${staffToDelete.value.id}`);
    getStaffs();
    confirmDialog.value = false;
  } catch (error) {
    console.error(error);
    alert("Đã xảy ra lỗi khi xóa nhân viên.");
  }
};

onMounted(() => {
  getStaffs();
  getRoles();
});
</script>

<style scoped>
.action-cell {
  display: flex;
  justify-content: space-around;
}
</style>
