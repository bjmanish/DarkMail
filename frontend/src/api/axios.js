import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

console.log("baseURL: ",import.meta.env.VITE_API_URL);

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("darkmail_auth");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("darkmail_auth");
        }

        return Promise.reject(error);
    }
);

export default api;