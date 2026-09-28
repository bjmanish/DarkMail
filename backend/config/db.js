const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {

    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    try {

        if (!process.env.MONGO_URI) {
            throw new Error(
                "MONGO_URI environment variable is missing"
            );
        }

        const connection = await mongoose.connect(
            process.env.MONGO_URI,
            {
                serverSelectionTimeoutMS: 10000
            }
        );

        isConnected =
            connection.connection.readyState === 1;

        console.log(
            `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`
        );

    } catch (error) {

        isConnected = false;

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        throw error;
    }
};

module.exports = connectDB;