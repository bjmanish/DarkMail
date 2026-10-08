import axios from "axios";


/* =========================================================
   AXIOS INSTANCE
========================================================= */

const api = axios.create({

    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://localhost:3000/api",

    headers: {
        "Content-Type": "application/json"
    }

});


/* =========================================================
   GET JWT TOKEN
========================================================= */

const getAuthToken = () => {

    try {

        const token =
            localStorage.getItem(
                "darkmail_auth"
            );

        if (!token) {
            return null;
        }

        /*
         * AuthContext stores the JWT directly:
         *
         * localStorage.setItem(
         *     "darkmail_auth",
         *     receivedToken
         * );
         *
         * Therefore the returned value is already
         * the JWT token.
         */

        return token.trim();

    } catch (error) {

        console.error(
            "Unable to get authentication token:",
            error
        );

        return null;
    }
};


/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(

    (config) => {

        const token =
            getAuthToken();


        /*
         * Always make sure headers exist.
         */

        config.headers =
            config.headers || {};


        /*
         * Add JWT Authorization header.
         */

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

            /*
             * Debug only.
             *
             * Do NOT print the complete JWT.
             */

            // console.log(
            //     "🔐 Bearer token attached:",
            //     `${token.substring(0, 20)}...`
            // );

        } else {

            console.warn(
                "⚠️ DarkMail JWT token not found."
            );

        }


        /*
         * Debug request.
         */

        // console.log(
        //     "📡 API Request:",
        //     config.method?.toUpperCase(),
        //     `${config.baseURL || ""}${config.url}`
        // );


        return config;

    },

    (error) => {

        console.error(
            "❌ Request interceptor error:",
            error
        );

        return Promise.reject(error);
    }

);


/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        console.error(
            "❌ API Error:",
            error?.response?.status
        );


        /*
         * Blob responses need special handling because
         * error.response.data can be a Blob.
         */

        if (
            error?.response?.data instanceof Blob
        ) {

            console.error(
                "❌ API Error returned as Blob"
            );

        } else {

            console.error(
                "❌ API Error Response:",
                error?.response?.data
            );

        }


        return Promise.reject(error);
    }

);


export default api;