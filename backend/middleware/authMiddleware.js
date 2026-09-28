const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const authMiddleware = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const token =
            authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token missing"
            });
        }

        if (!process.env.JWT_SECRET) {

            console.error(
                "JWT_SECRET is not configured"
            );

            return res.status(500).json({
                success: false,
                message: "Authentication configuration error"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const employee =
            await Employee.findById(decoded.id)
                .select("-password");

        if (!employee) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (!employee.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        req.user = employee;

        next();

    } catch (error) {

        console.error(
            "Authentication middleware error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Authentication failed"
        });
    }
};

const adminMiddleware = (req, res, next) => {

    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware
};