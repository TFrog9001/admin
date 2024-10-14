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
}

export default equipmentService;
