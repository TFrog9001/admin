import api from "../axios/api";

const roleService = {
    /**
     * Lấy danh sách vai trò
     */
    async getRoles() {
        try {
            const response = await api.get('/roles');
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy danh sách vai trò:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách quyền
     */
    async getPermissions() {
        try {
            const response = await api.get('/permissions');
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy danh sách quyền:', error);
            throw error;
        }
    },

    /**
     * Lấy thông tin vai trò theo ID
     */
    async getRoleById(id) {
        try {
            const response = await api.get(`/roles/${id}`);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy thông tin vai trò:', error);
            throw error;
        }
    },

    /**
     * Tạo vai trò mới
     */
    async createRole(role) {
        try {
            const response = await api.post('/roles', role);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi tạo vai trò:', error);
            throw error;
        }
    },

    /**
     * Cập nhật vai trò
     */
    async updateRole(id, role) {
        try {
            const response = await api.post(`/roles/${id}`, role);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi cập nhật vai trò:', error);
            throw error;
        }
    },

    /**
     * Xóa vai trò
     */
    async deleteRole(id) {
        try {
            const response = await api.delete(`/roles/${id}`);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi xóa vai trò:', error);
            throw error;
        }
    },

    /**
     * Gán quyền cho vai trò
     */
    async assignPermissions(roleId, permissions) {
        try {
            const response = await api.post(`/roles/${roleId}/permissions`, { permissions });
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi gán quyền cho vai trò:', error);
            throw error;
        }
    },

    /**
     * Thu hồi quyền từ vai trò
     */
    async revokePermissions(roleId, permissions) {
        try {
            const response = await api.post(`/roles/${roleId}/revoke-permissions`, { permissions });
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi thu hồi quyền từ vai trò:', error);
            throw error;
        }
    }
}

export default roleService;
