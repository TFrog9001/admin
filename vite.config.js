import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  // Sử dụng loadEnv để nạp biến môi trường
  const env = loadEnv(mode, process.cwd(), "");
  const baseURL = env.VITE_BASE_URL;

  return {
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 3002,
      proxy: {
        "/api": {
          target: baseURL,
          changeOrigin: true,
        },
        "/broadcasting/auth": {
          target: baseURL,
          changeOrigin: true,
        },
        "/api/zalopay/callback": {
          target: "https://mlatbooking.loca.lt",
          changeOrigin: true,
        },
        "/api/zalopay/callbackbill": {
          target: "https://mlatbooking.loca.lt",
          changeOrigin: true,
        },
      },
    },
  };
});
