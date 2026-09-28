const mongoose = require("mongoose");

const Message = require("../models/Message");
const Employee = require("../models/Employee");

const path = require("path");
const fs = require("fs");

/*
|--------------------------------------------------------------------------
| Helper: Normalize recipient input
|--------------------------------------------------------------------------
*/

const normalizeRecipients = (value) => {

    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value
            .map(item => String(item).trim())
            .filter(Boolean);
    }

    return String(value)
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
};


/*
|--------------------------------------------------------------------------
| Helper: Resolve emails / IDs to Employee documents
|--------------------------------------------------------------------------
*/

const resolveRecipients = async (recipients) => {

    const normalized = normalizeRecipients(recipients);

    if (normalized.length === 0) {
        return [];
    }

    const objectIds = normalized.filter(value =>
        mongoose.Types.ObjectId.isValid(value)
    );

    const emails = normalized
        .filter(value => !mongoose.Types.ObjectId.isValid(value))
        .map(value => value.toLowerCase());


    const conditions = [];

    if (objectIds.length > 0) {
        conditions.push({
            _id: {
                $in: objectIds
            }
        });
    }

    if (emails.length > 0) {
        conditions.push({
            email: {
                $in: emails
            }
        });
    }


    if (conditions.length === 0) {
        return [];
    }


    const employees = await Employee.find({
        $or: conditions,
        isActive: true
    }).select("_id name email isActive");


    return employees;
};


/*
|--------------------------------------------------------------------------
| POST /api/messages
| Compose / Send message
|--------------------------------------------------------------------------
*/

const sendMessage = async (req, res) => {

    try {

        const {
            subject,
            body
        } = req.body;


        const toInput = req.body.to;
        const ccInput = req.body.cc;
        const bccInput = req.body.bcc;


        if (!subject || !subject.trim()) {

            return res.status(400).json({
                success: false,
                message: "Subject is required"
            });
        }


        if (!body || !body.trim()) {

            return res.status(400).json({
                success: false,
                message: "Message body is required"
            });
        }


        const toEmployees =
            await resolveRecipients(toInput);

        const ccEmployees =
            await resolveRecipients(ccInput);

        const bccEmployees =
            await resolveRecipients(bccInput);


        if (toEmployees.length === 0) {

            return res.status(400).json({
                success: false,
                message:
                    "At least one valid To recipient is required"
            });
        }


        const uniqueIds = new Set();


        const uniqueTo =
            toEmployees.filter(employee => {

                const id =
                    employee._id.toString();

                if (uniqueIds.has(id)) {
                    return false;
                }

                uniqueIds.add(id);

                return true;
            });


        const uniqueCc =
            ccEmployees.filter(employee => {

                const id =
                    employee._id.toString();

                if (uniqueIds.has(id)) {
                    return false;
                }

                uniqueIds.add(id);

                return true;
            });


        const uniqueBcc =
            bccEmployees.filter(employee => {

                const id =
                    employee._id.toString();

                if (uniqueIds.has(id)) {
                    return false;
                }

                uniqueIds.add(id);

                return true;
            });


        /*
         * Convert uploaded files into metadata.
         */

        const attachments =
            (req.files || []).map(file => ({
                originalName: file.originalname,
                fileName: file.filename,
                filePath: file.path,
                mimeType: file.mimetype,
                size: file.size
            }));


        const message =
            await Message.create({

                subject:
                    subject.trim(),

                body:
                    body.trim(),

                sender:
                    req.user._id,

                to:
                    uniqueTo.map(
                        employee => employee._id
                    ),

                cc:
                    uniqueCc.map(
                        employee => employee._id
                    ),

                bcc:
                    uniqueBcc.map(
                        employee => employee._id
                    ),

                attachments,

                status:
                    "SENT",

                threadId:
                    null,

                readBy: [
                    req.user._id
                ],

                deletedBy: [],

                permanentlyDeletedBy: [],

                sentAt:
                    new Date()
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
                "Failed to send message"
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET /api/messages  with pagination
|
| Inbox by default
| ?folder=inbox
| ?folder=sent
| ?folder=unread
|--------------------------------------------------------------------------
*/

const getMessages = async (req, res) => {

    try {

        const folder =
            (req.query.folder || "inbox")
                .toLowerCase();


        const page =
            Math.max(
                parseInt(req.query.page) || 1,
                1
            );


        const limit =
            Math.min(
                Math.max(
                    parseInt(req.query.limit) || 20,
                    1
                ),
                100
            );


        const skip =
            (page - 1) * limit;


        let query = {
            status: "SENT",

            permanentlyDeletedBy: {
                $ne: req.user._id
            }
        };


        /*
         * INBOX
         */
        if (folder === "inbox") {

            query.$or = [
                {
                    to: req.user._id
                },
                {
                    cc: req.user._id
                },
                {
                    bcc: req.user._id
                }
            ];

            query.deletedBy = {
                $ne: req.user._id
            };
        }


        /*
         * SENT
         */
        else if (folder === "sent") {

            query.sender =
                req.user._id;

            query.deletedBy = {
                $ne: req.user._id
            };
        }


        /*
         * UNREAD
         */
        else if (folder === "unread") {

            query.$or = [
                {
                    to: req.user._id
                },
                {
                    cc: req.user._id
                },
                {
                    bcc: req.user._id
                }
            ];

            query.readBy = {
                $ne: req.user._id
            };

            query.deletedBy = {
                $ne: req.user._id
            };
        }


        else {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid folder"
            });
        }


        const total =
            await Message.countDocuments(query);


        const messages =
            await Message.find(query)
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
                    createdAt: -1
                })
                .skip(skip)
                .limit(limit);


        const totalPages =
            Math.ceil(total / limit);


        return res.status(200).json({

            success: true,

            count: messages.length,

            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage:
                    page < totalPages,
                hasPreviousPage:
                    page > 1
            },

            data: messages
        });

    } catch (error) {

        console.error(
            "Get messages error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch messages"
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET /api/messages/trash
|--------------------------------------------------------------------------
*/

const getTrash = async (req, res) => {

    try {

        const messages =
            await Message.find({
                deletedBy: req.user._id
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
                    createdAt: -1
                });


        return res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });

    } catch (error) {

        console.error("Get trash error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch trash"
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET /api/messages/:id
|--------------------------------------------------------------------------
*/

const getMessageById = async (req, res) => {

    try {

        const message =
            await Message.findById(req.params.id)
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
                message: "Message not found"
            });
        }


        /*
         * Check whether current user has access
         */

        const userId =
            req.user._id.toString();


        const isSender =
            message.sender._id.toString() === userId;


        const isRecipient =
            [
                ...message.to,
                ...message.cc,
                ...message.bcc
            ].some(
                employee =>
                    employee._id.toString() === userId
            );


        const isDeleted =
            message.deletedBy.some(
                id => id.toString() === userId
            );


        if (!isSender && !isRecipient && !isDeleted) {

            return res.status(403).json({
                success: false,
                message: "You do not have access to this message"
            });
        }


        return res.status(200).json({
            success: true,
            data: message
        });

    } catch (error) {

        console.error("Get message error:", error);

        return res.status(400).json({
            success: false,
            message: "Invalid message ID"
        });
    }
};


/*
|--------------------------------------------------------------------------
| PATCH /api/messages/:id/read
|--------------------------------------------------------------------------
*/

const markAsRead = async (req, res) => {

    try {

        const message =
            await Message.findById(req.params.id);


        if (!message) {

            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }


        await Message.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: {
                    readBy: req.user._id
                }
            }
        );


        return res.status(200).json({
            success: true,
            message: "Message marked as read"
        });

    } catch (error) {

        console.error("Mark read error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to mark message as read"
        });
    }
};


/*
|--------------------------------------------------------------------------
| PATCH /api/messages/:id/trash
|--------------------------------------------------------------------------
*/

const moveToTrash = async (req, res) => {

    try {

        const message =
            await Message.findById(req.params.id);


        if (!message) {

            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }


        const userId =
            req.user._id.toString();


        const hasAccess =
            message.sender.toString() === userId ||
            message.to.some(
                id => id.toString() === userId
            ) ||
            message.cc.some(
                id => id.toString() === userId
            ) ||
            message.bcc.some(
                id => id.toString() === userId
            );


        if (!hasAccess) {

            return res.status(403).json({
                success: false,
                message:
                    "You cannot delete this message"
            });
        }


        await Message.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: {
                    deletedBy: req.user._id
                }
            }
        );


        return res.status(200).json({
            success: true,
            message: "Message moved to trash"
        });

    } catch (error) {

        console.error("Move to trash error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to move message to trash"
        });
    }
};


/*
|--------------------------------------------------------------------------
| PATCH /api/messages/:id/restore
|--------------------------------------------------------------------------
*/

const restoreMessage = async (req, res) => {

    try {

        const message =
            await Message.findById(req.params.id);


        if (!message) {

            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }


        await Message.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    deletedBy: req.user._id
                }
            }
        );


        return res.status(200).json({
            success: true,
            message: "Message restored successfully"
        });

    } catch (error) {

        console.error("Restore message error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to restore message"
        });
    }
};


/*
|--------------------------------------------------------------------------
| DELETE /api/messages/:id
|
| Permanently delete only when user is already in trash.
|--------------------------------------------------------------------------
*/

const permanentlyDeleteMessage = async (req, res) => {

    try {

        const message =
            await Message.findById(
                req.params.id
            );


        if (!message) {

            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }


        const userId =
            req.user._id.toString();


        const isDeleted =
            message.deletedBy.some(
                id =>
                    id.toString() === userId
            );


        if (!isDeleted) {

            return res.status(400).json({
                success: false,
                message:
                    "Message must be moved to trash first"
            });
        }


        /*
         * Permanently hide the message
         * only for this user.
         */
        await Message.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: {
                    permanentlyDeletedBy:
                        req.user._id
                }
            }
        );


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


/*
|--------------------------------------------------------------------------
| POST /api/messages/:id/reply
|--------------------------------------------------------------------------
*/

const replyToMessage = async (req, res) => {

    try {

        const parent =
            await Message.findById(req.params.id);


        if (!parent) {

            return res.status(404).json({
                success: false,
                message: "Original message not found"
            });
        }


        const {
            body
        } = req.body;


        if (!body || !body.trim()) {

            return res.status(400).json({
                success: false,
                message: "Reply body is required"
            });
        }


        /*
         * Determine reply recipient.
         *
         * If the current user received the message,
         * reply to sender.
         *
         * Otherwise reply to the original To recipients.
         */

        let recipientIds = [];


        const currentUser =
            req.user._id.toString();


        if (
            parent.sender.toString() !==
            currentUser
        ) {

            recipientIds = [
                parent.sender
            ];

        } else {

            recipientIds = [
                ...parent.to,
                ...parent.cc
            ].filter(
                id =>
                    id.toString() !== currentUser
            );
        }


        recipientIds = [
            ...new Map(
                recipientIds.map(id => [
                    id.toString(),
                    id
                ])
            ).values()
        ];


        if (recipientIds.length === 0) {

            return res.status(400).json({
                success: false,
                message: "No valid reply recipient found"
            });
        }


        const subject =
            parent.subject
                .toLowerCase()
                .startsWith("re:")
                ? parent.subject
                : `Re: ${parent.subject}`;


        const message =
            await Message.create({

                subject,

                body: body.trim(),

                sender: req.user._id,

                to: recipientIds,

                cc: [],

                bcc: [],

                threadId:
                    parent.threadId ||
                    parent._id,

                readBy: [
                    req.user._id
                ],

                deletedBy: []
            });


        await message.populate([
            {
                path: "sender",
                select: "employeeId name email role"
            },
            {
                path: "to",
                select: "employeeId name email"
            },
            {
                path: "cc",
                select: "employeeId name email"
            }
        ]);


        return res.status(201).json({
            success: true,
            message: "Reply sent successfully",
            data: message
        });

    } catch (error) {

        console.error("Reply error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send reply"
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET /api/messages/:id/thread
|--------------------------------------------------------------------------
*/

const getThread = async (req, res) => {

    try {

        const parent =
            await Message.findById(req.params.id);


        if (!parent) {

            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }


        const threadId =
            parent.threadId || parent._id;


        const messages =
            await Message.find({
                $or: [
                    {
                        _id: threadId
                    },
                    {
                        threadId
                    }
                ],

                deletedBy: {
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
                    createdAt: 1
                });


        return res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });

    } catch (error) {

        console.error("Get thread error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch conversation"
        });
    }
};

/*
|--------------------------------------------------------------------------
| save draft apis
|--------------------------------------------------------------------------
*/

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


        const toEmployees =
            await resolveRecipients(to);

        const ccEmployees =
            await resolveRecipients(cc);

        const bccEmployees =
            await resolveRecipients(bcc);


        const toIds =
            toEmployees.map(employee => employee._id);

        const ccIds =
            ccEmployees.map(employee => employee._id);

        const bccIds =
            bccEmployees.map(employee => employee._id);


        /*
         * UPDATE EXISTING DRAFT
         */
        if (messageId) {

            const draft =
                await Message.findOne({
                    _id: messageId,
                    sender: req.user._id,
                    status: "DRAFT"
                });


            if (!draft) {

                return res.status(404).json({
                    success: false,
                    message: "Draft not found"
                });
            }


            draft.subject = subject.trim();

            draft.body = body;

            draft.to = toIds;

            draft.cc = ccIds;

            draft.bcc = bccIds;


            await draft.save();


            return res.status(200).json({
                success: true,
                message: "Draft updated successfully",
                data: draft
            });
        }


        /*
         * CREATE NEW DRAFT
         */
        const draft = await Message.create({

            subject: subject.trim(),

            body,

            sender: req.user._id,

            to: toIds,

            cc: ccIds,

            bcc: bccIds,

            status: "DRAFT",

            threadId: null,

            readBy: [req.user._id],

            deletedBy: [],

            permanentlyDeletedBy: [],

            sentAt: null
        });


        return res.status(201).json({
            success: true,
            message: "Draft saved successfully",
            data: draft
        });

    } catch (error) {

        console.error("Save draft error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save draft"
        });
    }
};

/* --------------------------------
get draft functio
---------------------------------*/

const getDrafts = async (req, res) => {

    try {

        const drafts =
            await Message.find({
                sender: req.user._id,
                status: "DRAFT",
                permanentlyDeletedBy: {
                    $ne: req.user._id
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
            count: drafts.length,
            data: drafts
        });

    } catch (error) {

        console.error("Get drafts error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch drafts"
        });
    }
};

/* --------------------------------
delete draft functio
---------------------------------*/

const deleteDraft = async (req, res) => {

    try {

        const draft =
            await Message.findOne({
                _id: req.params.id,
                sender: req.user._id,
                status: "DRAFT"
            });


        if (!draft) {

            return res.status(404).json({
                success: false,
                message: "Draft not found"
            });
        }


        await Message.findByIdAndDelete(
            req.params.id
        );


        return res.status(200).json({
            success: true,
            message: "Draft deleted successfully"
        });

    } catch (error) {

        console.error("Delete draft error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete draft"
        });
    }
};

/* --------------------------------
 adding sear message section
 ---------------------------------*/

const searchMessages = async (req, res) => {

    try {

        const search =
            (req.query.q || "").trim();


        if (!search) {

            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }


        const regex =
            new RegExp(search, "i");


        const userId =
            req.user._id;


        const messages =
            await Message.find({

                status: "SENT",

                permanentlyDeletedBy: {
                    $ne: userId
                },

                deletedBy: {
                    $ne: userId
                },

                $or: [

                    /*
                     * Sender
                     */
                    {
                        sender: userId
                    },

                    /*
                     * Recipients
                     */
                    {
                        to: userId
                    },

                    {
                        cc: userId
                    },

                    {
                        bcc: userId
                    }
                ],

                /*
                 * Search content
                 */
                $and: [
                    {
                        $or: [
                            {
                                subject: regex
                            },
                            {
                                body: regex
                            }
                        ]
                    }
                ]

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
                createdAt: -1
            })
            .limit(50);


        return res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });

    } catch (error) {

        console.error("Search error:", error);

        return res.status(500).json({
            success: false,
            message: "Message search failed"
        });
    }
};


/* --------------------------------
 Get unread Count 
 ---------------------------------*/

const getUnreadCount = async (req, res) => {

    try {

        const count =
            await Message.countDocuments({

                status: "SENT",

                $or: [
                    {
                        to: req.user._id
                    },
                    {
                        cc: req.user._id
                    },
                    {
                        bcc: req.user._id
                    }
                ],

                readBy: {
                    $ne: req.user._id
                },

                deletedBy: {
                    $ne: req.user._id
                },

                permanentlyDeletedBy: {
                    $ne: req.user._id
                }
            });


        return res.status(200).json({
            success: true,
            unreadCount: count
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


const downloadAttachment = async (req, res) => {
    try {
        const { messageId, attachmentIndex } = req.params;

        console.log("Download request:", {
            messageId,
            attachmentIndex,
            userId: req.user?._id
        });

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID"
            });
        }

        const index = Number(attachmentIndex);

        if (!Number.isInteger(index) || index < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid attachment index"
            });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        // Check whether current user has access to this message
        const userId = req.user._id.toString();

        const hasAccess =
            message.sender?.toString() === userId ||
            message.to?.some(id => id.toString() === userId) ||
            message.cc?.some(id => id.toString() === userId) ||
            message.bcc?.some(id => id.toString() === userId);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this attachment"
            });
        }

        if (!message.attachments || !message.attachments[index]) {
            return res.status(404).json({
                success: false,
                message: "Attachment not found"
            });
        }

        const attachment = message.attachments[index];

        console.log("Attachment:", attachment);

        // filePath was saved when uploading
        const filePath = path.resolve(attachment.filePath);

        console.log("Resolved file path:", filePath);
        console.log("File exists:", fs.existsSync(filePath));

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "Attachment file does not exist on server",
                filePath: attachment.filePath
            });
        }

        res.download(
            filePath,
            attachment.originalName,
            (error) => {
                if (error) {
                    console.error("Download error:", error);

                    if (!res.headersSent) {
                        res.status(500).json({
                            success: false,
                            message: "Failed to download attachment"
                        });
                    }
                }
            }
        );

    } catch (error) {
        console.error("Download attachment error:", error);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Server error while downloading attachment",
                error: error.message
            });
        }
    }
};

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

    deleteDraft,

    searchMessages,

    getUnreadCount,
    
    downloadAttachment
};