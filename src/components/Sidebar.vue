<template>
  <v-navigation-drawer
    class="bg-teal-darken-2"
    v-model="drawer"
    :rail="rail"
    permanent
    @click="rail = false"
  >
    <v-list-item
      class="mb-2"
      prepend-avatar="https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png"
      nav
    >
      <v-list-item-title class="text-h6">
        {{ authStoreMenu.user?.name || "User" }}
      </v-list-item-title>
      <template v-slot:append>
        <v-btn
          icon="mdi-chevron-left"
          variant="text"
          @click.stop="rail = !rail"
        ></v-btn>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-home-city"
        title="Dashboard"
        value="home"
        :to="{ name: 'Admin' }"
      ></v-list-item>
      <v-divider inset></v-divider>
      <v-list-item
        prepend-icon="mdi-shield-account-outline"
        title="Vai trò & Quyền"
        value="roles"
        :to="{ name: 'Roles' }"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-account-tie"
        title="Nhân viên"
        value="staff"
        :to="{ name: 'Staff' }"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-account-group-outline"
        title="Người dùng"
        value="users"
        :to="{ name: 'Users' }"
      ></v-list-item>

      <v-divider inset></v-divider>
      <v-list-item
        prepend-icon="mdi-soccer-field"
        title="Sân bóng"
        value="fields"
        :to="{ name: 'Fields' }"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-calendar-multiple-check"
        title="Đặt sân"
        value="booking"
        :to="{ name: 'Booking' }"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-clipboard-text-clock"
        title="Lịch sử đặt sân"
        value="history"
        :to="{ name: 'History' }"
      ></v-list-item>

      <v-divider inset></v-divider>

      <v-list-item
        prepend-icon="mdi-home-import-outline"
        title="Nhập hàng"
        value="receipt"
        :to="{ name: 'Receipt' }"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-food-fork-drink"
        title="Đồ ăn thức uống"
        value="supply"
        :to="{ name: 'Supply' }"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-hammer-screwdriver"
        title="Trang thiết bị"
        value="equipment"
        :to="{ name: 'Equipment' }"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-cogs"
        title="Dịch vụ thêm"
        value="services"
        :to="{ name: 'Services' }"
      ></v-list-item>
    </v-list>
    <template v-slot:append>
      <v-divider inset></v-divider>
      <div class="pa-3">
        <v-btn class="bg-red" block variant="tonal" @click="handleLogout">
          <v-icon color="" left>mdi-power</v-icon>
          <span v-if="!rail">Logout</span>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <v-app-bar>
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    <v-app-bar-title></v-app-bar-title>
    <template v-if="$vuetify.display.mdAndUp">
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-bell" v-bind="props">
            <v-badge
              :content="notificationStore.notifications.length"
              color="red"
              overlap
            >
              <v-icon>mdi-bell</v-icon>
            </v-badge>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(notification, index) in notificationStore.notifications"
            :key="index"
          >
            <v-list-item-title>{{ notification.message }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ new Date(notification.timestamp).toLocaleString() }}
            </v-list-item-subtitle>
            <v-btn
              icon="mdi-close"
              @click="notificationStore.removeNotification(index)"
            ></v-btn>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item>
            <v-btn
              block
              color="red"
              @click="notificationStore.clearNotifications"
            >
              Xóa tất cả
            </v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<script setup>
import { ref, watch, onMounted, getCurrentInstance } from "vue";
import { useDisplay } from "vuetify";
import { useAuthStore } from "../stores/auth";
import { useNotificationStore } from "../stores/notification";
import { useRouter } from "vue-router";

const authStoreMenu = useAuthStore();
const notificationStore = useNotificationStore(); // Import notification store
const router = useRouter();

const handleLogout = () => {
  authStoreMenu.logout();
  router.push({ name: "Login" });
};

const { smAndDown } = useDisplay();

const drawer = ref(true);
const rail = ref(false);

watch(smAndDown, (newValue) => {
  drawer.value = !newValue;
  rail.value = false;
});

// WebSocket lắng nghe sự kiện và thêm thông báo
function listenForNotifications() {
  const instance = getCurrentInstance();
  if (!instance) {
    console.error("Vue instance is not available.");
    return;
  }

  const echo = instance.proxy.$echo;
  if (!echo) {
    console.error("WebSocket connection ($echo) is not initialized.");
    return;
  }

  // Lắng nghe kênh thông báo `staff-notifications`
  echo.channel("staff-notifications").listen("NotificationSent", (event) => {
    // Log sự kiện khi nhận được
    console.log("Event received:", event);

    // Giải mã dữ liệu (nếu cần)
    try {
      const eventData = JSON.parse(event.data);
      console.log("Parsed event data:", eventData);
    } catch (error) {
      console.error("Failed to parse event data:", error);
    }
  });
}

onMounted(() => {
  const instance = getCurrentInstance();
  const echo = instance.proxy.$echo;
  echo.channel("staff-notifications").listen(".NotificationSent", (event) => {
    console.log("Received event:", event.message);

    notificationStore.addNotification({
      message: event.message,
      timestamp: new Date(),
    });
  });
});
</script>

<style scoped></style>
