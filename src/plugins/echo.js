// src/plugins/echo.js
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import Cookies from 'js-cookie';


window.Pusher = Pusher;

const baseURL = `${import.meta.env.VITE_BASE_URL}/broadcasting/auth`;

const echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: "ap1",
    wsHost: window.location.hostname,
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    authEndpoint: baseURL,
    auth: {
        headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
        },
    },
});

export default echo;
