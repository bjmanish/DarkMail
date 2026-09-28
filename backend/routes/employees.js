const express = require("express");

const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const {
    authMiddleware,
    adminMiddleware
} = require("../middleware/authMiddleware");

const router = express.Router();


/*
 * All employee-management routes require:
 *
 * JWT + ADMIN
 */
router.use(authMiddleware);
router.use(adminMiddleware);


/*
 * GET /api/employees
 */
router.get("/", getEmployees);


/*
 * GET /api/employees/:id
 */
router.get("/:id", getEmployeeById);


/*
 * POST /api/employees
 */
router.post("/", createEmployee);


/*
 * PUT /api/employees/:id
 */
router.put("/:id", updateEmployee);


/*
 * DELETE /api/employees/:id
 */
router.delete("/:id", deleteEmployee);


module.exports = router;