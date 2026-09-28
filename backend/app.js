const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const messageRoutes = require("./routes/messages");

const app = express();

app.use(
    cors({
        origin:
            process.env.CLIENT_URL ||
            "http://localhost:5173",
        credentials: true
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