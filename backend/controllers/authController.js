const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Employee = require("../models/Employee");


/*
 * LOGIN
 */
const login = async (req, res) => {
    try {

        const { email, password } = req.body;
        // --------------------------------
        // Validate request
        // --------------------------------

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        // --------------------------------
        // Find employee
        // --------------------------------

        const employee = await Employee.findOne({
            email: normalizedEmail
        });

        if (!employee) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // --------------------------------
        // Check password field
        // --------------------------------

        if (!employee.password) {
            return res.status(500).json({
                success: false,
                message:
                    "Password is not configured for this account."
            });
        }

        // --------------------------------
        // Compare password
        // --------------------------------

        const passwordMatched =
            await bcrypt.compare(
                password,
                employee.password
            );

        if (!passwordMatched) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // --------------------------------
        // Check account status
        // --------------------------------

        if (employee.isActive === false) {

            return res.status(403).json({
                success: false,
                message: "Your account is inactive."
            });
        }

        // --------------------------------
        // Create JWT
        // --------------------------------

        const token = jwt.sign(
            {
                id: employee._id,
                employeeId: employee.employeeId,
                email: employee.email,
                role: employee.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        // --------------------------------
        // Response
        // --------------------------------

        return res.status(200).json({

            success: true,

            message: "Login successful.",

            token,

            user: {

                id: employee._id,

                employeeId:
                    employee.employeeId,

                name:
                    employee.name,

                email:
                    employee.email,
                
                designation: 
                    employee.designation,

                department: 
                    employee.department,

                role:
                    employee.role,

                isActive:
                    employee.isActive
            }
        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
};


/*
 * GET CURRENT USER
 */
const getMe = async (req, res) => {

    try {

        return res.status(200).json({
            success: true,
            employee: req.user
        });

    } catch (error) {

        console.error(
            "Get current user error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

/*
=========================================
CHANGE PASSWORD
=========================================
*/

const changePassword = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user.",
            });
        }

        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = req.body;

        // -----------------------------------------------
        // VALIDATION
        // -----------------------------------------------

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "All password fields are required.",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password and confirm password do not match.",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must contain at least 8 characters.",
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be different from your current password.",
            });
        }

        // -----------------------------------------------
        // FIND USER
        // -----------------------------------------------

        const user = await Employee.findById(userId).select(
            "+password"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found.",
            });
        }

        // -----------------------------------------------
        // CHECK CURRENT PASSWORD
        // -----------------------------------------------

        const passwordMatched = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatched) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect.",
            });
        }

        // -----------------------------------------------
        // HASH NEW PASSWORD
        // -----------------------------------------------

        const hashedPassword = await bcrypt.hash(
            newPassword,
            12
        );

        user.password = hashedPassword;

        await user.save();

        // -----------------------------------------------
        // RESPONSE
        // -----------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });

    } catch (error) {
        console.error(
            "Change password error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to change password.",
        });
    }
};

module.exports = {
    login,
    getMe,
    changePassword,
};