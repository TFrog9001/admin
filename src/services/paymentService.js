import api from "../axios/api";

const paymentSerice = {
    async createZalopay($bookingData) {
        try {
            const response = await api.post('/zalopay', $bookingData);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy khi thanh toán:', error);
            throw error;
        }
    },

    async createZalopayBill(bill_id) {
        try {
            const response = await api.post(`/zalopayBill`, { bill_id: bill_id });
            return response;
        } catch (error) {
            console.error('Có lỗi xảy khi thanh toán', error);
            throw error;
        }
    },

    async createPaypal(data) {
        return api.post("/paypal/order/create", data);
    },
    async capturePaypal(orderID) {
        return api.post("/paypal/order/capture", { orderID });
    },

    // async createPaypal(data) {
    //     return api.post("/paypal/payment", data);
    // },
    // async capturePaypal(orderID) {
    //     return api.post("/paypal/payment/capture", { orderID });
    // },
}

export default paymentSerice;
