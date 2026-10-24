const express = require("express");

const {
  uploadAttachments,
  getMessageAttachments,
  downloadAttachment,
  deleteAttachment,
} = require("../controllers/attachmentController");

const upload = require("../middleware/uploadMiddleware");

const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Upload up to 10 files to an existing message.
router.post(
  "/:messageId",
  authMiddleware,
  upload.array("files", 10),
  uploadAttachments,
);

// Get every attachment belonging to a message.
router.get("/message/:messageId", authMiddleware, getMessageAttachments);

// Download an individual attachment.
router.get("/download/:attachmentId", authMiddleware, downloadAttachment);

// Delete an individual attachment.
router.delete("/:attachmentId", authMiddleware, deleteAttachment);

module.exports = router;
