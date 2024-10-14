<template>
  <div class="container-fluid">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-3xl">Danh sách sân bóng</h2>
      <div class="text-end">
        <v-btn @click="addField" color="primary"> + Tạo sân mới </v-btn>
      </div>
    </div>
    <div class="bg-white p-2">
      <vue3-datatable
        id="receipt_table"
        :rows="fields"
        :columns="cols"
        :loading="loading"
        :sortable="true"
        sortColumn="created_at"
        sortDirection="desc"
        skin="bh-table-striped bh-table-hover bh-table-bordered"
      >
        <template #id="data">
          <strong>#{{ data.value.id }}</strong>
        </template>
        <template #actions="data">
          <div class="flex gap-4">
            <v-icon color="success" @click="viewField(data.value)">
              mdi-pencil
            </v-icon>
            <v-icon color="error" @click="deleteField(data.value)">
              mdi-delete
            </v-icon>
          </div>
        </template>
      </vue3-datatable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import fieldService from "../../services/fieldService";
import { showNotification } from "../../utils/notification";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";

const fields = ref([]);

const router = useRouter();

const cols = ref([
  { field: "id", title: "ID", type: "number", width: "10%", sortable: false },
  { field: "name", title: "Tên sân", width: "30%" },
  { field: "name", title: "Loại sân", width: "20%" },
  { field: "status", title: "Trạng thái", width: "20%" },
  {
    field: "actions",
    title: "Actions",
    width: "5%",
    sort: false,
    filter: false,
    cellClass: "bh-sticky bh-right-0 bh-bg-blue-light action-cell",
  },
]);

const fetchFields = async () => {
  try {
    const { data } = await fieldService.getFields();
    fields.value = data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sân:", error);
  }
};

const addField = () => {
  router.push("/fields/create");
};

const editField = (field) => {
  console.log("Chỉnh sửa sân:", field);
};

const deleteField = (field) => {
  const confirmDelete = confirm("Bạn có chắc chắn muốn xóa sân này?");
  if (!confirmDelete) return;

  try {
    fieldService.deleteFieldById(field.id);
    showNotification({
      title: "Thông báo",
      message: `Sân bóng ${field.name} đã được xóa`,
      type: "success",
    });
    fetchFields();
  } catch (error) {
    console.error("Lỗi khi xóa sân:", error);
    alert("Có lỗi xảy ra khi xóa sân");
  }
};

const viewField = (field) => {
  console.log(field.id);

  router.push({ name: "FieldDetail", params: { id: field.id } });
};

onMounted(() => {
  fetchFields();
});
</script>

<style scoped></style>
