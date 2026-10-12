// backend/services/emailService.js

const nodemailer = require("nodemailer");

/*
 * CREATE SMTP TRANSPORTER
 */
const createTransporter = () => {
    const requiredEnv = [
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASS"
    ];

    for (const key of requiredEnv) {
        if (!process.env[key]) {
            throw new Error(`${key} is missing`);
        }
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),

        secure:
            String(process.env.SMTP_SECURE || "false")
                .toLowerCase() === "true",

        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

/*
 * GENERIC EMAIL FUNCTION
 * Used by existing message/email functionality.
 */

const sendEmail = async ({
    from,
    to = [],
    cc = [],
    bcc = [],
    subject = "",
    text = "",
    html = "",
    attachments = []
}) => {
    const transporter = createTransporter();

    try {
        // Check SMTP connectivity and authentication.
        await transporter.verify();

        const mailOptions = {
            from:
                from ||
                process.env.SMTP_FROM ||
                process.env.SMTP_USER,
            to,
            cc,
            bcc,
            subject,
            text,
            html,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Email accepted by SMTP server:", {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected
        });

        return info;
    } catch (error) {
        console.error("SMTP email sending failed:", {
            message: error.message,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response
        });

        throw error;
    }
};

/*
 * SEND WELCOME EMAIL TO EMPLOYEE'S PERSONAL EMAIL
 */
const sendMailtoPersonalMail = async ({
    name,
    to,
    employeeId,
    workEmail,
    department = "",
    designation = ""
}) => {
    if (!to || !String(to).trim()) {
        throw new Error("Employee personal email is required");
    }

    if (!employeeId || !workEmail) {
        throw new Error(
            "Employee ID and company email are required"
        );
    }

    const safeName = escapeHtml(name || "Employee");
    const safeEmployeeId = escapeHtml(employeeId);
    const safeWorkEmail = escapeHtml(workEmail);
    const safeDepartment = escapeHtml(department || "Not specified");
    const safeDesignation = escapeHtml(designation || "Not specified");

    const subject = "Welcome to DarkMail - Employee Account Created";

    const text = `
        Hello ${name || "Employee"},

        Welcome to DarkMail!

        Your employee account has been created successfully.

        Employee ID: ${employeeId}
        Company Email: ${workEmail}
        Department: ${department || "Not specified"}
        Designation: ${designation || "Not specified"}

        You can now sign in to DarkMail using your company email and the
        login credentials provided to you by your administrator.

        For security, do not share your password with anyone.

        Regards,
        DarkMail Administration
        `;

            const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Welcome to DarkMail</title>
        </head>
        <body style="
            margin:0;
            padding:24px;
            background:#f3f4f6;
            font-family:Arial,Helvetica,sans-serif;
            color:#111827;
        ">
            <div style="
                max-width:600px;
                margin:0 auto;
                background:#ffffff;
                border:1px solid #e5e7eb;
                border-radius:14px;
                overflow:hidden;
            ">
                <div style="
                    background:#111827;
                    padding:26px;
                    color:#ffffff;
                ">
                    <h1 style="margin:0;font-size:25px;">
                        Welcome to DarkMail!
                    </h1>
                    <p style="margin:10px 0 0;color:#d1d5db;">
                        Your employee account is ready.
                    </p>
                </div>

                <div style="padding:28px;">
                    <p>Hello ${safeName},</p>

                    <p>
                        Your employee account has been created successfully.
                        Here are your account details:
                    </p>

                    <div style="
                        background:#f9fafb;
                        border:1px solid #e5e7eb;
                        border-radius:10px;
                        padding:18px;
                        line-height:1.8;
                    ">
                        <p style="margin:0;">
                            <strong>Employee ID:</strong>
                            ${safeEmployeeId}
                        </p>

                        <p style="margin:0;">
                            <strong>Company Email:</strong>
                            ${safeWorkEmail}
                        </p>

                        <p style="margin:0;">
                            <strong>Department:</strong>
                            ${safeDepartment}
                        </p>

                        <p style="margin:0;">
                            <strong>Designation:</strong>
                            ${safeDesignation}
                        </p>
                    </div>

                    <p>
                        You can sign in to DarkMail using your company email
                        and the login credentials provided by your administrator.
                    </p>

                    <p style="
                        padding:12px;
                        background:#fff7ed;
                        color:#9a3412;
                        border-radius:8px;
                        font-size:13px;
                    ">
                        Security reminder: Never share your password with anyone.
                    </p>

                    <p>
                        Regards,<br />
                        <strong>DarkMail Administration</strong>
                    </p>
                </div>

                <div style="
                    padding:14px 28px;
                    background:#f9fafb;
                    color:#6b7280;
                    font-size:12px;
                ">
                    This is an automated email from DarkMail.
                </div>
            </div>
        </body>
        </html>
        `;

    return sendEmail({
        to: String(to).trim().toLowerCase(),
        subject,
        text,
        html
    });
};

/*
 * ESCAPE HTML VALUES TO PREVENT HTML INJECTION
 */
function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

module.exports = {
    sendEmail,
    sendMailtoPersonalMail
};