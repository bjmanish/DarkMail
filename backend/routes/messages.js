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
    sendDraft,

    searchMessages,
    getUnreadCount,

    downloadAttachment,

    searchRecipients

} = require(
    "../controllers/messageController"
);

const {
    authMiddleware
} = require(
    "../middleware/authMiddleware"
);


const router =
    express.Router();


/*
|--------------------------------------------------------------------------
| Authentication required
|--------------------------------------------------------------------------
*/

router.use(
    authMiddleware
);


/*
|--------------------------------------------------------------------------
| Draft routes
|
| IMPORTANT:
| These must come before /:id
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

router.post(
    "/drafts/:id/send",
    sendDraft
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
| Attachments
|
| Must come before /:id
|--------------------------------------------------------------------------
*/

router.get(
    "/:messageId/attachments/:attachmentIndex",
    downloadAttachment
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

router.get(
    "/recipients/search",
    searchRecipients
);

/*
|--------------------------------------------------------------------------
| Single message
|--------------------------------------------------------------------------
*/

router.get(
    "/:id",
    getMessageById
);


/*
|--------------------------------------------------------------------------
| Send new message
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    upload.array(
        "attachments",
        10
    ),
    sendMessage
);


/*
|--------------------------------------------------------------------------
| Reply
|--------------------------------------------------------------------------
*/

router.post(
    "/:id/reply",
    replyToMessage
);


/*
|--------------------------------------------------------------------------
| Mark read
|--------------------------------------------------------------------------
*/

router.patch(
    "/:id/read",
    markAsRead
);


/*
|--------------------------------------------------------------------------
| Move to trash
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