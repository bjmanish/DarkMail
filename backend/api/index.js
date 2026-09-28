const app = require("../app");
const connectDB = require("../config/db");

let initialized = false;

const handler = async (req, res) => {

    try {

        if (!initialized) {

            await connectDB();

            initialized = true;

        }

        return app(req, res);

    } catch (error) {

        console.error(
            "Vercel API initialization error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Database connection failed",
            error:
                process.env.NODE_ENV === "production"
                    ? undefined
                    : error.message
        });

    }
};

module.exports = handler;