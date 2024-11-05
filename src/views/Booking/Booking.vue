<template>
  <h1 class="text-h4 text-center mb-6">Lịch Sân Bóng</h1>

  <v-card class="mb-4 pa-4">
    <v-row>
      <v-col cols="12" sm="4">
        <v-date-input
          class="date-picker"
          v-model="selectedDate"
          label="Select Date"
          prepend-icon="mdi-calendar"
          clearable
          variant="outlined"
        ></v-date-input>
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="selectedField"
          :items="fieldOptions"
          label="Select Field"
          item-title="name"
          item-value="id"
          variant="outlined"
          clearable
        ></v-select>
      </v-col>
      <v-col>
        <v-select
          v-model="selectedBookingType"
          :items="bookingTypes"
          item-title="title"
          item-value="value"
          label="Chọn loại booking"
          variant="outlined"
        ></v-select>
      </v-col>

    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between">
        <v-btn @click="selectedField ? previousWeek() : previousDay()">
          {{ selectedField ? "Previous Week" : "Previous Day" }}
        </v-btn>
        <v-btn @click="setToday">
          {{ selectedField ? "This Week" : "Today" }}
        </v-btn>
        <v-btn @click="selectedField ? nextWeek() : nextDay()">
          {{ selectedField ? "Next Week" : "Next Day" }}
        </v-btn>
      </v-col>
    </v-row>
  </v-card>

  <v-card v-if="!selectedField">
    <v-table id="table-booking" fixed-header>
      <thead>
        <tr>
          <th class="text-left">Time</th>
          <th
            v-for="field in filteredFields"
            :key="field.id"
            class="text-center"
          >
            {{ field.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(time, index) in timeSlots" :key="time">
          <td v-if="index % 2 === 0" class="time-line">{{ time }}</td>
          <td v-else class="time-line"></td>
          <td
            v-for="field in filteredFields"
            :key="`${field.id}-${time}`"
            class="pa-1"
          >
            <template v-if="isBookingStart(field.id, index)">
              <div
                class="booking-block"
                :class="{
                  'status-paid':
                    getBookingForSlot(field.id, index).status ===
                    'Đã thanh toán',
                  'status-booked':
                    getBookingForSlot(field.id, index).status === 'Đã đặt',
                  'status-deposit':
                    getBookingForSlot(field.id, index).status === 'Đã cọc',
                  'status-cancelled':
                    getBookingForSlot(field.id, index).status === 'Hủy',
                }"
                :style="{ height: `${getBookingHeight(field.id, index)}px` }"
                @click="
                  viewBookingDetail(getBookingForSlot(field.id, index).id)
                "
              >
                <div class="booking-content">
                  <p class="text-subtitle-2">
                    {{
                      getBookingForSlot(field.id, index).user.name +
                      " - " +
                      getBookingForSlot(field.id, index).user.phone
                    }}
                  </p>
                  <p class="text-caption">
                    {{
                      getBookingForSlot(field.id, index).start_time.slice(0, 5)
                    }}
                    -
                    {{
                      getBookingForSlot(field.id, index).end_time.slice(0, 5)
                    }}
                  </p>
                  <p class="text-caption">
                    {{
                      formatCurrency(
                        getBookingForSlot(field.id, index).field_price
                      )
                    }}
                  </p>
                  <p class="text-caption">
                    {{ getBookingForSlot(field.id, index).status }}
                  </p>
                </div>
              </div>
            </template>
            <v-btn
              v-else-if="
                !getBookingForSlot(field.id, index) &&
                isPastTime(index, selectedDate)
              "
              block
              disabled
            >
              -
            </v-btn>
            <v-btn
              v-else-if="
                !getBookingForSlot(field.id, index) &&
                !isPastTime(index, selectedDate)
              "
              block
              @click="handleOpenBooking(field.id, index)"
            >
              +
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>

  <v-card v-else>
    <v-table id="table-booking-week" fixed-header>
      <thead>
        <tr>
          <th class="text-left">Time</th>
          <th v-for="day in weekDays" :key="day.date" class="text-center">
            {{ day.name }} ({{ formatDate(day.date) }})
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(time, index) in timeSlots" :key="time">
          <td v-if="index % 2 === 0" class="time-line">{{ time }}</td>
          <td v-else class="time-line"></td>
          <td v-for="day in weekDays" :key="`${day.date}-${time}`" class="pa-1">
            <template v-if="isBookingStart(selectedField, index, day.date)">
              <div
                class="booking-block"
                :class="{
                  'status-paid':
                    getBookingForSlot(selectedField, index, day.date).status ===
                    'Đã thanh toán',
                  'status-booked':
                    getBookingForSlot(selectedField, index, day.date).status ===
                    'Đã đặt',
                  'status-deposit':
                    getBookingForSlot(selectedField, index, day.date).status ===
                    'Đã cọc',
                  'status-cancelled':
                    getBookingForSlot(selectedField, index, day.date).status ===
                    'Hủy',
                }"
                :style="{
                  height: `${getBookingHeight(
                    selectedField,
                    index,
                    day.date
                  )}px`,
                }"
                @click="
                  viewBookingDetail(
                    getBookingForSlot(selectedField, index, day.date).id
                  )
                "
              >
                <div class="booking-content">
                  <p class="text-subtitle-2">
                    {{
                      getBookingForSlot(selectedField, index, day.date).user
                        .name +
                      " - " +
                      getBookingForSlot(selectedField, index, day.date).user
                        .phone
                    }}
                  </p>
                  <p class="text-caption">
                    {{
                      getBookingForSlot(
                        selectedField,
                        index,
                        day.date
                      ).start_time.slice(0, 5)
                    }}
                    -
                    {{
                      getBookingForSlot(
                        selectedField,
                        index,
                        day.date
                      ).end_time.slice(0, 5)
                    }}
                  </p>
                  <p class="text-caption">
                    {{
                      formatCurrency(
                        getBookingForSlot(selectedField, index, day.date)
                          .field_price
                      )
                    }}
                  </p>
                  <p class="text-caption">
                    {{
                      getBookingForSlot(selectedField, index, day.date).status
                    }}
                  </p>
                </div>
              </div>
            </template>
            <v-btn
              v-else-if="
                !getBookingForSlot(selectedField, index, day.date) &&
                isPastTime(index, day.date)
              "
              block
              disabled
            >
              -
            </v-btn>
            <v-btn
              v-else-if="
                !getBookingForSlot(selectedField, index, day.date) &&
                !isPastTime(index, day.date)
              "
              block
              @click="handleOpenBooking(selectedField, index, day.date)"
            >
              +
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
  <!-- Dialog -->
  <v-dialog v-model="isDialogOpen" max-width="500px" height="800px">
    <v-card height="100%">
      <v-card-title id="title-model" class="d-flex justify-space-between"
        >Đặt sân bóng
        <v-btn
          size="small"
          icon
          @click="isDialogOpen = false"
          variant="text"
          class="close-btn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="mt-4">
        <v-form @submit.prevent="handleBooking">
          <v-row>
            <!-- Hiển thị ngày booking -->
            <v-col cols="6">
              <v-date-input
                class="date-picker"
                v-model="selectedDateForm"
                label="Chọn ngày"
                prepend-icon="mdi-calendar"
                clearable
                variant="outlined"
              ></v-date-input>
            </v-col>

            <!-- Hiển thị tên sân booking -->
            <v-col cols="6">
              <v-select
                v-model="bookingDetails.field"
                :items="fields"
                item-title="name"
                item-value="id"
                label="Chọn sân"
                variant="outlined"
                @update:model-value="calculateEndTime"
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="">
              <v-select
                v-model="bookingDetails.start_time"
                :items="availableStartTimes"
                label="Giờ bắt đầu"
                @update:model-value="calculateEndTime"
              ></v-select>
            </v-col>
            <v-col cols="">
              <v-select
                v-model="bookingDetails.end_time"
                :items="availableEndTimes"
                label="Giờ kết thúc"
                @update:model-value="calculateEndTime"
              ></v-select>
            </v-col>
          </v-row>
          <v-row v-if="errorMessage" class="">
            <v-col cols="12" class="">
              <v-alert
                icon="mdi-alert-circle-outline"
                class="text-red-darken-2 p-1"
                >{{ errorMessage }}</v-alert
              >
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="bookingDetails.cost"
                label="Tiền phí"
                variant="outlined"
                readonly
                suffix="VND"
              >
              </v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                v-model="bookingDetails.deposit"
                label="Tiền cọc"
                variant="outlined"
                readonly
                suffix="VND"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-combobox
              v-model="bookingDetails.user.phone"
              :items="users"
              item-title="phone"
              item-value="id"
              label="Chọn người dùng (hoặc nhập sđt)"
              variant="outlined"
              clearable
              @update:model-value="onUserSelect"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item class="text-caption" v-bind="props">
                  <v-icon
                    class="me-2"
                    v-if="item.raw.vip === '1'"
                    color="amber-lighten-1"
                    icon="mdi-star"
                  ></v-icon>
                  {{ item.raw.name }} - {{ item.raw.email }}
                </v-list-item>
                <hr />
              </template>
            </v-combobox>
          </v-row>
          <v-row>
            <v-text-field
              v-model="bookingDetails.user.name"
              label="Tên người khách hàng"
              variant="outlined"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-radio-group v-model="bookingDetails.paymentMethod" row>
                <p>Lựa chọn thanh toán</p>
                <v-radio label="Thanh toán hết" value="full"></v-radio>
                <v-radio label="Đặt cọc" value="partial"></v-radio>
                <v-radio
                  v-if="bookingDetails.user.vip === '1'"
                  label="Không cần thanh toán (chỉ dành cho khách V.I.P)"
                  value="none"
                ></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

          <v-row v-if="bookingDetails.paymentMethod !== 'none'">
            <v-col cols="12">
              <v-radio-group v-model="bookingDetails.paymentType" row>
                <p>Phương thức thanh toán</p>
                <v-radio label="Tiền mặt" value="direct"></v-radio>
                <v-radio value="zalopay">
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
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="outlined" color="primary" @click="handleBooking">
          <span
            v-if="
              bookingDetails.paymentMethod === 'full' &&
              bookingDetails.paymentType === 'direct'
            "
            >Trả tiền mặt</span
          >
          <span
            v-if="
              bookingDetails.paymentMethod === 'full' &&
              bookingDetails.paymentType !== 'direct'
            "
            >Thanh toán online</span
          >
          <span
            v-else-if="
              bookingDetails.paymentMethod === 'partial' &&
              bookingDetails.paymentType === 'direct'
            "
            >Đặt cọc tiền mặt</span
          >
          <span
            v-else-if="
              bookingDetails.paymentMethod === 'partial' &&
              bookingDetails.paymentType !== 'direct'
            "
            >Đặt cọc online</span
          >
          <span v-else-if="bookingDetails.paymentMethod === 'none'"
            >Đặt sân</span
          >
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import fieldService from "../../services/fieldService";
import bookingService from "../../services/bookingService";
import userService from "../../services/userService";
import paymentService from "../../services/paymentService";
import { VDateInput } from "vuetify/labs/VDateInput";
import { showNotification } from "../../utils/notification";
// import BookingDialog from "./BookingDialog.vue";

const router = useRouter();

// State variables
const users = ref([]);
const fields = ref([]);
const bookings = ref({});
const isDialogOpen = ref(false);
const selectedSlot = ref(null);
const selectedDate = ref(new Date());
const selectedDateForm = ref(new Date());
const selectedField = ref(null);
const errorMessage = ref("");
const bookingTypes = ref([
  { title: "All", value: "all" },
  { title: "Failed Booking", value: "failed" },
]);

const selectedBookingType = ref("all");

// Booking details
const bookingDetails = ref({
  user: { name: "", user_id: "", phone: "", email: "", vip: "" },
  start_time: "",
  end_time: "",
  field: null,
  booking_date: null,
  duration: null,
  cost: null,
  deposit: null,
  paymentMethod: "full",
  paymentType: "direct",
});

// Time slots
const timeSlots = Array.from(
  { length: 35 },
  (_, i) =>
    `${Math.floor(i / 2 + 6)
      .toString()
      .padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`
);

// Format currency
const formatCurrency = (value) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  return formatter.format(value).replace("₫", "");
};

// Calculate end time and costs
const calculateEndTime = (duration) => {
  errorMessage.value = "";
  const selectedField = fields.value.find(
    (field) => field.id === bookingDetails.value.field
  );

  const fieldPrices = selectedField.prices.filter((price) => {
    const [startHour, startMinute] = bookingDetails.value.start_time.split(":");
    const [endHour, endMinute] = bookingDetails.value.end_time.split(":");
    const start = new Date(0, 0, 0, parseInt(startHour), parseInt(startMinute));
    const end = new Date(0, 0, 0, parseInt(endHour), parseInt(endMinute));

    return (
      (start.getTime() >=
        new Date(0, 0, 0, ...parseTime(price.start_time)).getTime() &&
        start.getTime() <
          new Date(0, 0, 0, ...parseTime(price.end_time)).getTime()) ||
      (end.getTime() >
        new Date(0, 0, 0, ...parseTime(price.start_time)).getTime() &&
        end.getTime() <=
          new Date(0, 0, 0, ...parseTime(price.end_time)).getTime()) ||
      (start.getTime() >=
        new Date(0, 0, 0, ...parseTime(price.start_time)).getTime() &&
        end.getTime() <=
          new Date(0, 0, 0, ...parseTime(price.end_time)).getTime())
    );
  });

  let totalPrice = 0;
  for (const price of fieldPrices) {
    const [startHour, startMinute] = bookingDetails.value.start_time.split(":");
    const [endHour, endMinute] = bookingDetails.value.end_time.split(":");
    const actualStart = new Date(
      0,
      0,
      0,
      parseInt(startHour),
      parseInt(startMinute)
    );
    const actualEnd = new Date(0, 0, 0, parseInt(endHour), parseInt(endMinute));

    const startMinutes = actualStart.getTime();
    const endMinutes = actualEnd.getTime();

    const minutesBooked = (endMinutes - startMinutes) / (1000 * 60);
    const priceForThisSlot = (minutesBooked / 60) * parseFloat(price.price);
    totalPrice += priceForThisSlot;
  }

  bookingDetails.value.cost = formatCurrency(totalPrice);
  bookingDetails.value.deposit = formatCurrency(totalPrice * 0.4);
};

// Parse time from string
const parseTime = (timeStr) => {
  return timeStr.split(":").map((t) => parseInt(t));
};

// Handle user selection
const onUserSelect = (input) => {
  if (input === null) return;

  const selectedUser = users.value.find(
    (user) => user.phone === input || user.phone === input.phone
  );

  if (selectedUser) {
    bookingDetails.value.user.name = selectedUser.name;
    bookingDetails.value.user.user_id = selectedUser.id;
    bookingDetails.value.user.vip = selectedUser.vip;
  } else {
    bookingDetails.value.user.user_id = "";
    bookingDetails.value.user.name = "";
  }
};

// Fetch customers
const fetchCustomers = async () => {
  const { data } = await userService.getCustomers();
  users.value = data.users;
};

// Fetch fields
const fetchFields = async () => {
  const { data } = await fieldService.getFields();
  fields.value = data;
  resetBookings();
};

// Reset bookings
const resetBookings = () => {
  bookings.value = fields.value.reduce(
    (acc, field) => ({
      ...acc,
      [field.id]: weekDays.value.reduce(
        (dayAcc, day) => ({
          ...dayAcc,
          [day.date]: Array(timeSlots.length).fill(null),
        }),
        {}
      ),
    }),
    {}
  );
};

const fetchBookings = async () => {
  resetBookings();
  const isFailedBooking = selectedBookingType.value === "failed";

  try {
    if (selectedField.value) {
      const datas = await Promise.all(
        weekDays.value.map((day) =>
          isFailedBooking
            ? bookingService.getFailBookings(day.date)
            : bookingService.getBookings(day.date)
        )
      );

      // Ghi lại dữ liệu để kiểm tra
      console.log(datas);

      weekDays.value.forEach((day, index) => {
        const response = datas[index]; // Lấy phản hồi tương ứng với ngày

        // Lấy mảng từ thuộc tính data
        const data = response.data;

        if (!Array.isArray(data)) {
          console.error("Dữ liệu mong đợi là một mảng nhưng nhận được:", data);
          return; // Bỏ qua nếu dữ liệu không phải là mảng
        }

        data.forEach((booking) => {
          if (booking.field_id === selectedField.value) {
            const startIndex = timeSlots.findIndex(
              (time) => time === booking.start_time.slice(0, 5)
            );
            const endIndex = timeSlots.findIndex(
              (time) => time === booking.end_time.slice(0, 5)
            );

            if (startIndex !== -1 && endIndex !== -1) {
              for (let i = startIndex; i < endIndex; i++) {
                if (!bookings.value[selectedField.value][day.date]) {
                  bookings.value[selectedField.value][day.date] = Array(
                    timeSlots.length
                  ).fill(null);
                }
                bookings.value[selectedField.value][day.date][i] = booking;
              }
            }
          }
        });
      });
    } else {
      const response = await (isFailedBooking
        ? bookingService.getFailBookings(getLocalDate(selectedDate.value))
        : bookingService.getBookings(getLocalDate(selectedDate.value)));

      // Lấy mảng từ thuộc tính data
      const data = response.data;

      console.log(data);

      if (!Array.isArray(data)) {
        console.error("Dữ liệu mong đợi là một mảng nhưng nhận được:", data);
        return; // Thoát nếu dữ liệu không phải là mảng
      }

      data.forEach((booking) => {
        const fieldId = booking.field_id;
        const startIndex = timeSlots.findIndex(
          (time) => time === booking.start_time.slice(0, 5)
        );
        const endIndex = timeSlots.findIndex(
          (time) => time === booking.end_time.slice(0, 5)
        );

        if (startIndex !== -1 && endIndex !== -1) {
          for (let i = startIndex; i < endIndex; i++) {
            if (!bookings.value[fieldId][getLocalDate(selectedDate.value)]) {
              bookings.value[fieldId][getLocalDate(selectedDate.value)] = Array(
                timeSlots.length
              ).fill(null);
            }
            bookings.value[fieldId][getLocalDate(selectedDate.value)][i] =
              booking;
          }
        }
      });
    }
  } catch (error) {
    console.error("Lỗi khi lấy đặt chỗ:", error);
  }
};

// Handle booking modal open
const handleOpenBooking = (fieldId, index, date) => {
  errorMessage.value = "";
  fetchCustomers();
  selectedDateForm.value = selectedDate.value;
  selectedSlot.value = { fieldId, index, date };
  bookingDetails.value = {
    user: { name: "", user_id: "" },
    start_time: timeSlots[index],
    end_time: timeSlots[index + 1],
    field: fieldId,
    booking_date: date || getLocalDate(selectedDate.value),
    paymentMethod: "full",
    paymentType: "direct",
  };
  calculateEndTime();
  isDialogOpen.value = true;
};

// Get local date in YYYY-MM-DD format
const getLocalDate = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().substr(0, 10);
};

// Handle booking submission
const handleBooking = async () => {
  if (selectedSlot.value) {
    const bookingData = {
      field_id: bookingDetails.value.field,
      booking_date:
        selectedSlot.value.date || getLocalDate(selectedDateForm.value),
      start_time: bookingDetails.value.start_time,
      end_time: bookingDetails.value.end_time,
      user_name: bookingDetails.value.user.name,
      user_id: bookingDetails.value.user.user_id,
      user_phone: bookingDetails.value.user.phone,
      deposit: bookingDetails.value.cost * 0.4,
      payment_method: bookingDetails.value.paymentMethod,
      payment_type: bookingDetails.value.paymentType,
    };

    if (bookingDetails.value.paymentType === "zalopay") {
      try {
        console.log(bookingData);
        const zaloPayResult = await paymentService.createZalopay(bookingData);
        const qr_url = zaloPayResult.data.zalopay.order_url;

        const popup = window.open(qr_url, "_blank", "width=500,height=600");

        // Check if the popup was successfully created
        if (popup) {
          const timer = setInterval(() => {
            if (popup.closed) {
              clearInterval(timer);
              // Continue with the next steps after the window is closed
              fetchBookings();
              isDialogOpen.value = false;

              showNotification({
                title: "Thông báo",
                message: "Đã tạo booking thành công",
                type: "success",
              });
            }
          }, 500); // Check every 500ms
        } else {
          console.error("Popup was blocked or failed to open.");
        }
      } catch (error) {
        console.error("Error creating ZaloPay payment:", error);
      }
    } else {
      try {
        await bookingService.createBooking(bookingData);
        fetchBookings();
        isDialogOpen.value = false;
        showNotification({
          title: "Thông báo",
          message: "Đã tạo booking thành công",
          type: "success",
        });
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
  }
};

// Get booking for a specific slot
const getBookingForSlot = (fieldId, index, date) => {
  const bookingDate = date || getLocalDate(selectedDate.value);
  return bookings.value[fieldId] && bookings.value[fieldId][bookingDate]
    ? bookings.value[fieldId][bookingDate][index]
    : null;
};

// Check if booking starts at slot
const isBookingStart = (fieldId, index, date) => {
  const booking = getBookingForSlot(fieldId, index, date);
  return booking && booking.start_time.slice(0, 5) === timeSlots[index];
};

// Get booking height for display
const getBookingHeight = (fieldId, index, date) => {
  const booking = getBookingForSlot(fieldId, index, date);
  if (booking) {
    const startIndex = timeSlots.indexOf(booking.start_time.slice(0, 5));
    const endIndex = timeSlots.indexOf(booking.end_time.slice(0, 5));
    const finalEndIndex = endIndex === -1 ? timeSlots.length : endIndex;
    return (finalEndIndex - startIndex) * 48;
  }
  return 48;
};

// Computed field options
const fieldOptions = computed(() => {
  return [{ id: null, name: "All Fields" }, ...fields.value];
});

// Filtered fields
const filteredFields = computed(() => {
  let filtered = fields.value;
  if (selectedField.value) {
    filtered = filtered.filter((field) => field.id === selectedField.value);
  }
  return filtered;
});

// Navigation functions for date
const previousDay = () => {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() - 1);
  selectedDate.value = date;
};

const nextDay = () => {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() + 1);
  selectedDate.value = date;
};

const previousWeek = () => {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() - 7);
  selectedDate.value = date;
};

const nextWeek = () => {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() + 7);
  selectedDate.value = date;
};

const setToday = () => {
  selectedDate.value = new Date();
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
};

// Available end times computed property
const availableEndTimes = computed(() => {
  if (!bookingDetails.value.start_time) return [];
  const startIndex = timeSlots.indexOf(bookingDetails.value.start_time);
  let endTimes = timeSlots.slice(startIndex + 1);

  // Add 23:00 to end times if not present
  if (!endTimes.includes("23:00")) {
    endTimes.push("23:00");
  }

  return endTimes;
});

// Check if time slot is past
const isPastTime = (slotIndex, date) => {
  const currentDateTime = new Date();
  const slotDateTime = new Date(date);
  const [hour, minute] = timeSlots[slotIndex].split(":");

  slotDateTime.setHours(parseInt(hour));
  slotDateTime.setMinutes(parseInt(minute));

  return slotDateTime < currentDateTime;
};

// Available start times computed property
const availableStartTimes = computed(() => {
  return timeSlots;
});

// Computed week days
const weekDays = computed(() => {
  const days = [];
  const startOfWeek = getStartOfWeek(selectedDate.value);
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    days.push({
      date: getLocalDate(date),
      name: date.toLocaleString("default", { weekday: "short" }),
    });
  }
  return days;
});

// Get start of the week
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};
const viewBookingDetail = (id) => {
  router.push({ name: "BookingDetail", params: { id: id } });
};

// Watchers
watch([selectedDate, selectedField], () => {
  fetchBookings();
});

// Lifecycle hook
onMounted(() => {
  fetchFields();
  fetchBookings();
});
</script>

<style scoped>
.booking-block {
  z-index: 2;
  padding: 4px;
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  border-radius: 5px;
  border: 1px solid #ccc !important;
  /* border: 1px solid transparent; */
  margin-left: 1px;
  overflow: hidden;
  transition: transform 0.7s, box-shadow 0.7s;
  height: auto;
}

.booking-block:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  overflow: visible;
  height: calc(100% + 196px) !important;
  z-index: 10 !important;
}

.booking-content {
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  flex-direction: column;
  justify-content: flex-start;
  color: #1f1e1e;
}

/* Color booking status */
.status-paid {
  background-color: lightgreen; /*"Đã thanh toán" */
}

.status-booked {
  background-color: lightblue; /*"Đã đặt" */
}

.status-deposit {
  background-color: lightyellow; /*"Đã cọc" */
}

.status-cancelled {
  background-color: lightcoral; /* Color for "Hủy" */
}
#table-booking,
#table-booking-week {
  height: 1800px;
  overflow: hidden;
}

#table-booking tr,
#table-booking-week tr {
  height: 48px;
}

#table-booking td,
#table-booking-week td {
  position: relative;
  height: 48px;
}

#table-booking tbody tr:last-child,
#table-booking-week tbody tr:last-child {
  display: none;
}

.time-line {
  width: 50px;
}

#title-model {
  background-color: #00796b;
  color: white;
}

.date-picker {
  z-index: 10;
}

#table-booking-week td {
  width: calc(100% / 8);
}
</style>