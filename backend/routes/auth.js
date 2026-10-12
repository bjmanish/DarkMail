const express = require("express");

const {
    login,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const {
    authMiddleware
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * POST /api/auth/login
 */
router.post("/login", login);

/*
 * POST /api/auth/forgot-password
 * Public endpoint
 */
router.post("/forgot-password", forgotPassword);

/*
 * POST /api/auth/reset-password/:token
 * Public endpoint; token authorizes the reset
 */
router.post("/reset-password/:token", resetPassword);

/*
 * GET /api/auth/me
 */
router.get("/me", authMiddleware, getMe);

/*
 * POST /api/auth/change-password
 */
router.post(
    "/change-password",
    authMiddleware,
    changePassword
);

module.exports = router;