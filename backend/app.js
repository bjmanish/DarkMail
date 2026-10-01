const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const messageRoutes = require("./routes/messages");

const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "https://darkmail-frontend.vercel.app",
    "http://172.16.21.189:5173/",
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without Origin
            // such as Postman/server-to-server requests
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log(
                "CORS blocked origin:",
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
    })
);

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "DarkMail API is running"
    });

});


app.use("/api/auth", authRoutes);

app.use(
    "/api/employees",
    employeeRoutes
);

app.use(
    "/api/messages",
    messageRoutes
);


app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });

});


module.exports = app;