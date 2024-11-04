<template>
  <div class="container-fluid">
    <v-btn
      prepend-icon="mdi-menu"
      color="primary"
      @click="showMenu = true"
      :hidden="props.bill.status !== 'Chưa thanh toán'"
    >
      Thêm tiện ích
    </v-btn>
    <v-divider></v-divider>
    <!-- Bảng hiển thị các item đã thêm -->
    <table class="table table-bordered table-responsive">
      <thead>
        <tr>
          <th>Tên sản phẩm</th>
          <th style="width: 10%">Số lượng</th>
          <th>Giá</th>
          <th>Tổng tiền</th>
          <th
            style="width: 10%"
            :hidden="props.bill.status !== 'Chưa thanh toán'"
          >
            Hành động
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in addedItems" :key="item.id">
          <td>{{ item.supply.name }}</td>
          <td>
            <input
              type="number"
              v-model.number="item.quantity"
              @change="handleQuantityChange(item)"
              min="0"
            />
          </td>
          <td>{{ formatCurrency(item.price) }} VND</td>
          <td>{{ formatCurrency(item.quantity * item.price) }} VND</td>
          <td :hidden="props.bill.status !== 'Chưa thanh toán'">
            <v-icon left color="red-darken-2" @click="openDeleteDialog(item)"
              >mdi-delete</v-icon
            >
            <v-icon
              v-if="item.isEdited"
              color="green"
              @click="updateItemQuantity(item)"
            >
              mdi-content-save-edit-outline
            </v-icon>
          </td>
        </tr>
      </tbody>
    </table>
    <v-divider></v-divider>

    <div class="my-2" v-if="props.bill.status == 'Chưa thanh toán'">
      <div></div>
      <h4>Thanh toán: {{ formatCurrency(billTotalAmount) }} VND</h4>
      <v-radio-group v-model="paymentMethod">
        <v-radio label="Tiền mặt" value="cash"></v-radio>
        <v-radio label="ZaloPay" value="zalopay">
          <template v-slot:label>
            <img
              src="@/assets/images/1715337285_zNBo0.png"
              alt="ZaloPay Logo"
              style="
                height: 50px;
                margin-right: 8px;
                filter: contrast(210%) brightness(90%);
              "
            />
            Thanh toán với ZaloPay
          </template>
        </v-radio>
      </v-radio-group>
      <v-btn color="primary" @click="processPayment">Xác nhận thanh toán</v-btn>
    </div>
    <!-- Popup để hiển thị danh sách đồ uống -->
    <v-dialog v-model="showMenu" persistent max-width="600px">
      <v-card>
        <v-card-title class="bg-teal-darken-2 d-flex justify-space-between">
          Danh sách sản phẩm
          <v-btn
            size="small"
            icon
            @click="closeMenu"
            variant="text"
            class="close-btn"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="bg-grey-lighten-4 p-3 m-0">
          <div class="search-bar">
            <v-text-field
              :loading="loadingSearch"
              v-model="search"
              append-inner-icon="mdi-magnify"
              density="compact"
              label="Tìm kiếm"
              variant="solo"
              hide-details
              single-line
            ></v-text-field>
          </div>

          <div class="scrollable-content">
            <v-row>
              <v-col
                v-for="item in filteredItems"
                :key="item.id"
                cols="12"
                md="6"
              >
                <v-card>
                  <v-img :src="item.image" height="150px"></v-img>
                  <v-card-title>{{ item.name }}</v-card-title>
                  <v-card-subtitle>
                    Giá: {{ formatCurrency(item.price) }} VND<br />
                    Tồn kho: {{ item.quantity }}
                  </v-card-subtitle>
                  <v-card-actions>
                    <input
                      style="max-width: 75px"
                      v-model.number="item.tempQuantity"
                      type="number"
                      :max="item.quantity"
                      min="1"
                      class="form-control"
                      aria-label="Sizing example input"
                      aria-describedby="inputGroup-sizing-sm"
                      @change="validateQuantity(item)"
                    />
                    <v-btn
                      color="primary"
                      @click="selectItem(item)"
                      :disabled="item.quantity <= 0"
                      prepend-icon="mdi-cart-plus"
                      variant="outlined"
                    >
                      Thêm
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>

              <v-col v-if="filteredItems.length === 0" cols="12">
                <p class="text-center">Không tìm thấy sản phẩm nào.</p>
              </v-col>
            </v-row>
          </div>

          <v-card class="mb-4" v-if="tempItems.length > 0">
            <v-card-title
              class="d-flex justify-space-between align-center bg-light-blue-lighten-4"
            >
              Các món đã chọn
              <div class="text-subtitle-1">
                Tổng tiền: {{ formatCurrency(calculateTotalAmount()) }} VND
              </div>
            </v-card-title>

            <!-- Bảng tạm hiển thị các item đã chọn -->
            <v-table>
              <thead class="">
                <tr>
                  <th>Tên item</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Tổng tiền</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in tempItems" :key="item.id">
                  <td>{{ item.name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.price) }} VND</td>
                  <td>{{ formatCurrency(item.total) }} VND</td>
                  <td>
                    <v-icon
                      left
                      color="red darken-2"
                      @click="removeFromTemp(item)"
                      >mdi-delete</v-icon
                    >
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-card-text>

        <v-card-actions class="bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn color="error" @click="closeMenu">Hủy</v-btn>
          <v-btn
            color="primary"
            @click="confirmItems"
            :disabled="tempItems.length === 0"
          >
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

  <v-dialog v-model="deleteDialog" persistent max-width="400px">
    <v-card>
      <v-card-title class="text-h6 font-bold">
        <v-icon left color="warning">mdi-alert</v-icon>
        Xác nhận xóa
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="text-center">
        Bạn có chắc xóa <strong>{{ itemToDelete?.supply.name }}</strong> ra khỏi
        giỏ hàng không?
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="justify-end px-4">
        <v-btn outlined @click="deleteDialog = false" color="grey"> Hủy </v-btn>
        <v-btn @click="confirmDelete" color="red darken-2">
          <v-icon left>mdi-delete</v-icon>Xóa
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, watch } from "vue";
import supplyService from "../../services/supplyService";
import billService from "../../services/billService";
import paymentSerice from "../../services/paymentService";

import { showNotification } from "../../utils/notification";

const props = defineProps({
  bookingId: {
    type: String,
    required: true,
  },
  bill: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["paymentSuccess"]);

const showMenu = ref(false);
const search = ref("");
const loadingSearch = ref(false);
const items = ref([]);
const tempItems = ref([]);
const addedItems = ref([]);
const paymentMethod = ref("cash");
const billTotalAmount = ref(props.bill.total_amount);

const deleteDialog = ref(false);
const itemToDelete = ref(null);

// Mở popup xác nhận xóa
const openDeleteDialog = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;

  console.log(itemToDelete.value);
};

const confirmDelete = async () => {
  try {
    await billService.removeItem(props.bill.id, itemToDelete.value.id);

    billTotalAmount.value -=
      itemToDelete.value.quantity * itemToDelete.value.price;
    addedItems.value = addedItems.value.filter(
      (item) => item.id !== itemToDelete.value.id
    );
    showNotification({
      title: "Xóa thành công",
      message: `Đã xóa ${itemToDelete.value.supply.name} thành công`,
      type: "success",
    });
    deleteDialog.value = false;
  } catch (error) {
    console.error("Lỗi khi xóa:", error);
    showNotification({
      title: "Lỗi",
      message: "Có lỗi xảy ra khi xóa item.",
      type: "error",
    });
  }
};

// Handle quantity change
const handleQuantityChange = (item) => {
  item.isEdited = true;
  if (item.quantity <= 0) {
    openDeleteDialog(item);
  }
};

// Cập nhật số lượng item
const updateItemQuantity = async (item) => {
  try {
    await billService.updateItemQuantity(item.id, item.quantity);
    showNotification({
      title: "Cập nhật thành công",
      message: `Đã cập nhật số lượng cho ${item.supply.name}`,
      type: "success",
    });
    item.isEdited = false;
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng:", error);
    showNotification({
      title: "Lỗi",
      message: "Có lỗi xảy ra khi cập nhật số lượng.",
      type: "error",
    });
  }
};

const validateQuantity = (item) => {
  if (item.quantity <= 0) {
    alert("Số lượng vượt quá hàng tồn kho!");
    item.tempQuantity = item.quantity;
  } else if (item.tempQuantity < 1) {
    alert("Số lượng phải lớn hơn hoặc bằng 1!");
    item.tempQuantity = 1;
  }
};

const selectItem = (item) => {
  const existingItem = tempItems.value.find((i) => i.id === item.id);

  if (existingItem) {
    console.log(existingItem.quantity, item.tempQuantity, item.quantity);

    if (item.quantity <= 0) {
      item.tempQuantity = 0;
      alert("Số lượng vượt quá hàng tồn kho!");
      return;
    }
    existingItem.quantity += item.tempQuantity;
    existingItem.total = existingItem.quantity * Number(existingItem.price);
  } else {
    const tempItem = {
      ...item,
      quantity: item.tempQuantity,
      total: item.tempQuantity * Number(item.price),
    };
    tempItems.value.push(tempItem);
  }

  item.quantity -= item.tempQuantity;

  item.tempQuantity = 1;
};

const removeFromTemp = (item) => {
  const originalItem = items.value.find((i) => i.id === item.id);

  if (originalItem) {
    originalItem.quantity += item.quantity;
  }

  tempItems.value = tempItems.value.filter((i) => i !== item);
};

const removeFromMainTable = (item) => {
  const originalItem = items.value.find((i) => i.id === item.id);

  if (originalItem) {
    originalItem.quantity += item.quantity;
  }

  addedItems.value = addedItems.value.filter((i) => i !== item);
};

const confirmItems = async () => {
  console.log(tempItems.value);

  try {
    const response = await billService.addItems(props.bill.id, tempItems.value);

    const rp = await billService.getBillSupplies(props.bill.id);

    addedItems.value = rp.data;

    console.log(rp.data);

    console.log(response.data);

    billTotalAmount.value += Math.floor(
      tempItems.value.reduce((total, item) => {
        return total + item.quantity * item.price;
      }, 0)
    );

    showNotification({
      title: "Thông báo",
      message: response.data.message,
      type: "success",
    });

    closeMenu();
  } catch (error) {
    console.error("Có lỗi xảy ra khi thêm sản phẩm:", error);
  }
};

const calculateTotalAmount = () => {
  return tempItems.value.reduce((sum, item) => sum + item.total, 0);
};

const closeMenu = () => {
  fetchSupplies();
  showMenu.value = false;
  tempItems.value = [];
};

const formatCurrency = (amount) => {
  return parseFloat(amount)
    .toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    })
    .replace("₫", "");
};

const fetchSupplies = async () => {
  try {
    loadingSearch.value = true;
    const response = await supplyService.getSupplies();
    items.value = response.data;
    items.value.forEach((item) => (item.tempQuantity = 1));
  } finally {
    loadingSearch.value = false;
  }
};

const filteredItems = computed(() => {
  return search.value
    ? items.value.filter((item) =>
        item.name.toLowerCase().includes(search.value.toLowerCase())
      )
    : items.value;
});

watch(showMenu, (newValue) => {
  if (newValue) {
    fetchSupplies();
  }
});
// thanh toan
const processPayment = async () => {
  console.log(paymentMethod.value);
  // const response = await billService.createBill(props.bill.id);
  // console.log(response.data);

  // if (paymentMethod.value == "zalopay") {

  // }

  if (paymentMethod.value === "zalopay") {
    try {
      const zaloPayResult = await paymentSerice.createZalopayBill(
        props.bill.id
      );
      const qr_url = zaloPayResult.data.zalopay.order_url;

      const popup = window.open(qr_url, "_blank", "width=500,height=600");

      // Check if the popup was successfully created
      if (popup) {
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            showNotification({
              title: "Thông báo",
              message: "Thanh toán hóa đơn thành công",
              type: "success",
            });
            emit("paymentSuccess");
          }
        }, 500);
      } else {
        console.error("Popup was blocked or failed to open.");
      }
    } catch (error) {
      console.error("Error creating ZaloPay payment:", error);
    }
  } else {
    try {
      const respone = await billService.paymentBill(props.bill.id);

      console.log(respone);

      showNotification({
        title: "Thông báo",
        message: "Đã thanh toán thành công",
        type: "success",
      });
      emit("paymentSuccess");
    } catch (error) {
      errorMessage.value = error.response.data.message;
      // showNotification({
      //   title: "Thông báo",
      //   message: error.response.data.message,
      //   type: "success",
      // });
      console.error("Error creating booking:", error);
    }
  }
};
// end thanh toan

onMounted(() => {
  addedItems.value = props.bill.supplies;
  console.log(props.bill.supplies);
});
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
}
.scrollable-content {
  height: 1000px;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
