const fs = require("fs");
const path = require("path");


const createAttachmentMetadata = (file) => {

    return {
        originalName: file.originalname,

        fileName: file.filename,

        filePath: file.path,

        mimeType: file.mimetype,

        size: file.size
    };
};


const deleteAttachmentFile = async (attachment) => {

    if (!attachment || !attachment.filePath) {
        return;
    }

    try {

        await fs.promises.unlink(
            attachment.filePath
        );

    } catch (error) {

        /*
         * File may already have been deleted.
         */
        if (error.code !== "ENOENT") {
            console.error(
                "Attachment delete error:",
                error.message
            );
        }
    }
};


const deleteMessageAttachments = async (message) => {

    if (!message || !message.attachments) {
        return;
    }

    for (const attachment of message.attachments) {

        await deleteAttachmentFile(
            attachment
        );
    }
};


module.exports = {
    createAttachmentMetadata,
    deleteAttachmentFile,
    deleteMessageAttachments
};