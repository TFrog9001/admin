<template>
  <div class="container-fluid mt-5">
    <h2 class="text-3xl mb-5">Tạo phiếu nhập mới</h2>

    <div class="row">
      <!-- Cột bên trái: Thông tin người lập phiếu và nhà cung cấp -->
      <div class="col-md-5 col-12 me-2 boder-card">
        <div class="mb-3">
          <label for="userId" class="form-label">Người lập phiếu</label>
          <input
            type="text"
            :value="'ID: ' + newReceipt.user_id + ' - ' + authStore.user.name"
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
      @click="createReceipt"
    >
      Tạo phiếu nhập
    </v-btn>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import importReceiptService from "../../services/importReceiptService";
import supplyService from "../../services/supplyService";
import equipmentService from "../../services/equipmentService";

import { showNotification } from "../../utils/notification";

const authStore = useAuthStore();
const router = useRouter();

const newReceipt = ref({
  user_id: authStore.user.id,
  receiper_name: "",
  items: ""
});

const newItem = ref({
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

const addItem = async  () => {
  // Reset lỗi
  cleanErrors();

  if (!newItem.value.serial_number) {
    errors.value.serial_number = "Serial number là bắt buộc.";
  }

  if (newItem.value.price === null || newItem.value.price <= 0 || newItem.value.price === "" ) {
    errors.value.price = "Giá nhập phải lớn hơn 0.";
  }

  try {
    let response;
    if (newItem.value.item_type === 'supply') {
      response = await supplyService.getSupplyBySN(newItem.value.serial_number);
    } else if (newItem.value.item_type === 'equipment') {
      response = await equipmentService.getEquipmentBySN(newItem.value.serial_number);
    }

    // Nếu serial_number tồn tại, gán tên sản phẩm từ API
    if (response && response.data) {
      newItem.value.item_name = response.data[0].name;
    } 
  } catch (error) {
  } 


  if (!newItem.value.item_name) {
    errors.value.item_name = "Tên sản phẩm là bắt buộc.";
  }
  if (!newItem.value.item_name || !newItem.value.serial_number || errors.value.price) {
    return;
  }



  // Tìm kiếm sản phẩm có serial_number trùng
  const existingItem = addedItems.value.find(
    (item) =>
      item.serial_number === newItem.value.serial_number &&
      item.item_type === newItem.value.item_type
  );

  // Nếu đã tồn tại sản phẩm với serial_number trùng, tăng số lượng
  if (existingItem) {
    existingItem.quantity += newItem.value.quantity;
  } else {
    // Thêm sản phẩm mới vào danh sách
    addedItems.value.push({ ...newItem.value });
  }

  calculateTotalAmount();

  newItem.value.item_name = "";
  newItem.value.serial_number = "";
};

const removeItem = (index) => {
  addedItems.value.splice(index, 1);
  calculateTotalAmount();
};

const createReceipt = async () => {
  // Kiểm tra nếu thiếu tên nhà cung cấp
  if (!newReceipt.value.receiper_name) {
    errors.value.receiper_name = "Tên nhà cung cấp là bắt buộc.";
    return;
  }
  if (addedItems.value.length === 0) {
    errors.value.addedItems = "Phải có ít nhất một sản phẩm được nhập.";
    return;
  }
  
  newReceipt.value.items = addedItems.value;

  console.log(newReceipt.value);
  
  const response = await importReceiptService.createReceipt(newReceipt.value);
  if (response.status == 201) {
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

  cleanErrors();
};
</script>

<style scoped>
.boder-card {
  border: 1px #00000033 solid;
  padding: 15px;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .boder-card {
    width: 100%;
    margin-bottom: 3px;
  }
}
</style>
