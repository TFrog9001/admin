import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Login from '../views/Login.vue';
import Admin from '../views/Admin.vue';
import NotFound from '../views/NotFound.vue';
import UserList from '../views/Users/UserList.vue';
import Fields from '../views/Fileds/Fields.vue';
import Test from '../views/Test.vue';
import FieldDetail from '../views/Fileds/FieldDetail.vue';
import Calendar from '../components/Calendar.vue';
import Booking from '../views/Booking/Booking.vue';
import BookingDetail from '../views/Booking/BookingDetail.vue';
import Supply from '../views/Supply/Supply.vue';
import Receipt from '../views/Receipt/Receipt.vue';
import ReceiptDetail from '../views/Receipt/ReceiptDetail.vue';
import ReceiptCreate from '../views/Receipt/ReceiptCreate.vue';
import Equipment from '../views/Equipment/Equipment.vue';
import History from '../views/Booking/History.vue';

const routes = [
    {
        path: '/',
        redirect: () => {
            const authStore = useAuthStore();
            return authStore.isAuthenticated ? { name: 'Admin' } : { name: 'Login' };
        },
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    {
        path: '/dashboard',
        name: 'Admin',
        component: Admin,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/users',
        name: 'Users',
        component: UserList,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/fields',
        name: 'Fields',
        component: Fields,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/fields/create',
        name: 'FieldCreate',
        component: FieldDetail,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/fields/:id',
        name: 'FieldDetail',
        component: FieldDetail,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    
    {
        path: '/booking',
        name: 'Booking',
        component: Booking,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/history',
        name: 'History',
        component: History,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/booking/:id',
        name: 'BookingDetail',
        component: BookingDetail,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/supply',
        name: 'Supply',
        component: Supply,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    
    {
        path: '/equipment',
        name: 'Equipment',
        component: Equipment,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/receipt',
        name: 'Receipt',
        component: Receipt,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/receipt/create',
        name: 'ReceiptCreate',
        component: ReceiptDetail,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/receipt/:id',
        name: 'ReceiptDetail',
        component: ReceiptDetail,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/test',
        name: 'Test',
        component: Test,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/:catchAll(.*)',
        name: 'NotFound',
        component: NotFound,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next({ name: 'Login' });
    }
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        alert('Bạn không có quyền truy cập vào trang này.');
        return next({ name: 'Login' });
    }
    next();
});

export default router;
