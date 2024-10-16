<template>
  <div>
    <v-btn prepend-icon="mdi-menu" color="primary" @click="showMenu = true">
      Thêm item
    </v-btn>

    <!-- Bảng hiển thị các item đã thêm -->
    <v-table>
      <thead>
        <tr>
          <th>Tên item</th>
          <th>Số lượng</th>
          <th>Giá</th>
          <th>Tổng tiền</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in addedItems" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.price }} VND</td>
          <td>{{ item.total }} VND</td>
          <td>
            <v-btn icon @click="removeFromMainTable(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

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
          <v-card class="mb-4" v-if="tempItems.length > 0">
            <v-card-title class="d-flex justify-space-between align-center">
              Các món đã chọn
              <div class="text-subtitle-1">
                Tổng tiền: {{ calculateTotalAmount() }} VND
              </div>
            </v-card-title>

            <!-- Bảng tạm hiển thị các item đã chọn -->
            <v-table>
              <thead>
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
                  <td>{{ item.price }}</td>
                  <td>{{ item.total }}</td>
                  <td>
                    <v-btn icon size="small" @click="removeFromTemp(item)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      class="ml-2"
                      @click="showEditQuantity(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <div class="search-bar">
            <v-text-field
              :loading="loadingSearch"
              v-model="search"
              append-inner-icon="mdi-magnify"
              density="compact"
              label="Tìm kiếm đồ uống"
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
                  <v-card-subtitle>Giá: {{ item.price }} VND</v-card-subtitle>
                  <v-card-actions>
                    <v-btn color="primary" @click="selectItem(item)"
                      >Thêm</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-col>

              <v-col v-if="filteredItems.length === 0" cols="12">
                <p class="text-center">Không tìm thấy sản phẩm nào.</p>
              </v-col>
            </v-row>
          </div>
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

    <!-- Popup để nhập số lượng -->
    <v-dialog v-model="showPopup" persistent max-width="400px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Nhập số lượng</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="quantity"
            type="number"
            label="Số lượng"
            min="1"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="showPopup = false">Hủy</v-btn>
          <v-btn color="primary" text @click="addToTemp">Thêm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import supplyService from "../services/supplyService";

const showMenu = ref(false);
const showPopup = ref(false);
const selectedItem = ref(null);
const quantity = ref(1);
const search = ref("");
const loadingSearch = ref(false);
const items = ref([]);
const tempItems = ref([]);
const addedItems = ref([]);

// Tải dữ liệu từ API
onMounted(async () => {
  try {
    loadingSearch.value = true;
    const response = await supplyService.getSupplies();
    items.value = response.data;
  } finally {
    loadingSearch.value = false;
  }
});

// Bộ lọc sản phẩm dựa vào tìm kiếm
const filteredItems = computed(() => {
  return search.value
    ? items.value.filter((item) =>
        item.name.toLowerCase().includes(search.value.toLowerCase())
      )
    : items.value;
});

// Chọn item và hiển thị popup để nhập số lượng
const selectItem = (item) => {
  selectedItem.value = item;
  showPopup.value = true;
};

// Thêm item vào bảng tạm thời
const addToTemp = () => {
  const existingItem = tempItems.value.find(
    (i) => i.id === selectedItem.value.id
  );

  if (existingItem) {
    existingItem.quantity += quantity.value;
    existingItem.total = existingItem.quantity * Number(existingItem.price);
  } else {
    const tempItem = {
      ...selectedItem.value,
      quantity: quantity.value,
      total: quantity.value * Number(selectedItem.value.price),
    };
    tempItems.value.push(tempItem);
  }

  // Đóng popup
  showPopup.value = false;
};

// Xóa item khỏi bảng tạm thời
const removeFromTemp = (item) => {
  tempItems.value = tempItems.value.filter((i) => i !== item);
};

// Xóa item khỏi bảng chính
const removeFromMainTable = (item) => {
  addedItems.value = addedItems.value.filter((i) => i !== item);
};

// Xác nhận các item đã chọn và thêm vào bảng chính
const confirmItems = () => {
  addedItems.value = [...addedItems.value, ...tempItems.value];
  closeMenu();
};

// Tính tổng tiền các item trong bảng tạm thời
const calculateTotalAmount = () => {
  return tempItems.value.reduce((sum, item) => sum + item.total, 0);
};

// Đóng menu popup
const closeMenu = () => {
  showMenu.value = false;
  tempItems.value = [];
};
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
}
.scrollable-content {
  height: 600px;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
