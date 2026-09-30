const nodemailer = require("nodemailer");


const createTransporter = () => {

    if (!process.env.SMTP_HOST) {
        throw new Error(
            "SMTP_HOST is missing"
        );
    }

    if (!process.env.SMTP_PORT) {
        throw new Error(
            "SMTP_PORT is missing"
        );
    }

    if (!process.env.SMTP_USER) {
        throw new Error(
            "SMTP_USER is missing"
        );
    }

    if (!process.env.SMTP_PASS) {
        throw new Error(
            "SMTP_PASS is missing"
        );
    }


    return nodemailer.createTransport({

        host:
            process.env.SMTP_HOST,

        port:
            Number(
                process.env.SMTP_PORT
            ),

        secure:
            String(
                process.env.SMTP_SECURE ||
                "false"
            ).toLowerCase() ===
            "true",

        auth: {

            user:
                process.env.SMTP_USER,

            pass:
                process.env.SMTP_PASS

        }

    });
};


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

    const transporter =
        createTransporter();


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


    console.log(
        "SMTP SEND:",
        {
            from:
                mailOptions.from,

            to:
                mailOptions.to,

            cc:
                mailOptions.cc,

            bcc:
                mailOptions.bcc,

            subject:
                mailOptions.subject
        }
    );


    const info =
        await transporter.sendMail(
            mailOptions
        );


    console.log(
        "SMTP EMAIL SENT:",
        info.messageId
    );


    return info;
};


module.exports = {
    sendEmail
};