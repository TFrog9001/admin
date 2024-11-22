<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Bảng Vai Trò - Bên Trái -->
      <div class="col boder-card">
        <h2 class="text-3xl">Danh sách vai trò</h2>
        <div class="bg-white p-2">
          <vue3-datatable
            id="role_table"
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
            <template #roleInfo="data">
              {{ data.value.role_name }}
            </template>
            <template #actions="data">
              <div class="flex gap-4">
                <v-icon color="success" @click="openEditForm(data.value)">
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

      <!-- Form Chỉnh Sửa Vai Trò - Bên Phải -->
      <div class="col-5 bg-gray-100 boder-card">
        <h3 class="text-2xl mb-4">
          {{ editedRole.id ? "Chỉnh sửa Vai Trò" : "Thêm Vai Trò" }}
        </h3>
        <v-form ref="form" autocomplete="off">
          <v-text-field
            v-model="editedRole.role_name"
            label="Tên vai trò"
            required
            variant="outlined"
          />

          <!-- Sử dụng el-transfer để chọn quyền -->
          <div class="me-5">
            <el-transfer
              v-model="editedRole.permissions"
              :data="allPermissions"
              :titles="['Chưa có', 'Đã có']"
              :filterable="true"
              :props="transferProps"
            />
          </div>
        </v-form>
        <v-divider></v-divider>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <v-btn @click="clearForm">Hủy</v-btn>
          <v-btn
            prepend-icon="mdi-content-save-edit-outline"
            color="green-darken-3"
            class="btn btn-success w-10"
            @click="saveRole"
          >
            {{ editedRole.id ? "Cập nhật" : "Tạo mới" }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Dialog Xác Nhận Xóa -->
    <v-dialog v-model="confirmDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon left color="warning">mdi-alert</v-icon>
          Xác nhận xóa
        </v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa vai trò
          <strong
            >#{{ roleToDelete?.id + " - " + roleToDelete?.role_name }}</strong
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
import roleService from "../../services/roleService";
import { ElTransfer } from "element-plus"; // Import el-transfer

// Khai báo các biến và trạng thái
const dialog = ref(false);
const confirmDialog = ref(false);
const roleToDelete = ref(null);
const loading = ref(true);
const rows = ref([]);
const allPermissions = ref([]);
const cols = ref([
  { field: "id", title: "ID", type: "number", width: "10%" },
  { field: "roleInfo", title: "Tên vai trò", type: "string", width: "40%" },
  {
    field: "actions",
    title: "Actions",
    width: "10%",
    sortable: false,
    filter: false,
  },
]);

const editedRole = ref({
  id: null,
  role_name: "",
  permissions: [],
});

const initialPermissions = ref([]);

// Các tùy chọn cho el-transfer
const transferProps = {
  key: "key",
  label: "label",
  disabled: "disabled",
};

// Lấy danh sách vai trò
const getRoles = async () => {
  try {
    loading.value = true;
    const response = await roleService.getRoles();
    rows.value = response.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// Lấy danh sách quyền
const getPermissions = async () => {
  try {
    const response = await roleService.getPermissions();
    allPermissions.value = response.data.map((perm) => ({
      key: perm.id,
      label: perm.name,
      disabled: perm.disabled || false,
    }));
  } catch (error) {
    console.error(error);
  }
};

// Mở form để chỉnh sửa vai trò
const openEditForm = (role = null) => {
  if (role) {
    editedRole.value = {
      id: role.id,
      role_name: role.role_name,
      permissions: role.permissions
        ? role.permissions.map((perm) => perm.id)
        : [],
    };
    console.log("Quyền ban đầu đã chọn:", editedRole.value.permissions);
    initialPermissions.value = editedRole.value.permissions;
  } else {
    editedRole.value = {
      id: null,
      role_name: "",
      permissions: [],
    };
    console.log("Quyền mặc định (trống):", editedRole.value.permissions); // Log nếu không có quyền
  }
};

// Lưu vai trò (thêm mới hoặc cập nhật)
const saveRole = async () => {
  try {
    console.log("Quyền hiện tại đã chọn:", editedRole.value.permissions);

    if (editedRole.value.id) {
      console.log("199");

      await roleService.updateRole(editedRole.value.id, {
        role_name: editedRole.value.role_name,
      });

      // Xử lý gán và gỡ quyền
      const addedPermissions = editedRole.value.permissions.filter(
        (permId) => !initialPermissions.value.includes(permId)
      );
      const removedPermissions = initialPermissions.value.filter(
        (permId) => !editedRole.value.permissions.includes(permId)
      );

      console.log("Quyền được thêm:", addedPermissions);
      console.log("Quyền bị gỡ:", removedPermissions);

      if (addedPermissions.length > 0) {
        console.log("asssign 217");

        await roleService.assignPermissions(
          editedRole.value.id,
          addedPermissions
        );
      }

      if (removedPermissions.length > 0) {
        await roleService.revokePermissions(
          editedRole.value.id,
          removedPermissions
        );
      }
    } else {
      // Thêm vai trò mới
      const newRole = await roleService.createRole({
        role_name: editedRole.value.role_name,
        permissions: editedRole.value.permissions, // Gửi quyền cùng với tên vai trò
      });

      console.log("Vai trò mới tạo với quyền:", newRole.data);

      editedRole.value = {
        id: newRole.data.role.id,
        role_name: newRole.data.role.role_name,
        permissions: newRole.data.permissions.map((perm) => perm.id),
      };

      console.log(editedRole.value);
      
    }
    getRoles();
   
  } catch (error) {
    console.error(error);
  }
};

// Xóa vai trò
const openConfirmDialog = (role) => {
  roleToDelete.value = role;
  confirmDialog.value = true;
};

// Xác nhận xóa vai trò
const confirmDelete = async () => {
  if (roleToDelete.value) {
    try {
      await roleService.deleteRole(roleToDelete.value.id);
      rows.value = rows.value.filter((row) => row.id !== roleToDelete.value.id);
      confirmDialog.value = false;

      if (editedRole.value.id = roleToDelete.value.id) {
        clearForm();
      }
    } catch (error) {
      console.error(error);
    }
  }
};

// Clear form
const clearForm = () => {
  editedRole.value = {
    id: null,
    role_name: "",
    permissions: [],
  };
  console.log(editedRole.value);
};

// Gọi API để lấy danh sách vai trò và quyền khi component được mount
onMounted(() => {
  getRoles();
  getPermissions();
});
</script>

<style scoped>
.boder-card {
  border: 1px #00000033 solid;
  padding: 15px;
  border-radius: 8px;
  background-color: white;
  margin-right: 15px;
}
</style>
