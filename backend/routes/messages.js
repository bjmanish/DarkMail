const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
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
  sendDraft,

  searchMessages,
  getUnreadCount,

  getMessageAttachments,
  downloadAttachment,

  searchRecipients,
} = require("../controllers/messageController");

const { authMiddleware } = require("../middleware/authMiddleware");
// const { getMessageAttachments } = require("../controllers/attachmentController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
| All message routes require authentication.
*/

router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| Draft Routes
|--------------------------------------------------------------------------
| Register specific routes before /:id.
*/

router.get("/drafts", getDrafts);

router.post("/drafts", saveDraft);

router.post("/drafts/:id/send", sendDraft);

router.delete("/drafts/:id", deleteDraft);

/*
|--------------------------------------------------------------------------
| Search Routes
|--------------------------------------------------------------------------
*/

router.get("/search", searchMessages);

router.get("/recipients/search", searchRecipients);

/*
|--------------------------------------------------------------------------
| Unread Count
|--------------------------------------------------------------------------
*/

router.get("/unread-count", getUnreadCount);

/*
|--------------------------------------------------------------------------
| Trash
|--------------------------------------------------------------------------
*/

router.get("/trash", getTrash);

/*
|--------------------------------------------------------------------------
| Message Attachments
|--------------------------------------------------------------------------
| Existing download route:
| GET /api/messages/:messageId/attachments/:attachmentIndex
|
| Keep this route if messageController.downloadAttachment uses the
| existing Message attachment structure.
*/

router.get("/:messageId/attachments/:attachmentIndex", downloadAttachment);

router.get("/:messageId/attachments", getMessageAttachments);

/*
|--------------------------------------------------------------------------
| Thread Routes
|--------------------------------------------------------------------------
*/

router.get("/:id/thread", getThread);

/*
|--------------------------------------------------------------------------
| Inbox / Sent / Other Message Folders
|--------------------------------------------------------------------------
*/

router.get("/", getMessages);

/*
|--------------------------------------------------------------------------
| Single Message
|--------------------------------------------------------------------------
*/

router.get("/:id", getMessageById);

/*
|--------------------------------------------------------------------------
| Send New Message
|--------------------------------------------------------------------------
| The upload middleware must accept the field name "attachments".
*/

router.post("/", upload.array("attachments", 10), sendMessage);

/*
|--------------------------------------------------------------------------
| Reply to Message
|--------------------------------------------------------------------------
*/

router.post("/:id/reply", replyToMessage);

/*
|--------------------------------------------------------------------------
| Mark Message as Read
|--------------------------------------------------------------------------
*/

router.patch("/:id/read", markAsRead);

/*
|--------------------------------------------------------------------------
| Move Message to Trash
|--------------------------------------------------------------------------
*/

router.patch("/:id/trash", moveToTrash);

/*
|--------------------------------------------------------------------------
| Restore Message
|--------------------------------------------------------------------------
*/

router.patch("/:id/restore", restoreMessage);

/*
|--------------------------------------------------------------------------
| Permanently Delete Message
|--------------------------------------------------------------------------
*/

router.delete("/:id", permanentlyDeleteMessage);

module.exports = router;
