const bcrypt = require("bcryptjs");

const Employee = require("../models/Employee");


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
            !password
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Employee ID, name, email and password are required"
            });
        }


        const normalizedEmail = email
            .trim()
            .toLowerCase();


        const normalizedEmployeeId = employeeId
            .trim()
            .toUpperCase();


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
         * CREATE EMPLOYEE
         */
        const employee = await Employee.create({

            employeeId: normalizedEmployeeId,

            name: name.trim(),

            email: normalizedEmail,

            personalEmail:
                personalEmail
                    ? personalEmail.trim().toLowerCase()
                    : "",

            password: hashedPassword,

            department:
                department
                    ? department.trim()
                    : "",

            designation:
                designation
                    ? designation.trim()
                    : "",

            hireDate:
                hireDate || null,

            role:
                role === "ADMIN"
                    ? "ADMIN"
                    : "USER",

            isActive: true
        });


        /*
         * REMOVE PASSWORD
         */
        const responseEmployee =
            employee.toObject();

        delete responseEmployee.password;


        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            employee: responseEmployee
        });

    } catch (error) {

        console.error("Create employee error:", error);

        if (error.code === 11000) {

            return res.status(409).json({
                success: false,
                message: "Employee ID or email already exists"
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