import axios from "axios";

const api = axios.create({

    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://localhost:3000/api",

    headers: {
        "Content-Type": "application/json"
    }
});

console.log(
    "baseURL:",
    api.defaults.baseURL
);

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

api.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("darkmail_auth");

        if (token) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {

        return Promise.reject(error);
    }
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

api.interceptors.response.use(

    (response) => {

        return response;
    },

    (error) => {

        console.error(
            "API Error:",
            error?.response?.status,
            error?.response?.data
        );

        return Promise.reject(error);
    }
);

export default api;