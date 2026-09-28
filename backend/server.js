require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log("--------------------------------");
        console.log("      DARKMAIL BACKEND");
        console.log("--------------------------------");
        console.log(`Server: http://localhost:${PORT}`);
        console.log(`API:    http://localhost:${PORT}/api`);
        console.log("--------------------------------");
    });
};

startServer();