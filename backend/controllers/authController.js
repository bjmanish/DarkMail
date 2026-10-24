const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Employee = require("../models/Employee");
const { sendEmail } = require("../services/emailService");

/*
=========================================
LOGIN
=========================================
*/
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const employee = await Employee.findOne({
      email: normalizedEmail,
    });

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!employee.password) {
      return res.status(500).json({
        success: false,
        message: "Password is not configured for this account.",
      });
    }

    const passwordMatched = await bcrypt.compare(password, employee.password);

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (employee.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing.");
    }

    const token = jwt.sign(
      {
        id: employee._id,
        employeeId: employee.employeeId,
        email: employee.email,
        role: employee.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        designation: employee.designation,
        department: employee.department,
        role: employee.role,
        isActive: employee.isActive,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/*
=========================================
GET CURRENT USER
=========================================
*/
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      employee: req.user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
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

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 8 characters.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password.",
      });
    }

    const user = await Employee.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const passwordMatched = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordMatched) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);

    // Invalidate any outstanding reset link.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password.",
    });
  }
};

/*
=========================================
FORGOT PASSWORD
POST /api/auth/forgot-password
=========================================
*/
const forgotPassword = async (req, res) => {
  const genericResponse = {
    success: true,
    message:
      "If an account matches that email, password reset instructions will be sent to its registered email address.",
  };

  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim() || email.length > 254) {
      return res.status(200).json(genericResponse);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const employee = await Employee.findOne({
      email: normalizedEmail,
    });

    // Do not reveal whether an account exists.
    if (!employee || employee.isActive === false) {
      return res.status(200).json(genericResponse);
    }

    // Generate a cryptographically secure random token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the token hash in MongoDB.
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    employee.passwordResetToken = hashedToken;
    employee.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await employee.save();

    const clientUrl = process.env.CLIENT_URL;

    if (!clientUrl) {
      throw new Error("CLIENT_URL is missing.");
    }

    const resetUrl =
      `${clientUrl.replace(/\/+$/, "")}/reset-password/` +
      encodeURIComponent(resetToken);

    // Prefer the employee's stored personal email.
    // Fall back to the company email if no personal email exists.
    const destination = employee.personalEmail || employee.email;

    try {
      await sendEmail({
        to: destination,
        subject: "DarkMail - Password Reset Request",
        text: [
          `Hello ${employee.name || "Employee"},`,
          "",
          "We received a request to reset your DarkMail password.",
          "",
          "Open this link to choose a new password:",
          resetUrl,
          "",
          "This link expires in 15 minutes and can only be used once.",
          "If you did not request a password reset, you can ignore this email.",
          "",
          "DarkMail Administration",
        ].join("\n"),
        html: `
                    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#111827">
                        <h2>Reset your DarkMail password</h2>
                        <p>Hello ${escapeHtml(employee.name || "Employee")},</p>
                        <p>We received a request to reset your DarkMail password.</p>
                        <p>
                            <a href="${escapeHtml(resetUrl)}"
                               style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px">
                                Reset Password
                            </a>
                        </p>
                        <p>This link expires in <strong>15 minutes</strong> and can only be used once.</p>
                        <p>If you did not request this, ignore this email.</p>
                        <p>Regards,<br/>DarkMail Administration</p>
                    </div>
                `,
      });
    } catch (emailError) {
      // Do not leave a valid reset token when email delivery fails.
      employee.passwordResetToken = undefined;
      employee.passwordResetExpires = undefined;
      await employee.save();

      console.error("Password reset email failed:", emailError.message);

      // Return the same generic response to avoid account enumeration.
      return res.status(200).json(genericResponse);
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);

    // Keep the public response generic.
    return res.status(200).json(genericResponse);
  }
};

/*
=========================================
RESET PASSWORD
POST /api/auth/reset-password/:token
=========================================
*/
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link.",
      });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const employee = await Employee.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires +password");

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link.",
      });
    }

    employee.password = await bcrypt.hash(newPassword, 12);

    // Make the reset link unusable after a successful reset.
    employee.passwordResetToken = undefined;
    employee.passwordResetExpires = undefined;

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again.",
    });
  }
};

/*
=========================================
HTML ESCAPING
=========================================
*/
function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

module.exports = {
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};
