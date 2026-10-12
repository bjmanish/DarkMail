const bcrypt = require("bcryptjs");

const Employee = require("../models/Employee");

const {
    sendMailtoPersonalMail
} = require("../services/emailService");

/*
 * GET ALL EMPLOYEES
 *
 * GET /api/employees
 */
const getEmployees = async (req, res) => {

    try {

        const employees = await Employee.find()
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: employees.length,
            employees
        });

    } catch (error) {

        console.error("Get employees error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch employees"
        });
    }
};


/*
 * GET SINGLE EMPLOYEE
 *
 * GET /api/employees/:id
 */
const getEmployeeById = async (req, res) => {

    try {

        const employee = await Employee.findById(
            req.params.id
        ).select("-password");

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            success: true,
            employee
        });

    } catch (error) {

        console.error("Get employee error:", error);

        return res.status(400).json({
            success: false,
            message: "Invalid employee ID"
        });
    }
};


/*
 * CREATE EMPLOYEE
 *
 * POST /api/employees
 */
const createEmployee = async (req, res) => {
    try {
        const {
            employeeId,
            name,
            email,
            personalEmail,
            password,
            department,
            designation,
            hireDate,
            role
        } = req.body;

        /*
         * REQUIRED FIELDS
         */
        if (
            !employeeId ||
            !name ||
            !email ||
            !personalEmail ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Employee ID, name, company email, personal email and password are required"
            });
        }

        /*
         * NORMALIZE INPUT
         */
        const normalizedEmployeeId =
            String(employeeId).trim().toUpperCase();

        const normalizedName =
            String(name).trim();

        const normalizedEmail =
            String(email).trim().toLowerCase();

        const normalizedPersonalEmail =
            String(personalEmail).trim().toLowerCase();

        if (
            !normalizedEmployeeId ||
            !normalizedName ||
            !normalizedEmail ||
            !normalizedPersonalEmail ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid employee details"
            });
        }

        /*
         * CHECK EMPLOYEE ID
         */
        const existingEmployeeId =
            await Employee.findOne({
                employeeId: normalizedEmployeeId
            });

        if (existingEmployeeId) {
            return res.status(409).json({
                success: false,
                message: "Employee ID already exists"
            });
        }

        /*
         * CHECK COMPANY EMAIL
         */
        const existingEmail =
            await Employee.findOne({
                email: normalizedEmail
            });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Company email already exists"
            });
        }

        /*
         * HASH PASSWORD
         */
        const hashedPassword =
            await bcrypt.hash(password, 12);

        /*
         * CREATE EMPLOYEE IN MONGODB
         */
        const employee = await Employee.create({
            employeeId: normalizedEmployeeId,
            name: normalizedName,
            email: normalizedEmail,
            personalEmail: normalizedPersonalEmail,
            password: hashedPassword,

            department: department
                ? String(department).trim()
                : "",

            designation: designation
                ? String(designation).trim()
                : "",

            hireDate: hireDate || null,

            role: role === "ADMIN"
                ? "ADMIN"
                : "USER",

            isActive: true
        });

        /*
         * SEND WELCOME EMAIL TO PERSONAL EMAIL
         *
         * Employee creation should not be rolled back
         * if SMTP delivery fails.
         */
        let emailSent = false;
        let emailMessage = "";

        try {
            const emailInfo = await sendMailtoPersonalMail({
                name: employee.name,
                to: employee.personalEmail,
                employeeId: employee.employeeId,
                workEmail: employee.email,
                department: employee.department,
                designation: employee.designation
            });

            emailSent = true;
            emailMessage = "Welcome email sent successfully";

            console.log(
                "Employee welcome email sent:",
                {
                    employeeId: employee.employeeId,
                    to: employee.personalEmail,
                    messageId: emailInfo.messageId
                }
            );
        } catch (emailError) {
            emailMessage =
                "Employee created, but welcome email could not be sent";

            console.error(
                "Welcome email failed:",
                {
                    employeeId: employee.employeeId,
                    error: emailError.message
                }
            );
        }

        /*
         * REMOVE PASSWORD FROM RESPONSE
         */
        const responseEmployee = employee.toObject();

        delete responseEmployee.password;

        /*
         * API RESPONSE
         */
        return res.status(201).json({
            success: true,

            message: emailSent
                ? "Employee created successfully and welcome email sent"
                : "Employee created successfully, but welcome email failed",

            employee: responseEmployee,

            email: {
                sent: emailSent,
                message: emailMessage
            }
        });
    } catch (error) {
        console.error("Create employee error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "Employee ID or company email already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create employee"
        });
    }
};


/*
 * UPDATE EMPLOYEE
 *
 * PUT /api/employees/:id
 */
const updateEmployee = async (req, res) => {

    try {

        const {
            name,
            personalEmail,
            department,
            designation,
            hireDate,
            role,
            isActive,
            password
        } = req.body;


        const employee =
            await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }


        if (name !== undefined) {
            employee.name = name.trim();
        }

        if (personalEmail !== undefined) {
            employee.personalEmail =
                personalEmail.trim().toLowerCase();
        }

        if (department !== undefined) {
            employee.department =
                department.trim();
        }

        if (designation !== undefined) {
            employee.designation =
                designation.trim();
        }

        if (hireDate !== undefined) {
            employee.hireDate = hireDate || null;
        }

        if (role !== undefined) {

            if (!["ADMIN", "USER"].includes(role)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid role"
                });
            }

            employee.role = role;
        }

        if (isActive !== undefined) {
            employee.isActive = Boolean(isActive);
        }


        /*
         * CHANGE PASSWORD
         */
        if (password) {

            if (password.length < 6) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Password must contain at least 6 characters"
                });
            }

            employee.password =
                await bcrypt.hash(password, 12);
        }


        await employee.save();


        const responseEmployee =
            employee.toObject();

        delete responseEmployee.password;


        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            employee: responseEmployee
        });

    } catch (error) {

        console.error("Update employee error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update employee"
        });
    }
};


/*
 * DELETE EMPLOYEE
 *
 * DELETE /api/employees/:id
 */
const deleteEmployee = async (req, res) => {

    try {

        const employee =
            await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }


        /*
         * Prevent admin deleting own account
         */
        if (
            employee._id.toString() ===
            req.user._id.toString()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "You cannot delete your own account"
            });
        }


        await Employee.findByIdAndDelete(
            req.params.id
        );


        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully"
        });

    } catch (error) {

        console.error("Delete employee error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete employee"
        });
    }
};


module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};