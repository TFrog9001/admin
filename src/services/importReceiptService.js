import api from "../axios/api";
//importReceiptService.getReceiptById
const importReceiptService = {
    async getReceipts() {
        try {
            // console.log(params.current_page, params.pagesize);

            const response = await api.get('/import-receipts')
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy danh sách phiếu nhập', error);
            throw error;
        }
    },
    async getReceiptById(id) {
        try {
            const response = await api.get(`/import-receipts/${id}`)
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy phiếu nhập', error);
            throw error;
        }
    },
    async createReceipt(data) {
        try {

            const response = await api.post('/import-receipts', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            console.error('Có lỗi khi tạo phiếu nhập', error);
            throw error;
        }
    },

    async updateReceipt(id, data) {

        try {
            const response = await api.post(`/import-receipts/${id}`, data);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy phiếu nhập', error);
            throw error;
        }
    },
    async deleteReceipt(id) {
        try {
            const response = await api.delete(`/import-receipts/${id}`)
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy khi xóa phiếu nhập', error);
            throw error;
        }
    },
}

export default importReceiptService;
