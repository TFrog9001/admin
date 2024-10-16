<script setup>
import Sidebar from "./components/Sidebar.vue";
import { useAuthStore } from "./stores/auth";
import { computed } from "vue";

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
</script>

<template>
  <v-responsive class="border rounded">
    <v-app id="inspire">
      <Sidebar v-if="isAuthenticated && isAdmin" />

      <v-main id="main-content" class="ma-4">
        <router-view></router-view>
      </v-main>
    </v-app>
  </v-responsive>
</template>

<style scope>
#main-content {
  background-color: #eee;
}

.status-paid {
  color: #2d8d30; /* Màu xanh lá cây cho Đã thanh toán */
}

.status-booked {
  color: #2196f3; /* Màu xanh dương cho Đã đặt */
}

.status-deposited {
  color: #ff9800; /* Màu cam cho Đã cọc */
}

.status-cancelled {
  color: #f44336; /* Màu đỏ cho Hủy */
}
</style>
