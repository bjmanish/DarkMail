const fs = require("fs");
const path = require("path");

const Message = require("../models/Message");

const MessageAttachment = require("../models/MessageAttachment");

const { uploadDirectory } = require("../middleware/uploadMiddleware");

const {
  getAuthenticatedUserId,
  findAccessibleMessage,
} = require("../services/attachmentService");

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function getAttachmentPath(attachment) {
  // Resolve only generated filenames inside the upload directory.
  const fileName = path.basename(attachment.storedFileName);

  return path.join(uploadDirectory, fileName);
}

function getPublicAttachment(attachment) {
  return {
    id: attachment._id,
    messageId: attachment.messageId,
    senderId: attachment.senderId,
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    fileSize: attachment.fileSize,
    createdAt: attachment.createdAt,
  };
}

// POST /api/attachments/:messageId
// Upload multiple files to an existing message.
const uploadAttachments = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const senderId = getAuthenticatedUserId(req);
  const files = req.files || [];

  if (!files.length) {
    return res.status(400).json({
      success: false,
      message: "Please select at least one file.",
    });
  }

  try {
    const message = await Message.findById(messageId).select("sender").lean();

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    // Only the message sender can add attachments.
    if (String(message.sender) !== String(senderId)) {
      return res.status(403).json({
        success: false,
        message: "Only the message sender can add attachments.",
      });
    }

    const documents = files.map((file) => ({
      messageId,
      senderId,

      fileName: path.basename(file.originalname).slice(0, 255),

      storedFileName: file.filename,
      contentType: file.mimetype,
      fileSize: file.size,

      // Store the generated filename, not a client-provided path.
      storagePath: file.filename,
      storageProvider: "local",
    }));

    const attachments = await MessageAttachment.insertMany(documents);

    return res.status(201).json({
      success: true,
      message: "Attachments uploaded successfully.",
      count: attachments.length,
      attachments: attachments.map(getPublicAttachment),
    });
  } catch (error) {
    // Clean up files if database insertion fails.
    await Promise.all(
      files.map(async (file) => {
        try {
          await fs.promises.unlink(file.path);
        } catch (cleanupError) {
          if (cleanupError.code !== "ENOENT") {
            console.error("Attachment cleanup failed:", cleanupError.message);
          }
        }
      }),
    );

    throw error;
  }
});

// GET /api/attachments/message/:messageId
// Retrieve all attachments for a message.
const getMessageAttachments = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  await findAccessibleMessage(messageId, req);

  const attachments = await MessageAttachment.find({
    messageId,
    isDeleted: false,
  })
    .sort({ createdAt: 1 })
    .lean();

  return res.status(200).json({
    success: true,
    count: attachments.length,
    attachments: attachments.map(getPublicAttachment),
  });
});

// GET /api/attachments/download/:attachmentId
// Download one attachment by its individual ID.
const downloadAttachment = asyncHandler(async (req, res) => {
  const { attachmentId } = req.params;

  const attachment = await MessageAttachment.findOne({
    _id: attachmentId,
    isDeleted: false,
  }).lean();

  if (!attachment) {
    return res.status(404).json({
      success: false,
      message: "Attachment not found.",
    });
  }

  // Verify that this user can access the associated message.
  await findAccessibleMessage(String(attachment.messageId), req);

  const filePath = getAttachmentPath(attachment);

  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
  } catch {
    console.error("Attachment file missing:", {
      attachmentId: String(attachment._id),
      fileName: attachment.storedFileName,
    });

    return res.status(404).json({
      success: false,
      message:
        "The attachment record exists, but the file is unavailable in storage.",
    });
  }

  res.setHeader("Content-Type", "application/octet-stream");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="attachment-${attachment._id}"`,
  );

  res.setHeader("Content-Length", String(attachment.fileSize));

  return res.sendFile(
    filePath,
    {
      dotfiles: "deny",
    },
    (error) => {
      if (error && !res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Unable to download attachment.",
        });
      }
    },
  );
});

// DELETE /api/attachments/:attachmentId
// Soft-delete an attachment and remove its local file.
const deleteAttachment = asyncHandler(async (req, res) => {
  const { attachmentId } = req.params;
  const userId = String(getAuthenticatedUserId(req) || "");

  const attachment = await MessageAttachment.findOne({
    _id: attachmentId,
    isDeleted: false,
  });

  if (!attachment) {
    return res.status(404).json({
      success: false,
      message: "Attachment not found.",
    });
  }

  const message = await Message.findById(attachment.messageId)
    .select("sender")
    .lean();

  if (!message) {
    return res.status(404).json({
      success: false,
      message: "Associated message not found.",
    });
  }

  const isMessageSender = String(message.sender) === userId;

  const isAttachmentSender = String(attachment.senderId) === userId;

  if (!isMessageSender && !isAttachmentSender) {
    return res.status(403).json({
      success: false,
      message: "You cannot delete this attachment.",
    });
  }

  const filePath = getAttachmentPath(attachment);

  attachment.isDeleted = true;
  await attachment.save();

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    // The database record is already marked deleted.
    if (error.code !== "ENOENT") {
      console.error("Failed to remove attachment file:", error.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Attachment deleted successfully.",
  });
});

module.exports = {
  uploadAttachments,
  getMessageAttachments,
  downloadAttachment,
  deleteAttachment,
};
