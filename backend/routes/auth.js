const express = require("express");

const {
    login,
    getMe,
    changePassword,
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