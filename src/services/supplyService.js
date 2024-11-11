import api from "../axios/api";

const supplyService = {
    async getSupplyBySN(sn) {
        try {
            const response = await api.get(`/supplies/${sn}`)
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy sản phẩm', error);
            throw error;
        }
    },

    async getSupplies() {
        try {
            const response = await api.get(`/supplies`);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy sản phẩm', error);
            throw error;
        }
    },

    async updateSupply(id, data) {
        try {
            const response = await api.post(`/supplies/${id}`, data, {
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

    async deleteSupply(id) {
        try {
            const response = await api.delete(`/supplies/${id}`);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi xóa sản phẩm', error);
            throw error;
        }
    }
}

export default supplyService;
