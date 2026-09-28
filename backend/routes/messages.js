const express = require("express");

const upload =
    require("../middleware/uploadMiddleware");

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
    searchMessages,
    getUnreadCount,
    downloadAttachment
} = require("../controllers/messageController");

const {
    authMiddleware
} = require("../middleware/authMiddleware");

const router = express.Router();


/*
 * All message APIs require login
 */
router.use(authMiddleware);


/*
|--------------------------------------------------------------------------
| Drafts
|--------------------------------------------------------------------------
*/

router.get(
    "/drafts",
    getDrafts
);

router.post(
    "/drafts",
    saveDraft
);

router.delete(
    "/drafts/:id",
    deleteDraft
);


/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

router.get(
    "/search",
    searchMessages
);


/*
|--------------------------------------------------------------------------
| Unread count
|--------------------------------------------------------------------------
*/

router.get(
    "/unread-count",
    getUnreadCount
);


/*
|--------------------------------------------------------------------------
| Trash
|--------------------------------------------------------------------------
*/

router.get(
    "/trash",
    getTrash
);

router.get(
    "/:messageId/attachments/:attachmentIndex",
    downloadAttachment
);

/*
|--------------------------------------------------------------------------
| Inbox / Sent / Unread
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    getMessages
);


/*
|--------------------------------------------------------------------------
| Thread
|--------------------------------------------------------------------------
*/

router.get(
    "/:id/thread",
    getThread
);

router.post("/", upload.array("attachments", 10), sendMessage);

/*
|--------------------------------------------------------------------------
| Individual message
|--------------------------------------------------------------------------
*/

router.get(
    "/:id",
    getMessageById
);


/*
|--------------------------------------------------------------------------
| Send
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    upload.array("attachments", 10),
    sendMessage
);


/*
|--------------------------------------------------------------------------
| Reply
|--------------------------------------------------------------------------
*/

router.post(
    "/:id/reply",
    upload.array("attachments", 10),
    replyToMessage
);


/*
|--------------------------------------------------------------------------
| Read
|--------------------------------------------------------------------------
*/

router.patch(
    "/:id/read",
    markAsRead
);


/*
|--------------------------------------------------------------------------
| Trash
|--------------------------------------------------------------------------
*/

router.patch(
    "/:id/trash",
    moveToTrash
);


/*
|--------------------------------------------------------------------------
| Restore
|--------------------------------------------------------------------------
*/

router.patch(
    "/:id/restore",
    restoreMessage
);


/*
|--------------------------------------------------------------------------
| Permanent delete
|--------------------------------------------------------------------------
*/

router.delete(
    "/:id",
    permanentlyDeleteMessage
);



module.exports = router;