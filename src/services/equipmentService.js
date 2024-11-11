import api from "../axios/api";

const equipmentService = {
    async getEquipmentBySN(sn) {
        try {
            const response = await api.get(`/equipments/${sn}`)
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy thiết bị', error);
            throw error;
        }
    },

    async getEquipments() {
        try {
            const response = await api.get(`/equipments`)
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy thiết bị', error);
            throw error;
        }
    },
    async updateEquipment(id, data) {
        try {
            const response = await api.post(`/equipments/${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response;

        } catch (error) {
            console.error('Có lỗi xảy ra khi cập nhập sản phẩm', error);
            throw error;
        }
    },

    async deleteEquipment(id) {
        try {
            const response = await api.delete(`/equipments/${id}`);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi xóa sản phẩm', error);
            throw error;
        }
    }
}

export default equipmentService;
