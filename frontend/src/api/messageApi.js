import api from "./axios";

/* =========================================================
   SEARCH RECIPIENTS
========================================================= */

export const searchRecipientsApi = async (query = "") => {

    const response = await api.get(
        "/messages/recipients/search",
        {
            params: {
                q: query
            }
        }
    );

    return response.data;
};


/* =========================================================
   SEND MESSAGE
========================================================= */

export const sendMessageApi = async (formData) => {

    const response = await api.post(
        "/messages",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};


/* =========================================================
   SAVE DRAFT
========================================================= */

export const saveDraftApi = async (data) => {

    const response = await api.post(
        "/messages/drafts",
        data
    );

    return response.data;
};


/* =========================================================
   GET DRAFTS
========================================================= */

export const getDraftsApi = async () => {

    const response = await api.get(
        "/messages/drafts"
    );

    return response.data;
};


/* =========================================================
   SEND DRAFT
========================================================= */

export const sendDraftApi = async (draftId) => {

    const response = await api.post(
        `/messages/drafts/${draftId}/send`
    );

    return response.data;
};


/* =========================================================
   DELETE DRAFT
========================================================= */

export const deleteDraftApi = async (draftId) => {

    const response = await api.delete(
        `/messages/drafts/${draftId}`
    );

    return response.data;
};


/* =========================================================
   GET MESSAGES
========================================================= */

export const getMessagesApi = async ({
    folder = "inbox",
    page = 1,
    limit = 20
} = {}) => {

    const response = await api.get(
        "/messages",
        {
            params: {
                folder,
                page,
                limit
            }
        }
    );

    /*
     * Backend now returns:
     *
     * {
     *     success: true,
     *     data: [],
     *     messages: [],
     *     pagination...
     * }
     *
     * Return the complete response so the
     * folder pages can access all information.
     */

    return response.data;
};


/* =========================================================
   GET SINGLE MESSAGE
========================================================= */

export const getMessageByIdApi = async (messageId) => {

    const response = await api.get(
        `/messages/${messageId}`
    );

    return response.data;
};


/* =========================================================
   MARK MESSAGE AS READ
========================================================= */

export const markMessageAsReadApi = async (messageId) => {

    const response = await api.patch(
        `/messages/${messageId}/read`
    );

    return response.data;
};


/* =========================================================
   MOVE MESSAGE TO TRASH
========================================================= */

export const moveMessageToTrashApi = async (messageId) => {

    const response = await api.patch(
        `/messages/${messageId}/trash`
    );

    return response.data;
};


/* =========================================================
   RESTORE MESSAGE
========================================================= */

export const restoreMessageApi = async (messageId) => {

    const response = await api.patch(
        `/messages/${messageId}/restore`
    );

    return response.data;
};


/* =========================================================
   PERMANENT DELETE MESSAGE
========================================================= */

export const permanentlyDeleteMessageApi = async (
    messageId
) => {

    const response = await api.delete(
        `/messages/${messageId}`
    );

    return response.data;
};


/* =========================================================
   GET TRASH
========================================================= */

export const getTrashApi = async () => {

    const response = await api.get(
        "/messages/trash"
    );

    return response.data;
};


/* =========================================================
   GET UNREAD COUNT
========================================================= */

export const getUnreadCountApi = async () => {

    const response = await api.get(
        "/messages/unread-count"
    );

    return response.data;
};


/* =========================================================
   SEARCH MESSAGES
========================================================= */

export const searchMessagesApi = async (query = "") => {

    const response = await api.get(
        "/messages/search",
        {
            params: {
                q: query
            }
        }
    );

    return response.data;
};


/* =========================================================
   REPLY TO MESSAGE
========================================================= */

export const replyToMessageApi = async (
    messageId,
    body
) => {

    const response = await api.post(
        `/messages/${messageId}/reply`,
        {
            body
        }
    );

    return response.data;
};


/* =========================================================
   GET THREAD
========================================================= */

export const getThreadApi = async (messageId) => {

    const response = await api.get(
        `/messages/${messageId}/thread`
    );

    return response.data;
};