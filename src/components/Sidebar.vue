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
      <v-list-item-title class="text-h6">{{
        authStoreMenu.user?.name || "User"
      }}</v-list-item-title>
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
      <v-btn icon="mdi-magnify" variant="text"></v-btn>
      <v-btn icon="mdi-filter" variant="text"></v-btn>
    </template>
  </v-app-bar>
</template>

<script setup>
import { ref, watch } from "vue";
import { useDisplay } from "vuetify";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const authStoreMenu = useAuthStore();
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
</script>

<style scoped></style>
