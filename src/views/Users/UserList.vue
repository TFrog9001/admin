<template>
  <div class="container-fluid">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-3xl">Danh sách người dùng</h2>
      <div class="text-end">
        <v-btn @click="openDialog" color="primary"> Thêm người dùng </v-btn>
      </div>
    </div>

    <div class="bg-white p-2">
      <vue3-datatable
        id="user_table"
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

    <!-- Dialog thêm/sửa người dùng -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">Thêm/Sửa Người dùng</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="editedUser.name" label="Tên" required />
            <v-text-field v-model="editedUser.email" label="Email" required />
            <v-text-field v-model="editedUser.phone" label="Số điện thoại" />
            <v-text-field
              v-model="editedUser.password"
              :type="showPassword ? 'text' : 'password'"
              label="Mật khẩu"
            />
            <v-text-field
              v-model="editedUser.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              label="Xác nhận mật khẩu"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveUser">Lưu</v-btn>
          <v-btn @click="dialog = false">Hủy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog xác nhận xóa -->
    <v-dialog v-model="confirmDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon left color="warning">mdi-alert</v-icon>
          Xác nhận xóa</v-card-title>
        <v-card-text>
          
          Bạn có chắc chắn muốn xóa người dùng
          <strong>#{{ userToDelete?.id  + " - "+ userToDelete?.name}}</strong> không?
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
import userService from "../../services/userService";

const dialog = ref(false);
const confirmDialog = ref(false);
const userToDelete = ref(null);
const loading = ref(true);
const rows = ref([]);
const cols = ref([
  { field: "id", title: "ID", type: "number", width: "10%" },
  { field: "name", title: "Tên", width: "30%" },
  { field: "email", title: "Email", width: "30%" },
  { field: "phone", title: "Số điện thoại", width: "20%" },
  {
    field: "actions",
    title: "Actions",
    width: "10%",
    sortable: false,
    filter: false,
    cellClass: "action-cell",
  },
]);

const editedUser = ref({
  id: null,
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

const getUsers = async () => {
  try {
    loading.value = true;
    const response = await userService.getCustomers();
    console.log(response);
    
    rows.value = response.data.users
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const openDialog = (user = null) => {
  if (user) {
    editedUser.value = { ...user };
  } else {
    editedUser.value = {
      id: null,
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };
  }
  dialog.value = true;
};

const saveUser = async () => {
  if (editedUser.value.id) {
    await userService.updateUser(editedUser.value.id, editedUser.value);
  } else {
    await userService.createUser(editedUser.value);
  }
  getUsers();
  dialog.value = false;
};

const openConfirmDialog = (user) => {
  userToDelete.value = user;
  confirmDialog.value = true;
};

const confirmDelete = async () => {
  if (userToDelete.value) {
    await userService.deleteUser(userToDelete.value.id);
    rows.value = rows.value.filter((row) => row.id !== userToDelete.value.id);
    confirmDialog.value = false;
  }
};

onMounted(() => {
  getUsers();
});
</script>

<style scoped>
.action-cell {
  display: flex;
  justify-content: space-around;
}
</style>
