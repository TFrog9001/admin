import api from "../axios/api";

const revenueService = {
    async fetchYearlyRevenue(year) {
        try {
            const response = await api.get(`/revenue?time=${year}`);
            return response.data;
        } catch (error) {
            console.error("Có lỗi xảy ra khi lấy thông tin doanh thu:", error);
            throw error;
        }
    },
};

export default revenueService;
