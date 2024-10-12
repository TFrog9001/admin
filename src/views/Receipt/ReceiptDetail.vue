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
          />
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

        <!-- Nhập chi tiết sản phẩm -->
        <div class="mb-3">
          <label for="itemName" class="form-label">Sản phẩm</label>
          <input
            type="text"
            v-model="newItem.item_name"
            id="itemName"
            class="form-control"
            placeholder="Nhập tên sản phẩm"
            @keydown.enter.prevent="addItem"
          />
        </div>

        <div class="mb-3">
          <label for="serialNumber" class="form-label">Serial Number</label>
          <input
            type="text"
            v-model="newItem.serial_number"
            id="serialNumber"
            class="form-control"
            placeholder="Nhập Serial Number"
            @keydown.enter.prevent="addItem"
          />
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
              v-model.number="newItem.price"
              id="price"
              class="form-control"
              min="0"
              @keydown.enter.prevent="addItem"
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
            <th>Loại sản phẩm</th>
            <th>Serial number</th>
            <th>ID/Tên sản phẩm</th>
            <th>Số lượng</th>
            <th>Giá</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in addedItems" :key="index">
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
              />
            </td>
            <td>
              <input
                v-model.number="item.price"
                type="number"
                class="form-control"
              />
            </td>
            <td>
              <button class="btn btn-danger" @click="removeItem(index)">
                Xóa
              </button>
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
import { useAuthStore } from "../../stores/auth";
import importReceiptService from "../../services/importReceiptService";

const authStore = useAuthStore();

const newReceipt = ref({
  user_id: authStore.user.id,
  receiper_name: "",
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

const calculateTotalAmount = () => {
  totalAmount.value = addedItems.value.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

const addItem = () => {
  // Kiểm tra nếu chưa nhập tên hoặc serial number thì không thêm
  if (
    (newItem.value.item_type === "supply" && !newItem.value.item_name) ||
    (newItem.value.item_type === "equipment" && !newItem.value.serial_number)
  ) {
    alert("Vui lòng nhập đầy đủ thông tin sản phẩm!");
    return;
  }

  // Thêm sản phẩm vào danh sách mà không reset các trường
  addedItems.value.push({ ...newItem.value });

  // Tính lại tổng số tiền
  calculateTotalAmount();

  // Reset chỉ các trường cần reset
  if (newItem.value.item_type === "supply") {
    newItem.value.item_name = "";
  } else {
    newItem.value.serial_number = "";
  }
};

const removeItem = (index) => {
  addedItems.value.splice(index, 1);
  calculateTotalAmount();
};

const createReceipt = async () => {
  try {
    const receiptData = {
      receiper_name: newReceipt.value.receiper_name,
      items: addedItems.value,
    };
    await importReceiptService.createReceipt(receiptData);
    alert("Phiếu nhập đã được tạo thành công!");
    // Reset các giá trị sau khi tạo phiếu thành công
    newReceipt.value.receiper_name = "";
    addedItems.value = [];
  } catch (error) {
    console.error("Error creating receipt:", error);
    alert("Có lỗi xảy ra khi tạo phiếu nhập. Vui lòng thử lại!");
  }
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
