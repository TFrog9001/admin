<template>
  <div class="container-fluid mt-5">
    <h2 class="text-3xl mb-5">
      {{ isEditMode ? "Cập nhật phiếu nhập" : "Tạo phiếu nhập mới" }}
    </h2>

    <div class="row">
      <!-- Cột bên trái: Thông tin người lập phiếu và nhà cung cấp -->
      <div class="col-md-5 col-12 me-2 boder-card">
        <div class="mb-3">
          <label for="userId" class="form-label">Người lập phiếu</label>
          <input
            type="text"
            :value="'ID: ' + newReceipt.user_id + ' - ' + newReceipt.user_name"
            id="userId"
            class="form-control"
            readonly
            disabled
            placeholder="Người lập phiếu"
          />
        </div>

        <div class="mb-3">
          <label for="supplierName" class="form-label">Tên nhà cung cấp</label>
          <input
            type="text"
            v-model="newReceipt.receiper_name"
            id="supplierName"
            class="form-control"
            placeholder="Nhập tên nhà cung cấp"
            :class="{ 'is-invalid': errors.receiper_name }"
          />
          <div v-if="errors.receiper_name" class="invalid-feedback">
            {{ errors.receiper_name }}
          </div>
        </div>

        <div class="mb-3">
          <label for="totalAmount" class="form-label">Tổng tiền</label>
          <input
            type="text"
            :value="
              totalAmount.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })
            "
            id="totalAmount"
            class="form-control"
            readonly
            disabled
          />
        </div>
      </div>

      <!-- Cột bên phải: Phần thêm sản phẩm -->
      <div class="col-md-6 col-12 boder-card">
        <!-- Phần chọn loại sản phẩm -->
        <div class="mb-3">
          <label for="itemType" class="form-label">Loại sản phẩm</label>
          <select
            v-model="newItem.item_type"
            id="itemType"
            class="form-control"
          >
            <option value="supply">Supply</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="serialNumber" class="form-label">Serial Number</label>
          <input
            type="text"
            v-model="newItem.serial_number"
            id="serialNumber"
            class="form-control"
            placeholder="Nhập Serial Number"
            :class="{ 'is-invalid': errors.serial_number }"
            @keydown.enter.prevent="addItem"
          />
          <div v-if="errors.serial_number" class="invalid-feedback">
            {{ errors.serial_number }}
          </div>
        </div>

        <div class="mb-3">
          <label for="itemName" class="form-label">Sản phẩm</label>
          <input
            type="text"
            v-model="newItem.item_name"
            id="itemName"
            class="form-control"
            placeholder="Nhập tên sản phẩm"
            :class="{ 'is-invalid': errors.item_name }"
            @keydown.enter.prevent="addItem"
          />
          <div v-if="errors.item_name" class="invalid-feedback">
            {{ errors.item_name }}
          </div>
        </div>

        <!-- Nhập số lượng và giá -->
        <div class="row mb-3">
          <div class="col">
            <label for="quantity" class="form-label">Số lượng</label>
            <input
              type="number"
              v-model.number="newItem.quantity"
              id="quantity"
              class="form-control"
              min="1"
              @keydown.enter.prevent="addItem"
            />
          </div>
          <div class="col">
            <label for="price" class="form-label">Giá</label>
            <input
              type="number"
              v-model="newItem.price"
              id="price"
              class="form-control"
              min="0"
              :class="{ 'is-invalid': errors.price }"
              @keydown.enter.prevent="addItem"
            />
            <div v-if="errors.price" class="invalid-feedback">
              {{ errors.price }}
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label for="productImage" class="form-label">Hình ảnh sản phẩm</label>
          <div v-if="newItem.image">
            <!-- Hiển thị hình ảnh nếu có -->
            <img
              :src="newItem.image"
              alt="Hình ảnh sản phẩm"
              class="img-thumbnail"
              style="max-width: 100%; height: auto"
            />
          </div>
          <div v-else>
            <!-- Trường tải ảnh nếu chưa có ảnh -->
            <input
              type="file"
              @change="handleImageUpload"
              id="productImage"
              class="form-control"
            />
          </div>
        </div>

        <!-- Nút thêm sản phẩm -->
        <v-btn
          prepend-icon="mdi-plus-box-multiple-outline"
          color="light-blue-darken-3"
          class="w-100"
          @click="addItem"
        >
          Thêm sản phẩm
        </v-btn>
      </div>
    </div>

    <v-divider class="mt-5"></v-divider>

    <!-- Hiển thị sản phẩm đã nhập -->
    <h4 class="mt-5">Sản phẩm đã nhập</h4>
    <div class="table-responsive">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>STT</th>
            <th>Loại sản phẩm</th>
            <th>Serial number</th>
            <th>Tên sản phẩm</th>
            <th>Số lượng</th>
            <th>Giá</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in addedItems" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.item_type }}</td>
            <td>
              {{ item.serial_number }}
            </td>
            <td>
              <img
                v-if="item.image"
                :src="getFullImageUrl(item.image)"
                alt="Hình ảnh sản phẩm"
                class="img-thumbnail"
                style="max-width: 100px; height: auto"
              />
              {{ item.item_name }}
            </td>
            <td>
              <input
                v-model.number="item.quantity"
                type="number"
                class="form-control"
                @input="calculateTotalAmount"
              />
            </td>
            <td>
              <input
                v-model.number="item.price"
                type="number"
                class="form-control"
                @input="calculateTotalAmount"
              />
            </td>
            <td>
              <button class="btn btn-danger" @click="removeItem(index)">
                Xóa
              </button>
            </td>
          </tr>
          <tr v-if="errors.addedItems">
            <td colspan="7" class="text-center text-danger">
              {{ errors.addedItems }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Nút tạo phiếu nhập -->
    <v-btn
      prepend-icon="mdi-content-save-edit-outline"
      color="green-darken-3"
      class="btn btn-success w-10 mt-3"
      @click="isEditMode ? updateReceipt() : createReceipt()"
    >
      {{ isEditMode ? "Cập nhật phiếu nhập" : "Tạo phiếu nhập" }}
    </v-btn>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import importReceiptService from "../../services/importReceiptService";
import supplyService from "../../services/supplyService";
import equipmentService from "../../services/equipmentService";

import { showNotification } from "../../utils/notification";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isEditMode = ref(
  route.params.id && route.params.id !== "create" ? true : false
);

const newReceipt = ref({
  user_id: authStore.user.id,
  user_name: authStore.user.name,
  receiper_name: "",
  items: "",
});

const newItem = ref({
  item_id: "",
  item_type: "supply",
  item_name: "",
  serial_number: "",
  quantity: 1,
  price: 0,
});

const addedItems = ref([]);
const totalAmount = ref(0);
const errors = ref({
  receiper_name: "",
  addedItems: "",
  item_name: "",
  serial_number: "",
  price: "",
});

const cleanErrors = () => {
  errors.value.receiper_name = "";
  errors.value.addedItems = "";
  errors.value.item_name = "";
  errors.value.serial_number = "";
  errors.value.price = "";
};

const calculateTotalAmount = () => {
  totalAmount.value = addedItems.value.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

const isExistingProduct = ref(false);

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    newItem.value.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      newItem.value.image = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const addItem = async () => {

  // Xóa lỗi trước khi kiểm tra
  cleanErrors();

  // Kiểm tra nếu sản phẩm đã có trong danh sách
  const existingItem = addedItems.value.find(
    (item) =>
      item.serial_number === newItem.value.serial_number &&
      item.item_type === newItem.value.item_type
  );

  if (existingItem) {
    newItem.value.item_name = existingItem.item_name;
  }

  // Kiểm tra Serial Number
  if (!newItem.value.serial_number) {
    errors.value.serial_number = "Serial number là bắt buộc.";
  }

  // Kiểm tra giá
  if (newItem.value.price === null || newItem.value.price <= 0) {
    errors.value.price = "Giá nhập phải lớn hơn 0.";
  }

  // Kiểm tra tồn tại của sản phẩm
  try {
    let response;
    if (newItem.value.item_type === "supply") {
      response = await supplyService.getSupplyBySN(newItem.value.serial_number);
    } else if (newItem.value.item_type === "equipment") {
      response = await equipmentService.getEquipmentBySN(
        newItem.value.serial_number
      );
    }

    // Nếu sản phẩm tồn tại trong hệ thống, lấy dữ liệu
    if (response && response.data) {
      newItem.value.item_name = response.data[0].name;
      newItem.value.image = `http://127.0.0.1:8000/storage/${
        response.data[0].image || ""
      }`;
      isExistingProduct.value = true;
    } else {
      // Nếu không có sản phẩm trong hệ thống
      isExistingProduct.value = false;
      newItem.value.image = null;
    }
  } catch (error) {
   
  }

  // Kiểm tra tên sản phẩm sau khi tìm kiếm
  if (!newItem.value.item_name) {
    errors.value.item_name = "Tên sản phẩm là bắt buộc.";
  }

  // Nếu có lỗi, ngừng thực thi hàm
  if (
    errors.value.serial_number ||
    errors.value.item_name ||
    errors.value.price
  ) {
    return;
  }

  

  // Nếu đã có trong danh sách, tăng số lượng
  if (existingItem) {
    existingItem.quantity += newItem.value.quantity;
  } else {
    // Thêm sản phẩm mới vào danh sách
    addedItems.value.push({ ...newItem.value });
  }

  // Cập nhật tổng tiền
  calculateTotalAmount();

  // Reset thông tin sản phẩm mới
  newItem.value.serial_number = "";
  newItem.value.item_name = "";
  newItem.value.image = null;
  newItem.value.imageFile = null;
  isExistingProduct.value = false;
};

const removeItem = (index) => {
  addedItems.value.splice(index, 1);
  calculateTotalAmount();
};

const createReceipt = async () => {
  if (!newReceipt.value.receiper_name) {
    errors.value.receiper_name = "Tên nhà cung cấp là bắt buộc.";
    return;
  }
  if (addedItems.value.length === 0) {
    errors.value.addedItems = "Phải có ít nhất một sản phẩm được nhập.";
    return;
  }

  // Tạo FormData để gửi toàn bộ dữ liệu phiếu nhập
  const formData = new FormData();
  formData.append("user_id", newReceipt.value.user_id);
  formData.append("receiper_name", newReceipt.value.receiper_name);

  addedItems.value.forEach((item, index) => {
    formData.append(`items[${index}][item_type]`, item.item_type);
    formData.append(`items[${index}][item_name]`, item.item_name);
    formData.append(`items[${index}][serial_number]`, item.serial_number);
    formData.append(`items[${index}][quantity]`, item.quantity);
    formData.append(`items[${index}][price]`, item.price);

    // Chỉ đính kèm file ảnh nếu là sản phẩm mới và có ảnh
    if (!isExistingProduct.value && item.imageFile) {
      formData.append(`items[${index}][image]`, item.imageFile);
    }
  });

  try {
    const response = await importReceiptService.createReceipt(formData);
    if (response.status === 201) {
      showNotification({
        title: "Thông báo",
        message: "Tạo phiếu nhập thành công",
        type: "success",
      });
      router.push(`/receipt/${response.data.receipt_id}`);
    } else {
      showNotification({
        title: "Thông báo",
        message: "Có lỗi khi tạo phiếu nhập hàng",
        type: "error",
      });
    }
  } catch (error) {
    console.error("Error creating receipt:", error);
  }

  cleanErrors();
};

const updateReceipt = async () => {
  if (!newReceipt.value.receiper_name) {
    errors.value.receiper_name = "Tên nhà cung cấp là bắt buộc.";
    return;
  }
  if (addedItems.value.length === 0) {
    errors.value.addedItems = "Phải có ít nhất một sản phẩm được nhập.";
    return;
  }

  newReceipt.value.items = addedItems.value;

  try {
    const response = await importReceiptService.updateReceipt(
      route.params.id,
      newReceipt.value
    );
    if (response.status == 200) {
      showNotification({
        title: "Thông báo",
        message: "Cập nhật phiếu nhập thành công",
        type: "success",
      });
      router.push(`/receipt/${route.params.id}`);
    } else {
      throw new Error("Có lỗi khi cập nhật phiếu nhập hàng");
    }
  } catch (error) {
    showNotification({
      title: "Thông báo",
      message: error.message || "Có lỗi khi cập nhật phiếu nhập hàng",
      type: "error",
    });
  }

  cleanErrors();
};

const loadReceiptData = async () => {
  try {
    const response = await importReceiptService.getReceiptById(route.params.id);
    newReceipt.value = {
      user_id: response.data.user.id,
      user_name: response.data.user.name,
      receiper_name: response.data.receiper_name,
      items: response.data.items,
    };
    addedItems.value = response.data.items;
    totalAmount.value = response.data.total_amount;
  } catch (error) {
    showNotification({
      title: "Thông báo",
      message: "Có lỗi khi tải dữ liệu phiếu nhập",
      type: "error",
    });
  }
};

const getFullImageUrl = (url) => {
  const prefix = "http://127.0.0.1:8000/storage/";

  return url && !url.startsWith("data:") && !url.startsWith(prefix)
    ? `${prefix}${url}`
    : url;
};

onMounted(async () => {
  if (isEditMode.value) {
    await loadReceiptData();
  }
});

watch(
  () => route.params.id,
  async (newId) => {
    isEditMode.value = newId && newId !== "create";
    if (isEditMode.value) {
      await loadReceiptData();
    }
  }
);
</script>

<style scoped>
.boder-card {
  border: 1px #00000033 solid;
  padding: 15px;
  border-radius: 8px;
  background-color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .boder-card {
    width: 100%;
    margin-bottom: 3px;
  }
}

.img-thumbnail {
  width: 20%;
  height: auto;
  border-radius: 5px;
  margin-top: 5px;
}

.table thead th,
.table tbody td {
  /* text-align: center; Căn giữa theo chiều ngang */
  vertical-align: middle; /* Căn giữa theo chiều dọc */
}
</style>
