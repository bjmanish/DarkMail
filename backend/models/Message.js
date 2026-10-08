const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            trim: true,
            default: ""
        },

        body: {
            type: String,
            default: ""
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        to: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee"
            }
        ],

        cc: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee"
            }
        ],

        bcc: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee"
            }
        ],

        attachments: [
            {
                originalName: String,
                fileName: String,
                filePath: String,
                mimeType: String,
                size: Number
            }
        ],

        status: {
            type: String,
            enum: ["DRAFT", "SENT", "INBOX", "TRASH"],
            default: "DRAFT",
            index: true
        },

        threadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null
        },

        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee"
            }
        ],

        deletedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee"
            }
        ],

        permanentlyDeletedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee"
            }
        ],

        sentAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

messageSchema.index({
    sender: 1,
    createdAt: -1
});

messageSchema.index({
    to: 1,
    createdAt: -1
});

messageSchema.index({
    cc: 1,
    createdAt: -1
});

messageSchema.index({
    bcc: 1,
    createdAt: -1
});

module.exports = mongoose.model("Message", messageSchema);