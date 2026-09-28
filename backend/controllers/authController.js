const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Employee = require("../models/Employee");


/*
 * LOGIN
 */
const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email
            .trim()
            .toLowerCase();

        const employee = await Employee.findOne({
            email: normalizedEmail
        });

        if (!employee) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!employee.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            employee.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        /*
         * UPDATE LAST LOGIN
         */
        employee.lastLogin = new Date();

        await employee.save();


        /*
         * CREATE JWT
         */
        const token = jwt.sign(
            {
                id: employee._id.toString(),
                role: employee.role,
                employeeId: employee.employeeId
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );


        /*
         * RESPONSE
         */
        return res.status(200).json({
            success: true,
            message: "Login successful",

            token,

            user: {
                id: employee._id,
                employeeId: employee.employeeId,
                name: employee.name,
                email: employee.email,
                personalEmail: employee.personalEmail,
                role: employee.role,
                department: employee.department,
                designation: employee.designation,
                hireDate: employee.hireDate,
                isActive: employee.isActive,
                lastLogin: employee.lastLogin
            }
        });

    } catch (error) {

        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
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

module.exports = {
    login,
    getMe
};