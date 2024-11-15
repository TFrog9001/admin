import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notification", {
    state: () => ({
        notifications: [], // Danh sách thông báo
    }),
    actions: {
        addNotification(notification) {
            this.notifications.unshift(notification);
        },
        removeNotification(index) {
            this.notifications.splice(index, 1);
        },
        clearNotifications() {
            this.notifications = [];
        },
    },
});
