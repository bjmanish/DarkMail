const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const messageRoutes = require("./routes/messages");

const app = express();

/* =========================================================
   CORS CONFIGURATION
========================================================= */

const allowedOrigins = [
    // Environment variable
    process.env.CLIENT_URL,

    // Local development
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    // Your current LAN frontend
    "http://172.16.21.189:5173",

    // Vercel frontend
    "https://dark-mail.vercel.app",
].filter(Boolean);


/* =========================================================
   CHECK WHETHER ORIGIN IS ALLOWED
========================================================= */

const isAllowedOrigin = (origin) => {

    // Requests without Origin
    // Example: Postman / curl / server-to-server
    if (!origin) {
        return true;
    }


    // Exact allowed origins
    if (allowedOrigins.includes(origin)) {
        return true;
    }


    /*
     * Allow localhost on any port
     *
     * Example:
     * http://localhost:5173
     * http://localhost:3000
     * http://localhost:8080
     */

    if (
        /^http:\/\/localhost:\d+$/.test(origin)
    ) {
        return true;
    }


    /*
     * Allow 127.0.0.1 on any port
     */

    if (
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    ) {
        return true;
    }


    /*
     * Allow private LAN IPs
     *
     * 192.168.x.x
     */

    if (
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(
            origin
        )
    ) {
        return true;
    }


    /*
     * Allow 172.16.x.x - 172.31.x.x
     *
     * Your current IP:
     * 172.16.21.189
     */

    if (
        /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/.test(
            origin
        )
    ) {
        return true;
    }


    /*
     * Allow 10.x.x.x
     */

    if (
        /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(
            origin
        )
    ) {
        return true;
    }


    return false;
};


/* =========================================================
   CORS MIDDLEWARE
========================================================= */

app.use(
    cors({
        origin: function (origin, callback) {

            if (isAllowedOrigin(origin)) {

                return callback(
                    null,
                    true
                );

            }


            console.log(
                "❌ CORS blocked origin:",
                origin
            );


            return callback(
                new Error(
                    `CORS policy blocked origin: ${origin}`
                )
            );

        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
        ],

        exposedHeaders: [
            "Content-Disposition",
        ],
    })
);


/* =========================================================
   BODY PARSERS
========================================================= */

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true,
    })
);


/* =========================================================
   API TEST
========================================================= */

app.get(
    "/api/test",
    (req, res) => {

        res.json({
            success: true,
            message: "DarkMail API is running",
        });

    }
);


/* =========================================================
   AUTH ROUTES
========================================================= */

app.use(
    "/api/auth",
    authRoutes
);


/* =========================================================
   EMPLOYEE ROUTES
========================================================= */

app.use(
    "/api/employees",
    employeeRoutes
);


/* =========================================================
   MESSAGE ROUTES
========================================================= */

app.use(
    "/api/messages",
    messageRoutes
);


/* =========================================================
   404 HANDLER
========================================================= */

app.use(
    (req, res) => {

        res.status(404).json({
            success: false,
            message: "API endpoint not found",
        });

    }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
    (err, req, res, next) => {

        console.error(
            "API Error:",
            err.message
        );


        /*
         * CORS error
         */

        if (
            err.message &&
            err.message.startsWith(
                "CORS policy blocked origin:"
            )
        ) {

            return res.status(403).json({
                success: false,
                message: err.message,
            });

        }


        return res.status(500).json({
            success: false,
            message:
                process.env.NODE_ENV ===
                "production"
                    ? "Internal server error"
                    : err.message,
        });

    }
);


/* =========================================================
   EXPORT APP
========================================================= */

module.exports = app;