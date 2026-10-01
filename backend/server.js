require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

const startServer = async () => {

    try {

        await connectDB();

        app.listen(PORT, () => {

            console.log("--------------------------------");
            console.log("      DARKMAIL BACKEND");
            console.log("--------------------------------");
            console.log(`Server: ${process.env.VITE_API_URL}`);
            console.log(`API:    ${process.env.VITE_API_URL}/api`);
            console.log("--------------------------------");

        });

    } catch (error) {

        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);
    }
};

startServer();