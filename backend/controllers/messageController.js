const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const Message = require("../models/Message");
const Employee = require("../models/Employee");

const { sendEmail } = require("../services/emailService");

/* =========================================================
   HELPERS
========================================================= */

const normalizeRecipients = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value
            .flatMap((item) => String(item).split(","))
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean);
    }

    return String(value)
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
};

const searchRecipients = async (req, res) => {

    try {

        const search =
            String(
                req.query.q || ""
            )
                .trim()
                .toLowerCase();


        if (!search) {

            return res.json({
                success: true,
                data: []
            });
        }


        const Employee =
            require("../models/Employee");


        const employees =
            await Employee.find({

                isActive: true,

                $or: [

                    {
                        name: {
                            $regex: search,
                            $options: "i"
                        }
                    },

                    {
                        email: {
                            $regex: search,
                            $options: "i"
                        }
                    },

                    {
                        employeeId: {
                            $regex: search,
                            $options: "i"
                        }
                    }

                ]

            })
            .select(
                "_id name email employeeId role isActive"
            )
            .limit(10)
            .lean();


        /*
         * Don't return password or other
         * sensitive Employee fields.
         */


        return res.json({

            success: true,

            data: employees

        });


    } catch (error) {

        console.error(
            "Search recipients error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to search recipients."

        });

    }

};

/* =========================================================
   RESOLVE EMAILS -> EMPLOYEE DOCUMENTS
========================================================= */

const resolveRecipients = async (emails = []) => {

    const normalizedEmails = normalizeRecipients(emails);

    if (!normalizedEmails.length) {
        return [];
    }

    const employees = await Employee.find({
        email: {
            $in: normalizedEmails
        },
        isActive: true
    }).select(
        "_id employeeId name email role isActive"
    );

    return employees;
};


/* =========================================================
   REMOVE DUPLICATE EMPLOYEES
========================================================= */

const uniqueEmployees = (...groups) => {

    const map = new Map();

    for (const group of groups) {

        for (const employee of group || []) {

            if (!employee?._id) {
                continue;
            }

            const id = employee._id.toString();

            if (!map.has(id)) {
                map.set(id, employee);
            }
        }
    }

    return [...map.values()];
};


/* =========================================================
   BODY -> SIMPLE HTML
========================================================= */

const bodyToHtml = (body = "") => {

    return String(body)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
};


/* =========================================================
   ATTACHMENTS
========================================================= */

const buildAttachments = (files = []) => {

    return files.map((file) => ({
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        mimeType: file.mimetype,
        size: file.size
    }));
};


/* =========================================================
   GET EMPLOYEE EMAILS
========================================================= */

const employeeEmails = (employees = []) => {

    return employees
        .map((employee) => employee?.email)
        .filter(Boolean);
};


/* =========================================================
   POST /api/messages
   SEND MESSAGE
========================================================= */

const sendMessage = async (req, res) => {

    try {

        const subject = String(
            req.body.subject || ""
        ).trim();

        const body = String(
            req.body.body || ""
        ).trim();

        const toInput = req.body.to;
        const ccInput = req.body.cc;
        const bccInput = req.body.bcc;

        /* -----------------------------------------
           VALIDATION
        ----------------------------------------- */

        if (!subject) {

            return res.status(400).json({
                success: false,
                message: "Subject is required"
            });
        }


        if (!body) {

            return res.status(400).json({
                success: false,
                message: "Message body is required"
            });
        }


        /* -----------------------------------------
           RESOLVE RECIPIENTS
        ----------------------------------------- */

        const toEmployees =
            await resolveRecipients(toInput);

        const ccEmployees =
            await resolveRecipients(ccInput);

        const bccEmployees =
            await resolveRecipients(bccInput);

        /* -----------------------------------------
           TO IS REQUIRED
        ----------------------------------------- */

        if (!toEmployees.length) {

            return res.status(400).json({
                success: false,
                message:
                    "At least one valid To recipient is required"
            });
        }


        /* -----------------------------------------
           REMOVE DUPLICATES ACROSS TO / CC / BCC

           Priority:
           TO -> CC -> BCC
        ----------------------------------------- */

        const usedIds = new Set();


        const uniqueTo =
            toEmployees.filter((employee) => {

                const id =
                    employee._id.toString();

                if (usedIds.has(id)) {
                    return false;
                }

                usedIds.add(id);

                return true;
            });


        const uniqueCc =
            ccEmployees.filter((employee) => {

                const id =
                    employee._id.toString();

                if (usedIds.has(id)) {
                    return false;
                }

                usedIds.add(id);

                return true;
            });


        const uniqueBcc =
            bccEmployees.filter((employee) => {

                const id =
                    employee._id.toString();

                if (usedIds.has(id)) {
                    return false;
                }

                usedIds.add(id);

                return true;
            });


        /* -----------------------------------------
           PREVENT SENDING TO SELF

           Optional but recommended.
        ----------------------------------------- */

        const currentUserId =
            req.user._id.toString();


        const selfInTo =
            uniqueTo.some(
                (employee) =>
                    employee._id.toString() === currentUserId
            );

        if (selfInTo) {

            return res.status(400).json({
                success: false,
                message:
                    "You cannot send a message to yourself."
            });
        }


        /* -----------------------------------------
           FINAL RECIPIENT CHECK
        ----------------------------------------- */

        if (!uniqueTo.length) {

            return res.status(400).json({
                success: false,
                message:
                    "At least one valid To recipient is required"
            });
        }

        /* -----------------------------------------
           ATTACHMENTS
        ----------------------------------------- */

        const attachments =
            buildAttachments(req.files || []);


        /* -----------------------------------------
           CREATE MESSAGE
        ----------------------------------------- */

        const message =
            await Message.create({

                subject,

                body,

                sender:
                    req.user._id,

                to:
                    uniqueTo.map(
                        (employee) => employee._id
                    ),

                cc:
                    uniqueCc.map(
                        (employee) => employee._id
                    ),

                bcc:
                    uniqueBcc.map(
                        (employee) => employee._id
                    ),

                attachments,

                status: "SENT",

                threadId: null,

                readBy: [
                    req.user._id
                ],

                deletedBy: [],

                permanentlyDeletedBy: [],

                sentAt: new Date()
            });


        /* -----------------------------------------
           SMTP EMAIL
        ----------------------------------------- */

        try {

            await sendEmail({

                from:
                    req.user.email ||
                    process.env.SMTP_FROM ||
                    process.env.SMTP_USER,

                to:
                    employeeEmails(uniqueTo),

                cc:
                    employeeEmails(uniqueCc),

                bcc:
                    employeeEmails(uniqueBcc),

                subject,

                text: body,

                html: bodyToHtml(body),

                attachments:
                    attachments.map((attachment) => ({
                        filename:
                            attachment.originalName,

                        path:
                            attachment.filePath,

                        contentType:
                            attachment.mimeType
                    }))
            });

            console.log(
                "SMTP EMAIL SENT SUCCESSFULLY"
            );

        } catch (emailError) {

            console.error(
                "SMTP SEND FAILED:",
                emailError.message
            );

            /*
             * Internal DarkMail message is already saved.
             *
             * We intentionally do not delete it.
             * The message remains available inside
             * DarkMail even if external SMTP fails.
             */
        }


        /* -----------------------------------------
           POPULATE RESPONSE
        ----------------------------------------- */

        await message.populate([
            {
                path: "sender",
                select:
                    "employeeId name email role"
            },
            {
                path: "to",
                select:
                    "employeeId name email"
            },
            {
                path: "cc",
                select:
                    "employeeId name email"
            },
            {
                path: "bcc",
                select:
                    "employeeId name email"
            }
        ]);

        return res.status(201).json({

            success: true,

            message:
                "Message sent successfully",

            data:
                message
        });


    } catch (error) {

        console.error(
            "Send message error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to send message",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
        });
    }
};


/* =========================================================
   GET MESSAGES
========================================================= */

const getMessages = async (req, res) => {

    try {

        /* =====================================================
           CURRENT USER
        ===================================================== */

        const userId =
            req.user._id;

        const userIdString =
            userId.toString();


        /* =====================================================
           FOLDER
           
           Supported:
           
           inbox
           sent
           drafts
           unread
           trash
           all
        ===================================================== */

        const folder =
            String(
                req.query.folder ||
                "inbox"
            )
                .trim()
                .toLowerCase();


        /* =====================================================
           PAGINATION
        ===================================================== */

        const page =
            Math.max(
                parseInt(
                    req.query.page,
                    10
                ) || 1,
                1
            );


        const limit =
            Math.min(
                Math.max(
                    parseInt(
                        req.query.limit,
                        10
                    ) || 20,
                    1
                ),
                100
            );


        const skip =
            (page - 1) *
            limit;


        /* =====================================================
           VALID FOLDERS
        ===================================================== */

        const validFolders = [
            "inbox",
            "sent",
            "drafts",
            "unread",
            "trash",
            "all",
        ];


        if (
            !validFolders.includes(
                folder
            )
        ) {

            return res.status(
                400
            ).json({

                success: false,

                message:
                    "Invalid folder. Use inbox, sent, drafts, unread, trash or all.",

            });

        }


        /* =====================================================
           BASE QUERY
           
           Permanently deleted messages are hidden from
           normal mailbox queries.
           
           The trash query will also respect this condition.
        ===================================================== */

        let query = {

            permanentlyDeletedBy: {
                $ne: userId
            },

        };


        /* =====================================================
           INBOX
           
           IMPORTANT:
           
           Inbox uses only RECEIVED messages when the API
           is called with:
           
           folder=inbox
           
           The frontend mixed mailbox uses:
           
           folder=all
           
           Therefore this branch remains a true Inbox query.
        ===================================================== */

        if (
            folder ===
            "inbox"
        ) {

            query.status =
                "SENT";


            query.$or = [

                {
                    to: userId,
                },

                {
                    cc: userId,
                },

                {
                    bcc: userId,
                },

            ];


            /*
             * User has not moved this message
             * to their own trash.
             */

            query.deletedBy = {
                $ne: userId,
            };

        }


        /* =====================================================
           SENT
           
           User must be the sender.
        ===================================================== */

        else if (
            folder ===
            "sent"
        ) {

            query.status =
                "SENT";


            query.sender =
                userId;


            query.deletedBy = {
                $ne: userId,
            };

        }


        /* =====================================================
           DRAFTS
           
           User owns the draft.
           
           Expected document:
           
           status: "DRAFT"
           sender: userId
        ===================================================== */

        else if (
            folder ===
            "drafts"
        ) {

            query.status =
                "DRAFT";


            query.sender =
                userId;


            /*
             * If a draft has been moved to trash,
             * do not show it in Drafts.
             */

            query.deletedBy = {
                $ne: userId,
            };

        }


        /* =====================================================
           UNREAD
           
           User must be a recipient.
           
           readBy must not contain current user.
        ===================================================== */

        else if (
            folder ===
            "unread"
        ) {

            query.status =
                "SENT";


            query.$or = [

                {
                    to: userId,
                },

                {
                    cc: userId,
                },

                {
                    bcc: userId,
                },

            ];


            query.deletedBy = {
                $ne: userId,
            };


            query.readBy = {
                $ne: userId,
            };

        }


        /* =====================================================
           TRASH
           
           Message was moved to trash by current user.
           
           IMPORTANT:
           
           deletedBy can contain multiple users.
           We check whether current user exists in it.
        ===================================================== */

        else if (
            folder ===
            "trash"
        ) {

            query.deletedBy =
                userId;

        }


        /* =====================================================
           ALL
           
           This is the IMPORTANT branch for your new
           mixed Inbox screen.
           
           It returns every message related to the current
           employee:
           
           sender
           to
           cc
           bcc
           
           Then the code below determines:
           
           Inbox
           Sent
           Draft
           Trash
           
           individually for every message.
        ===================================================== */

        else if (
            folder ===
            "all"
        ) {

            query.$or = [

                {
                    sender: userId,
                },

                {
                    to: userId,
                },

                {
                    cc: userId,
                },

                {
                    bcc: userId,
                },

            ];

        }


        /* =====================================================
           DEBUG
           
           Uncomment when debugging.
        ===================================================== */

        /*
        console.log(
            "\n========================================"
        );

        console.log(
            "DARKMAIL MESSAGE DEBUG"
        );

        console.log(
            "User ID:",
            userIdString
        );

        console.log(
            "Folder:",
            folder
        );

        console.log(
            "Page:",
            page
        );

        console.log(
            "Limit:",
            limit
        );

        console.log(
            "Query:",
            JSON.stringify(
                query,
                null,
                2
            )
        );

        console.log(
            "========================================\n"
        );
        */


        /* =====================================================
           TOTAL COUNT
        ===================================================== */

        const total =
            await Message.countDocuments(
                query
            );


        /* =====================================================
           FETCH MESSAGES
        ===================================================== */

        const messages =
            await Message.find(
                query
            )

                /* ---------------------------------------------
                   SENDER
                --------------------------------------------- */

                .populate(
                    "sender",
                    "employeeId name email role"
                )


                /* ---------------------------------------------
                   TO
                --------------------------------------------- */

                .populate(
                    "to",
                    "employeeId name email"
                )


                /* ---------------------------------------------
                   CC
                --------------------------------------------- */

                .populate(
                    "cc",
                    "employeeId name email"
                )


                /* ---------------------------------------------
                   BCC
                --------------------------------------------- */

                .populate(
                    "bcc",
                    "employeeId name email"
                )


                /* ---------------------------------------------
                   LATEST FIRST
                --------------------------------------------- */

                .sort({

                    sentAt: -1,

                    createdAt: -1,

                })


                /* ---------------------------------------------
                   PAGINATION
                --------------------------------------------- */

                .skip(
                    skip
                )

                .limit(
                    limit
                )


                /* ---------------------------------------------
                   RETURN PLAIN OBJECTS
                --------------------------------------------- */

                .lean();


        /* =====================================================
           FORMAT MESSAGES
           
           Add:
           
           isRead
           mailFolder
        ===================================================== */

        const formattedMessages =
            messages.map(
                (
                    message
                ) => {

                    /* =========================================
                       READ STATUS
                    ========================================= */

                    const readBy =
                        Array.isArray(
                            message.readBy
                        )
                            ? message.readBy
                            : [];


                    const isRead =
                        readBy.some(
                            (
                                id
                            ) =>
                                id?.toString() ===
                                userIdString
                        );


                    /* =========================================
                       SENDER ID
                    ========================================= */

                    const senderId =
                        message
                            ?.sender
                            ?._id
                            ?.toString();


                    /* =========================================
                       RECIPIENT IDS
                       
                       Combine:
                       
                       to
                       cc
                       bcc
                    ========================================= */

                    const toUsers =
                        Array.isArray(
                            message.to
                        )
                            ? message.to
                            : [];


                    const ccUsers =
                        Array.isArray(
                            message.cc
                        )
                            ? message.cc
                            : [];


                    const bccUsers =
                        Array.isArray(
                            message.bcc
                        )
                            ? message.bcc
                            : [];


                    const recipientIds = [

                        ...toUsers,

                        ...ccUsers,

                        ...bccUsers,

                    ]

                        .map(
                            (
                                user
                            ) =>
                                user?._id
                                    ?.toString() ||
                                user?.toString()
                        )

                        .filter(
                            Boolean
                        );


                    /* =========================================
                       USER RELATIONSHIP
                    ========================================= */

                    const isSender =
                        senderId ===
                        userIdString;


                    const isRecipient =
                        recipientIds.includes(
                            userIdString
                        );


                    /* =========================================
                       DELETED BY
                    ========================================= */

                    const deletedBy =
                        Array.isArray(
                            message.deletedBy
                        )
                            ? message.deletedBy
                            : [];


                    const isInTrash =
                        deletedBy.some(
                            (
                                id
                            ) =>
                                id?.toString() ===
                                userIdString
                        );


                    /* =========================================
                       DETERMINE MAIL FOLDER
                       
                       PRIORITY:
                       
                       1. Trash
                       2. Draft
                       3. Sent
                       4. Inbox
                    ========================================= */

                    let mailFolder =
                        "inbox";


                    /* -----------------------------------------
                       TRASH
                    ----------------------------------------- */

                    if (
                        isInTrash
                    ) {

                        mailFolder =
                            "trash";

                    }


                    /* -----------------------------------------
                       DRAFT
                    ----------------------------------------- */

                    else if (
                        message.status ===
                            "DRAFT" &&
                        isSender
                    ) {

                        mailFolder =
                            "drafts";

                    }


                    /* -----------------------------------------
                       SENT
                    ----------------------------------------- */

                    else if (
                        message.status ===
                            "SENT" &&
                        isSender
                    ) {

                        mailFolder =
                            "sent";

                    }


                    /* -----------------------------------------
                       INBOX
                    ----------------------------------------- */

                    else if (
                        message.status ===
                            "SENT" &&
                        isRecipient
                    ) {

                        mailFolder =
                            "inbox";

                    }


                    /* -----------------------------------------
                       FALLBACK
                    ----------------------------------------- */

                    else {

                        mailFolder =
                            folder ===
                            "all"
                                ? "inbox"
                                : folder;

                    }


                    /* =========================================
                       RETURN MESSAGE
                    ========================================= */

                    return {

                        ...message,

                        isRead,

                        mailFolder,

                    };

                }
            );


        /* =====================================================
           TOTAL PAGES
        ===================================================== */

        const pages =
            Math.max(
                Math.ceil(
                    total /
                    limit
                ),
                1
            );


        /* =====================================================
           RESPONSE
        ===================================================== */

        return res.status(
            200
        ).json({

            success: true,

            /*
             * Requested API folder.
             *
             * For Inbox frontend this will be:
             *
             * "all"
             */

            folder,

            count:
                formattedMessages.length,

            total,

            page,

            limit,

            pages,

            hasNext:
                page < pages,

            hasPrevious:
                page > 1,

            data:
                formattedMessages,

            messages:
                formattedMessages,

        });


    } catch (
        error
    ) {

        /* =====================================================
           ERROR LOG
        ===================================================== */

        console.error(
            "Get messages error:",
            error
        );


        /* =====================================================
           ERROR RESPONSE
        ===================================================== */

        return res.status(
            500
        ).json({

            success: false,

            message:
                "Failed to fetch messages",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

};



/* =========================================================
   GET TRASH
========================================================= */

const getTrash = async (req, res) => {

    try {

        const messages =
            await Message.find({

                status: "SENT",

                deletedBy:
                    req.user._id,

                permanentlyDeletedBy: {
                    $ne: req.user._id
                }
            })

            .populate(
                "sender",
                "employeeId name email role"
            )

            .populate(
                "to",
                "employeeId name email"
            )

            .populate(
                "cc",
                "employeeId name email"
            )

            .populate(
                "bcc",
                "employeeId name email"
            )

            .sort({
                sentAt: -1
            });


        return res.status(200).json({

            success: true,

            count:
                messages.length,

            data:
                messages
        });


    } catch (error) {

        console.error(
            "Get trash error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch trash"
        });
    }
};


/* =========================================================
   GET MESSAGE BY ID
========================================================= */

const getMessageById = async (req, res) => {

    try {

        const message =
            await Message.findById(
                req.params.id
            )

            .populate(
                "sender",
                "employeeId name email role"
            )

            .populate(
                "to",
                "employeeId name email"
            )

            .populate(
                "cc",
                "employeeId name email"
            )

            .populate(
                "bcc",
                "employeeId name email"
            );


        if (!message) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found"
            });
        }
        const userId =
            req.user._id.toString();


        const hasAccess =

            message.sender?._id?.toString() ===
                userId ||

            message.to?.some(
                (user) =>
                    user?._id?.toString() ===
                    userId
            ) ||

            message.cc?.some(
                (user) =>
                    user?._id?.toString() ===
                    userId
            ) ||

            message.bcc?.some(
                (user) =>
                    user?._id?.toString() ===
                    userId
            );


        if (!hasAccess) {

            return res.status(403).json({

                success: false,

                message:
                    "You do not have access to this message"
            });
        }


        return res.status(200).json({

            success: true,

            data:
                message
        });


    } catch (error) {

        console.error(
            "Get message error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch message"
        });
    }
};


/* =========================================================
   MARK AS READ
========================================================= */

const markAsRead = async (req, res) => {

    try {

        const message =
            await Message.findById(
                req.params.id
            );


        if (!message) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found"
            });
        }


        const userId =
            req.user._id;


        const hasAccess =

            message.to?.some(
                (id) =>
                    id.toString() ===
                    userId.toString()
            ) ||

            message.cc?.some(
                (id) =>
                    id.toString() ===
                    userId.toString()
            ) ||

            message.bcc?.some(
                (id) =>
                    id.toString() ===
                    userId.toString()
            );


        if (!hasAccess) {

            return res.status(403).json({

                success: false,

                message:
                    "You cannot mark this message as read"
            });
        }


        if (
            !message.readBy.some(
                (id) =>
                    id.toString() ===
                    userId.toString()
            )
        ) {

            message.readBy.push(userId);

            await message.save();
        }


        return res.status(200).json({

            success: true,

            message:
                "Message marked as read"
        });


    } catch (error) {

        console.error(
            "Mark read error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to mark message as read"
        });
    }
};


/* =========================================================
   MOVE TO TRASH
========================================================= */

const moveToTrash = async (req, res) => {

    try {

        const message =
            await Message.findById(
                req.params.id
            );


        if (!message) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found"
            });
        }


        const userId =
            req.user._id.toString();


        const hasAccess =

            message.sender?.toString() ===
                userId ||

            message.to?.some(
                (id) =>
                    id.toString() === userId
            ) ||

            message.cc?.some(
                (id) =>
                    id.toString() === userId
            ) ||

            message.bcc?.some(
                (id) =>
                    id.toString() === userId
            );


        if (!hasAccess) {

            return res.status(403).json({

                success: false,

                message:
                    "You do not have access to this message"
            });
        }


        if (
            !message.deletedBy.some(
                (id) =>
                    id.toString() === userId
            )
        ) {

            message.deletedBy.push(
                req.user._id
            );
        }


        await message.save();


        return res.status(200).json({

            success: true,

            message:
                "Message moved to trash"
        });


    } catch (error) {

        console.error(
            "Move trash error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to move message to trash"
        });
    }
};


/* =========================================================
   RESTORE
========================================================= */

const restoreMessage = async (req, res) => {

    try {

        const message =
            await Message.findById(
                req.params.id
            );


        if (!message) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found"
            });
        }


        message.deletedBy =
            message.deletedBy.filter(
                (id) =>
                    id.toString() !==
                    req.user._id.toString()
            );


        await message.save();


        return res.status(200).json({

            success: true,

            message:
                "Message restored successfully"
        });


    } catch (error) {

        console.error(
            "Restore error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to restore message"
        });
    }
};


/* =========================================================
   PERMANENT DELETE
========================================================= */

const permanentlyDeleteMessage =
    async (req, res) => {

        try {

            const message =
                await Message.findById(
                    req.params.id
                );


            if (!message) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Message not found"
                });
            }


            const userId =
                req.user._id.toString();


            if (
                !message.permanentlyDeletedBy.some(
                    (id) =>
                        id.toString() ===
                        userId
                )
            ) {

                message.permanentlyDeletedBy.push(
                    req.user._id
                );
            }


            await message.save();


            return res.status(200).json({

                success: true,

                message:
                    "Message permanently deleted"
            });


        } catch (error) {

            console.error(
                "Permanent delete error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to permanently delete message"
            });
        }
    };


/* =========================================================
   REPLY
========================================================= */

const replyToMessage = async (req, res) => {

    try {

        const body =
            String(
                req.body.body || ""
            ).trim();


        if (!body) {

            return res.status(400).json({

                success: false,

                message:
                    "Reply body is required"
            });
        }


        const parent =
            await Message.findById(
                req.params.id
            );


        if (!parent) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found"
            });
        }


        const currentUserId =
            req.user._id.toString();


        const recipientIds =
            new Set();


        /* Sender becomes recipient */

        if (
            parent.sender &&
            parent.sender.toString() !==
                currentUserId
        ) {

            recipientIds.add(
                parent.sender.toString()
            );
        }


        /* Original To */

        for (
            const id of
            parent.to || []
        ) {

            if (
                id.toString() !==
                currentUserId
            ) {

                recipientIds.add(
                    id.toString()
                );
            }
        }


        /* Original CC */

        for (
            const id of
            parent.cc || []
        ) {

            if (
                id.toString() !==
                currentUserId
            ) {

                recipientIds.add(
                    id.toString()
                );
            }
        }


        const finalRecipientIds =
            [...recipientIds]
                .map(
                    (id) =>
                        new mongoose.Types.ObjectId(id)
                );


        if (!finalRecipientIds.length) {

            return res.status(400).json({

                success: false,

                message:
                    "No valid reply recipient found"
            });
        }


        const subject =
            parent.subject
                ?.toLowerCase()
                .startsWith("re:")
                ? parent.subject
                : `Re: ${parent.subject}`;


        const message =
            await Message.create({

                subject,

                body,

                sender:
                    req.user._id,

                to:
                    finalRecipientIds,

                cc: [],

                bcc: [],

                attachments: [],

                status: "SENT",

                threadId:
                    parent.threadId ||
                    parent._id,

                readBy: [
                    req.user._id
                ],

                deletedBy: [],

                permanentlyDeletedBy: [],

                sentAt: new Date()
            });


        await message.populate([
            {
                path: "sender",
                select:
                    "employeeId name email role"
            },
            {
                path: "to",
                select:
                    "employeeId name email"
            },
            {
                path: "cc",
                select:
                    "employeeId name email"
            }
        ]);


        /* -----------------------------------------
           SEND REPLY THROUGH SMTP
        ----------------------------------------- */

        try {

            const recipients =
                await Employee.find({
                    _id: {
                        $in:
                            finalRecipientIds
                    },
                    isActive: true
                }).select(
                    "email name employeeId"
                );


            await sendEmail({

                from:
                    req.user.email ||
                    process.env.SMTP_FROM ||
                    process.env.SMTP_USER,

                to:
                    recipients.map(
                        (employee) =>
                            employee.email
                    ),

                subject,

                text: body,

                html:
                    bodyToHtml(body)
            });


        } catch (emailError) {

            console.error(
                "Reply SMTP failed:",
                emailError.message
            );
        }


        return res.status(201).json({

            success: true,

            message:
                "Reply sent successfully",

            data:
                message
        });


    } catch (error) {

        console.error(
            "Reply error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to send reply"
        });
    }
};


/* =========================================================
   THREAD
========================================================= */

const getThread = async (req, res) => {

    try {

        const parent =
            await Message.findById(
                req.params.id
            );


        if (!parent) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found"
            });
        }


        const threadId =
            parent.threadId ||
            parent._id;


        const messages =
            await Message.find({

                $or: [

                    {
                        _id:
                            threadId
                    },

                    {
                        threadId
                    }
                ],

                deletedBy: {
                    $ne:
                        req.user._id
                },

                permanentlyDeletedBy: {
                    $ne:
                        req.user._id
                }

            })

            .populate(
                "sender",
                "employeeId name email role"
            )

            .populate(
                "to",
                "employeeId name email"
            )

            .populate(
                "cc",
                "employeeId name email"
            )

            .populate(
                "bcc",
                "employeeId name email"
            )

            .sort({
                createdAt: 1
            });


        return res.status(200).json({

            success: true,

            count:
                messages.length,

            data:
                messages
        });


    } catch (error) {

        console.error(
            "Get thread error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch conversation"
        });
    }
};


/* =========================================================
   SAVE DRAFT
========================================================= */

const saveDraft = async (req, res) => {

    try {

        const {
            messageId,
            subject = "",
            body = "",
            to = [],
            cc = [],
            bcc = []
        } = req.body;


        const toEmails =
            normalizeRecipients(to);

        const ccEmails =
            normalizeRecipients(cc);

        const bccEmails =
            normalizeRecipients(bcc);


        const resolvedTo =
            await resolveRecipients(
                toEmails
            );

        const resolvedCc =
            await resolveRecipients(
                ccEmails
            );

        const resolvedBcc =
            await resolveRecipients(
                bccEmails
            );


        /* -----------------------------------------
           UPDATE EXISTING DRAFT
        ----------------------------------------- */

        if (messageId) {

            const draft =
                await Message.findOne({

                    _id:
                        messageId,

                    sender:
                        req.user._id,

                    status:
                        "DRAFT"
                });


            if (!draft) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Draft not found"
                });
            }


            draft.subject =
                String(subject).trim();

            draft.body =
                String(body);

            draft.to =
                resolvedTo.map(
                    (employee) =>
                        employee._id
                );

            draft.cc =
                resolvedCc.map(
                    (employee) =>
                        employee._id
                );

            draft.bcc =
                resolvedBcc.map(
                    (employee) =>
                        employee._id
                );


            await draft.save();


            return res.status(200).json({

                success: true,

                message:
                    "Draft updated successfully",

                draft
            });
        }


        /* -----------------------------------------
           CREATE NEW DRAFT
        ----------------------------------------- */

        const draft =
            await Message.create({

                sender:
                    req.user._id,

                to:
                    resolvedTo.map(
                        (employee) =>
                            employee._id
                    ),

                cc:
                    resolvedCc.map(
                        (employee) =>
                            employee._id
                    ),

                bcc:
                    resolvedBcc.map(
                        (employee) =>
                            employee._id
                    ),

                subject:
                    String(subject).trim(),

                body:
                    String(body),

                status:
                    "DRAFT",

                sentAt:
                    null,

                readBy: [],

                deletedBy: [],

                permanentlyDeletedBy: []
            });


        return res.status(201).json({

            success: true,

            message:
                "Draft saved successfully",

            draft
        });


    } catch (error) {

        console.error(
            "Save draft error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to save draft"
        });
    }
};


/* =========================================================
   GET DRAFTS
========================================================= */

const getDrafts = async (req, res) => {

    try {

        const drafts =
            await Message.find({

                sender:
                    req.user._id,

                status:
                    "DRAFT",

                permanentlyDeletedBy: {
                    $ne:
                        req.user._id
                }

            })

            .populate(
                "to",
                "employeeId name email"
            )

            .populate(
                "cc",
                "employeeId name email"
            )

            .populate(
                "bcc",
                "employeeId name email"
            )

            .sort({
                updatedAt: -1
            });


        return res.status(200).json({

            success: true,

            count:
                drafts.length,

            data:
                drafts
        });


    } catch (error) {

        console.error(
            "Get drafts error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch drafts"
        });
    }
};


/* =========================================================
   SEND DRAFT
========================================================= */

const sendDraft = async (req, res) => {

    try {

        const draft =
            await Message.findOne({

                _id:
                    req.params.id,

                sender:
                    req.user._id,

                status:
                    "DRAFT"
            });


        if (!draft) {

            return res.status(404).json({

                success: false,

                message:
                    "Draft not found"
            });
        }


        if (!draft.to?.length) {

            return res.status(400).json({

                success: false,

                message:
                    "Draft must have at least one recipient"
            });
        }


        draft.status =
            "SENT";

        draft.sentAt =
            new Date();

        draft.threadId =
            draft.threadId || null;

        draft.readBy = [
            req.user._id
        ];

        draft.deletedBy = [];

        draft.permanentlyDeletedBy = [];


        await draft.save();


        /* -----------------------------------------
           SMTP
        ----------------------------------------- */

        try {

            const recipients =
                await Employee.find({

                    _id: {
                        $in: [
                            ...draft.to,
                            ...draft.cc,
                            ...draft.bcc
                        ]
                    },

                    isActive: true

                }).select(
                    "_id email"
                );


            const recipientMap =
                new Map(
                    recipients.map(
                        (employee) => [
                            employee._id.toString(),
                            employee.email
                        ]
                    )
                );


            const getEmails =
                (ids = []) =>
                    ids
                        .map(
                            (id) =>
                                recipientMap.get(
                                    id.toString()
                                )
                        )
                        .filter(Boolean);


            await sendEmail({

                from:
                    req.user.email ||
                    process.env.SMTP_FROM ||
                    process.env.SMTP_USER,

                to:
                    getEmails(draft.to),

                cc:
                    getEmails(draft.cc),

                bcc:
                    getEmails(draft.bcc),

                subject:
                    draft.subject,

                text:
                    draft.body,

                html:
                    bodyToHtml(
                        draft.body
                    )
            });


        } catch (emailError) {

            console.error(
                "Draft SMTP failed:",
                emailError.message
            );
        }


        return res.status(200).json({

            success: true,

            message:
                "Draft sent successfully",

            draft
        });


    } catch (error) {

        console.error(
            "Send draft error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to send draft"
        });
    }
};


/* =========================================================
   DELETE DRAFT
========================================================= */

const deleteDraft = async (req, res) => {

    try {

        const draft =
            await Message.findOne({

                _id:
                    req.params.id,

                sender:
                    req.user._id,

                status:
                    "DRAFT"
            });


        if (!draft) {

            return res.status(404).json({

                success: false,

                message:
                    "Draft not found"
            });
        }


        await Message.findByIdAndDelete(
            req.params.id
        );


        return res.status(200).json({

            success: true,

            message:
                "Draft deleted successfully"
        });


    } catch (error) {

        console.error(
            "Delete draft error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to delete draft"
        });
    }
};


/* =========================================================
   SEARCH
========================================================= */

const searchMessages = async (req, res) => {

    try {

        const search =
            String(
                req.query.q || ""
            ).trim();


        if (!search) {

            return res.status(200).json({

                success: true,

                count: 0,

                data: []
            });
        }


        const regex =
            new RegExp(
                search.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                ),
                "i"
            );


        const userId =
            req.user._id;


        const messages =
            await Message.find({

                status:
                    "SENT",

                permanentlyDeletedBy: {
                    $ne:
                        userId
                },

                deletedBy: {
                    $ne:
                        userId
                },

                $and: [

                    {
                        $or: [

                            {
                                sender:
                                    userId
                            },

                            {
                                to:
                                    userId
                            },

                            {
                                cc:
                                    userId
                            },

                            {
                                bcc:
                                    userId
                            }
                        ]
                    },

                    {
                        $or: [

                            {
                                subject:
                                    regex
                            },

                            {
                                body:
                                    regex
                            }
                        ]
                    }
                ]

            })

            .populate(
                "sender",
                "employeeId name email"
            )

            .populate(
                "to",
                "employeeId name email"
            )

            .populate(
                "cc",
                "employeeId name email"
            )

            .populate(
                "bcc",
                "employeeId name email"
            )

            .sort({
                sentAt: -1
            })

            .limit(50);


        return res.status(200).json({

            success: true,

            count:
                messages.length,

            data:
                messages
        });


    } catch (error) {

        console.error(
            "Search messages error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to search messages"
        });
    }
};


/* =========================================================
   UNREAD COUNT
========================================================= */

const getUnreadCount = async (req, res) => {

    try {

        const userId =
            req.user._id;


        const count =
            await Message.countDocuments({

                status:
                    "SENT",

                $or: [

                    {
                        to:
                            userId
                    },

                    {
                        cc:
                            userId
                    },

                    {
                        bcc:
                            userId
                    }
                ],

                readBy: {
                    $ne:
                        userId
                },

                deletedBy: {
                    $ne:
                        userId
                },

                permanentlyDeletedBy: {
                    $ne:
                        userId
                }
            });


        return res.status(200).json({

            success: true,

            count
        });


    } catch (error) {

        console.error(
            "Unread count error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to get unread count"
        });
    }
};


/* =========================================================
   DOWNLOAD ATTACHMENT
========================================================= */

const downloadAttachment =
    async (req, res) => {

        try {

            const {
                messageId,
                attachmentIndex
            } = req.params;


            const index =
                Number(
                    attachmentIndex
                );


            if (
                !Number.isInteger(index) ||
                index < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid attachment index"
                });
            }


            const message =
                await Message.findById(
                    messageId
                );


            if (!message) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Message not found"
                });
            }


            const userId =
                req.user._id.toString();


            const hasAccess =

                message.sender?.toString() ===
                    userId ||

                message.to?.some(
                    (id) =>
                        id.toString() ===
                        userId
                ) ||

                message.cc?.some(
                    (id) =>
                        id.toString() ===
                        userId
                ) ||

                message.bcc?.some(
                    (id) =>
                        id.toString() ===
                        userId
                );


            if (!hasAccess) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You do not have access to this attachment"
                });
            }


            if (
                !message.attachments ||
                !message.attachments[index]
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Attachment not found"
                });
            }


            const attachment =
                message.attachments[index];


            const filePath =
                path.resolve(
                    attachment.filePath
                );


            if (
                !fs.existsSync(filePath)
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Attachment file does not exist"
                });
            }


            res.download(

                filePath,

                attachment.originalName,

                (error) => {

                    if (error) {

                        console.error(
                            "Download error:",
                            error
                        );

                        if (
                            !res.headersSent
                        ) {

                            res.status(500).json({

                                success: false,

                                message:
                                    "Failed to download attachment"
                            });
                        }
                    }
                }
            );


        } catch (error) {

            console.error(
                "Download attachment error:",
                error
            );

            if (
                !res.headersSent
            ) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Server error while downloading attachment"
                });
            }
        }
    };


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {

    sendMessage,

    getMessages,

    getTrash,

    getMessageById,

    markAsRead,

    moveToTrash,

    restoreMessage,

    permanentlyDeleteMessage,

    replyToMessage,

    getThread,

    saveDraft,

    getDrafts,

    sendDraft,

    deleteDraft,

    searchMessages,

    getUnreadCount,

    downloadAttachment,
    
    searchRecipients
};