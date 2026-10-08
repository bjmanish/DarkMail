import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Check,
    ChevronLeft,
    ChevronRight,
    FileText,
    Inbox as InboxIcon,
    Loader2,
    Paperclip,
    RefreshCw,
    RotateCcw,
    Search,
    Send,
    Trash2,
    X,
    AlertCircle,
    Mail,
    MailOpen,
} from "lucide-react";

import {
    getMessagesApi,
    getDraftsApi,
    getTrashApi,
    sendDraftApi,
    deleteDraftApi,
    moveMessageToTrashApi,
    restoreMessageApi,
    permanentlyDeleteMessageApi,
    markMessageAsReadApi,
} from "../../api/messageApi";

import MessageViewer from "../../components/mail/MessageViewer";


/* =========================================================
   CONSTANTS
========================================================= */

const LIMIT = 20;


/* =========================================================
   FOLDER CONFIGURATION
========================================================= */

const FOLDER_CONFIG = {

    inbox: {
        label: "Inbox",
        icon: InboxIcon,
        description:
            "All your mailbox messages.",
        apiFolder: "all",
    },

    sent: {
        label: "Sent",
        icon: Send,
        description:
            "Messages you have sent.",
        apiFolder: "sent",
    },

    drafts: {
        label: "Drafts",
        icon: FileText,
        description:
            "Messages saved as drafts.",
        apiFolder: "drafts",
    },

    trash: {
        label: "Trash",
        icon: Trash2,
        description:
            "Deleted messages.",
        apiFolder: "trash",
    },

};


/* =========================================================
   MESSAGE ID
========================================================= */

const getMessageId = (message) => {

    return (
        message?._id ||
        message?.id ||
        message?.messageId
    );

};


/* =========================================================
   PERSON NAME
========================================================= */

const getPersonName = (person) => {

    if (!person) {
        return "Unknown User";
    }

    if (typeof person === "string") {
        return person;
    }

    return (
        person.name ||
        person.fullName ||
        person.employeeName ||
        person.username ||
        person.email ||
        "Unknown User"
    );

};


/* =========================================================
   PERSON EMAIL
========================================================= */

const getPersonEmail = (person) => {

    if (!person) {
        return "";
    }

    if (typeof person === "string") {
        return person;
    }

    return (
        person.email ||
        person.emailAddress ||
        ""
    );

};


/* =========================================================
   INITIAL
========================================================= */

const getInitial = (person) => {

    return (
        getPersonName(person)
            ?.charAt(0)
            ?.toUpperCase() ||
        "U"
    );

};


/* =========================================================
   SUBJECT
========================================================= */

const getSubject = (message) => {

    return (
        message?.subject ||
        "(No Subject)"
    );

};


/* =========================================================
   BODY PREVIEW
========================================================= */

const getBodyPreview = (message) => {

    const body =
        message?.body ||
        message?.text ||
        "";

    return String(body)
        .replace(/\s+/g, " ")
        .trim();

};


/* =========================================================
   DATE
========================================================= */

const formatShortDate = (date) => {

    if (!date) {
        return "";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "";
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
        }
    );

};


/* =========================================================
   FULL DATE
========================================================= */

const formatDateTime = (date) => {

    if (!date) {
        return "";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "";
    }

    return parsedDate.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );

};


/* =========================================================
   NORMALIZE API RESPONSE
========================================================= */

const normalizeMessages = (
    response
) => {

    if (!response) {
        return [];
    }

    if (Array.isArray(response)) {
        return response;
    }

    if (
        Array.isArray(
            response.data
        )
    ) {
        return response.data;
    }

    if (
        Array.isArray(
            response.messages
        )
    ) {
        return response.messages;
    }

    if (
        response.data &&
        Array.isArray(
            response.data.messages
        )
    ) {
        return response.data.messages;
    }

    return [];

};


/* =========================================================
   NORMALIZE TOTAL
========================================================= */

const normalizeTotal = (
    response
) => {

    if (!response) {
        return 0;
    }

    if (
        typeof response.total ===
        "number"
    ) {
        return response.total;
    }

    if (
        typeof response.data?.total ===
        "number"
    ) {
        return response.data.total;
    }

    if (
        typeof response.pagination?.total ===
        "number"
    ) {
        return response.pagination.total;
    }

    if (
        typeof response.data?.pagination?.total ===
        "number"
    ) {
        return response.data.pagination.total;
    }

    return normalizeMessages(
        response
    ).length;

};


/* =========================================================
   NORMALIZE PAGINATION
========================================================= */

const normalizePagination = (
    response
) => {

    if (!response) {

        return {

            page: 1,

            limit: LIMIT,

            total: 0,

            totalPages: 1,

            hasNext: false,

            hasPrevious: false,

        };

    }

    const pagination =
        response?.pagination ||
        response?.data?.pagination ||
        {};

    const page =
        Number(
            response?.page ||
            pagination.page ||
            1
        );

    const limit =
        Number(
            response?.limit ||
            pagination.limit ||
            LIMIT
        );

    const total =
        Number(
            response?.total ??
            response?.data?.total ??
            pagination.total ??
            0
        );

    const totalPages =
        Number(
            response?.pages ??
            response?.totalPages ??
            response?.data?.pages ??
            pagination.totalPages ??
            pagination.pages ??
            Math.max(
                Math.ceil(
                    total / limit
                ),
                1
            )
        );

    return {

        page,

        limit,

        total,

        totalPages:

            totalPages > 0
                ? totalPages
                : 1,

        hasNext:
            response?.hasNext ??
            pagination.hasNext ??
            page < totalPages,

        hasPrevious:
            response?.hasPrevious ??
            pagination.hasPrevious ??
            page > 1,

    };

};


/* =========================================================
   MESSAGE FOLDER BADGE

   IMPORTANT:
   This receives message.mailFolder.

   It does NOT receive the current page folder.
========================================================= */

const getFolderBadge = (
    mailFolder
) => {

    const folder =
        String(
            mailFolder || ""
        )
            .trim()
            .toLowerCase();

    switch (folder) {

        case "inbox":

            return {

                label: "Inbox",

                icon: (
                    <InboxIcon
                        size={12}
                    />
                ),

                className:
                    "bg-indigo-50 text-indigo-600 border-indigo-100",

            };


        case "sent":

            return {

                label: "Sent",

                icon: (
                    <Send
                        size={12}
                    />
                ),

                className:
                    "bg-blue-50 text-blue-600 border-blue-100",

            };


        case "drafts":

            return {

                label: "Draft",

                icon: (
                    <FileText
                        size={12}
                    />
                ),

                className:
                    "bg-amber-50 text-amber-600 border-amber-100",

            };


        case "trash":

            return {

                label: "Trash",

                icon: (
                    <Trash2
                        size={12}
                    />
                ),

                className:
                    "bg-red-50 text-red-600 border-red-100",

            };


        default:

            return {

                label: "Mail",

                icon: (
                    <Mail
                        size={12}
                    />
                ),

                className:
                    "bg-gray-50 text-gray-600 border-gray-200",

            };

    }

};


/* =========================================================
   MAIN MAIL FOLDER
========================================================= */

const MailFolder = ({
    folder = "inbox",
}) => {

    const config =
        FOLDER_CONFIG[
            folder
        ] ||
        FOLDER_CONFIG.inbox;

    const FolderIcon =
        config.icon;


    /* =====================================================
       STATE
    ===================================================== */

    const [
        messages,
        setMessages,
    ] = useState([]);


    const [
        selectedMessages,
        setSelectedMessages,
    ] = useState([]);


    const [
        selectedMessage,
        setSelectedMessage,
    ] = useState(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        search,
        setSearch,
    ] = useState("");


    const [
        page,
        setPage,
    ] = useState(1);


    const [
        pagination,
        setPagination,
    ] = useState({

        page: 1,

        limit: LIMIT,

        total: 0,

        totalPages: 1,

        hasNext: false,

        hasPrevious: false,

    });


    /* =====================================================
       FOLDER COUNTS
    ===================================================== */

    const [
        folderCounts,
        setFolderCounts,
    ] = useState({

        inbox: 0,

        sent: 0,

        drafts: 0,

        trash: 0,

    });


    /* =====================================================
       LOAD MESSAGES

       IMPORTANT:

       Inbox:
           folder = "all"

       Sent:
           folder = "sent"

       Drafts:
           getDraftsApi()

       Trash:
           getTrashApi()
    ===================================================== */

    const loadMessages =
        useCallback(
            async ({
                showLoading = true,
                requestedPage = page,
            } = {}) => {

                try {

                    if (
                        showLoading
                    ) {

                        setLoading(
                            true
                        );

                    } else {

                        setRefreshing(
                            true
                        );

                    }

                    setError("");

                    let response;


                    /* =========================================
                       INBOX

                       MIXED MAILBOX

                       This is the main change.
                    ========================================= */

                    if (
                        folder ===
                        "inbox"
                    ) {

                        response =
                            await getMessagesApi({

                                folder:
                                    "all",

                                page:
                                    requestedPage,

                                limit:
                                    LIMIT,

                            });

                    }


                    /* =========================================
                       SENT
                    ========================================= */

                    else if (
                        folder ===
                        "sent"
                    ) {

                        response =
                            await getMessagesApi({

                                folder:
                                    "sent",

                                page:
                                    requestedPage,

                                limit:
                                    LIMIT,

                            });

                    }


                    /* =========================================
                       DRAFTS
                    ========================================= */

                    else if (
                        folder ===
                        "drafts"
                    ) {

                        response =
                            await getDraftsApi();

                    }


                    /* =========================================
                       TRASH
                    ========================================= */

                    else if (
                        folder ===
                        "trash"
                    ) {

                        response =
                            await getTrashApi();

                    }


                    /* =========================================
                       NORMALIZE
                    ========================================= */

                    const data =
                        normalizeMessages(
                            response
                        );


                    setMessages(
                        data
                    );


                    setPagination(
                        normalizePagination(
                            response
                        )
                    );


                    setSelectedMessages(
                        []
                    );


                } catch (
                    err
                ) {

                    console.error(
                        `Load ${folder} error:`,
                        err
                    );


                    setError(

                        err?.response
                            ?.data
                            ?.message ||

                        err?.message ||

                        `Unable to load ${config.label}.`

                    );


                } finally {

                    setLoading(
                        false
                    );

                    setRefreshing(
                        false
                    );

                }

            },
            [
                folder,
                page,
                config.label,
            ]
        );


    /* =====================================================
       LOAD FOLDER COUNTS

       These remain separate because they represent
       individual folder totals.
    ===================================================== */

    const loadFolderCounts =
        useCallback(
            async () => {

                try {

                    const [

                        inboxResponse,

                        sentResponse,

                        draftsResponse,

                        trashResponse,

                    ] =
                        await Promise.all([

                            getMessagesApi({

                                folder:
                                    "all",

                                page: 1,

                                limit: 1,

                            }),

                            getMessagesApi({

                                folder:
                                    "sent",

                                page: 1,

                                limit: 1,

                            }),

                            getDraftsApi(),

                            getTrashApi(),

                        ]);


                    setFolderCounts({

                        inbox:
                            normalizeTotal(
                                inboxResponse
                            ),

                        sent:
                            normalizeTotal(
                                sentResponse
                            ),

                        drafts:
                            normalizeTotal(
                                draftsResponse
                            ),

                        trash:
                            normalizeTotal(
                                trashResponse
                            ),

                    });


                } catch (
                    countError
                ) {

                    console.warn(
                        "Unable to load folder counts:",
                        countError
                    );

                }

            },
            []
        );


    /* =====================================================
       RESET WHEN FOLDER CHANGES
    ===================================================== */

    useEffect(() => {

        setPage(1);

        setMessages([]);

        setSelectedMessages([]);

        setSelectedMessage(null);

        setSearch("");

    }, [
        folder,
    ]);


    /* =====================================================
       LOAD CURRENT FOLDER
    ===================================================== */

    useEffect(() => {

        loadMessages({

            showLoading:
                true,

            requestedPage:
                page,

        });

    }, [
        folder,
        page,
        loadMessages,
    ]);


    /* =====================================================
       LOAD COUNTS
    ===================================================== */

    useEffect(() => {

        loadFolderCounts();

    }, [
        loadFolderCounts,
    ]);


    /* =====================================================
       SEARCH
    ===================================================== */

    const filteredMessages =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                if (!query) {

                    return messages;

                }


                return messages.filter(
                    (message) => {

                        const subject =
                            getSubject(
                                message
                            )
                                .toLowerCase();


                        const body =
                            getBodyPreview(
                                message
                            )
                                .toLowerCase();


                        const sender =
                            getPersonName(
                                message.sender
                            )
                                .toLowerCase();


                        const email =
                            getPersonEmail(
                                message.sender
                            )
                                .toLowerCase();


                        const mailFolder =
                            String(
                                message?.mailFolder ||
                                ""
                            )
                                .toLowerCase();


                        const badge =
                            getFolderBadge(
                                message?.mailFolder
                            )
                                .label
                                .toLowerCase();


                        return (

                            subject.includes(
                                query
                            ) ||

                            body.includes(
                                query
                            ) ||

                            sender.includes(
                                query
                            ) ||

                            email.includes(
                                query
                            ) ||

                            mailFolder.includes(
                                query
                            ) ||

                            badge.includes(
                                query
                            )

                        );

                    }
                );

            },
            [
                messages,
                search,
            ]
        );


    /* =====================================================
       SELECT MESSAGE
    ===================================================== */

    const handleSelectMessage =
        (
            messageId
        ) => {

            setSelectedMessages(
                (previous) => {

                    if (
                        previous.includes(
                            messageId
                        )
                    ) {

                        return previous.filter(
                            (id) =>
                                id !==
                                messageId
                        );

                    }


                    return [

                        ...previous,

                        messageId,

                    ];

                }
            );

        };


    /* =====================================================
       SELECT ALL
    ===================================================== */

    const allVisibleSelected =
        filteredMessages.length >
            0 &&
        filteredMessages.every(
            (message) =>
                selectedMessages.includes(
                    getMessageId(
                        message
                    )
                )
        );


    const handleSelectAll =
        () => {

            if (
                allVisibleSelected
            ) {

                setSelectedMessages(
                    (previous) =>
                        previous.filter(
                            (id) =>
                                !filteredMessages.some(
                                    (message) =>
                                        getMessageId(
                                            message
                                        ) ===
                                        id
                                )
                        )
                );

                return;

            }


            const visibleIds =
                filteredMessages
                    .map(
                        getMessageId
                    )
                    .filter(Boolean);


            setSelectedMessages(
                (previous) => {

                    return [

                        ...new Set([

                            ...previous,

                            ...visibleIds,

                        ]),

                    ];

                }
            );

        };


    /* =====================================================
       CLEAR SELECTION
    ===================================================== */

    const clearSelection =
        () => {

            setSelectedMessages(
                []
            );

        };


    /* =====================================================
       OPEN MESSAGE
    ===================================================== */

    const handleOpenMessage =
        async (
            message
        ) => {

            setSelectedMessage(
                message
            );


            const messageId =
                getMessageId(
                    message
                );


            /*
             * Draft and Trash messages
             * should not be marked as read.
             */

            const messageFolder =
                String(
                    message?.mailFolder ||
                    ""
                )
                    .toLowerCase();


            if (
                messageFolder ===
                    "drafts" ||
                messageFolder ===
                    "trash"
            ) {

                return;

            }


            if (
                message?.isRead ===
                    false ||
                message?.read ===
                    false
            ) {

                try {

                    await markMessageAsReadApi(
                        messageId
                    );


                    setMessages(
                        (previous) =>
                            previous.map(
                                (item) => {

                                    if (
                                        getMessageId(
                                            item
                                        ) !==
                                        messageId
                                    ) {

                                        return item;

                                    }


                                    return {

                                        ...item,

                                        isRead:
                                            true,

                                        read:
                                            true,

                                    };

                                }
                            )
                    );


                    setSelectedMessage(
                        (previous) => {

                            if (
                                !previous ||
                                getMessageId(
                                    previous
                                ) !==
                                messageId
                            ) {

                                return previous;

                            }


                            return {

                                ...previous,

                                isRead:
                                    true,

                                read:
                                    true,

                            };

                        }
                    );


                } catch (
                    readError
                ) {

                    console.warn(
                        "Mark read failed:",
                        readError
                    );

                }

            }

        };


    /* =====================================================
       DELETE SINGLE
    ===================================================== */

    const handleDeleteSingle =
        async (
            messageId
        ) => {

            if (!messageId) {
                return;
            }


            try {

                setActionLoading(
                    true
                );


                /*
                 * IMPORTANT:
                 * Use the row's mailFolder
                 * rather than the current page folder.
                 */

                const targetMessage =
                    messages.find(
                        (message) =>
                            getMessageId(
                                message
                            ) ===
                            messageId
                    );


                const messageFolder =
                    String(
                        targetMessage?.mailFolder ||
                        folder
                    )
                        .toLowerCase();


                if (
                    messageFolder ===
                    "drafts"
                ) {

                    await deleteDraftApi(
                        messageId
                    );

                } else if (
                    messageFolder ===
                    "trash"
                ) {

                    await permanentlyDeleteMessageApi(
                        messageId
                    );

                } else {

                    await moveMessageToTrashApi(
                        messageId
                    );

                }


                if (
                    selectedMessage &&
                    getMessageId(
                        selectedMessage
                    ) ===
                    messageId
                ) {

                    setSelectedMessage(
                        null
                    );

                }


                setSelectedMessages(
                    (previous) =>
                        previous.filter(
                            (id) =>
                                id !==
                                messageId
                        )
                );


                await loadMessages({

                    showLoading:
                        false,

                    requestedPage:
                        page,

                });


                await loadFolderCounts();


            } catch (
                deleteError
            ) {

                console.error(
                    "Delete error:",
                    deleteError
                );


                alert(

                    deleteError?.response
                        ?.data
                        ?.message ||

                    deleteError?.message ||

                    "Unable to delete message."

                );


            } finally {

                setActionLoading(
                    false
                );

            }

        };


    /* =====================================================
       BULK DELETE
    ===================================================== */

    const handleBulkDelete =
        async () => {

            if (
                selectedMessages.length ===
                0
            ) {

                return;

            }


            /*
             * For the mixed Inbox/All screen,
             * selected messages can belong to
             * different folders.
             */

            const selectedMessageObjects =
                messages.filter(
                    (message) =>
                        selectedMessages.includes(
                            getMessageId(
                                message
                            )
                        )
                );


            const hasTrash =
                selectedMessageObjects.some(
                    (message) =>
                        String(
                            message?.mailFolder ||
                            ""
                        )
                            .toLowerCase() ===
                        "trash"
                );


            const hasDraft =
                selectedMessageObjects.some(
                    (message) =>
                        String(
                            message?.mailFolder ||
                            ""
                        )
                            .toLowerCase() ===
                        "drafts"
                );


            let confirmationText;


            if (
                hasTrash &&
                !hasDraft &&
                selectedMessageObjects.every(
                    (message) =>
                        String(
                            message?.mailFolder ||
                            ""
                        )
                            .toLowerCase() ===
                        "trash"
                )
            ) {

                confirmationText =
                    `Permanently delete ${selectedMessages.length} selected message(s)? This cannot be undone.`;

            } else {

                confirmationText =
                    `Process ${selectedMessages.length} selected message(s)? Messages will be moved to Trash and drafts will be deleted.`;

            }


            const confirmed =
                window.confirm(
                    confirmationText
                );


            if (!confirmed) {
                return;
            }


            try {

                setActionLoading(
                    true
                );


                await Promise.all(

                    selectedMessageObjects.map(
                        async (
                            message
                        ) => {

                            const messageId =
                                getMessageId(
                                    message
                                );


                            const messageFolder =
                                String(
                                    message?.mailFolder ||
                                    ""
                                )
                                    .toLowerCase();


                            if (
                                messageFolder ===
                                "drafts"
                            ) {

                                return deleteDraftApi(
                                    messageId
                                );

                            }


                            if (
                                messageFolder ===
                                "trash"
                            ) {

                                return permanentlyDeleteMessageApi(
                                    messageId
                                );

                            }


                            return moveMessageToTrashApi(
                                messageId
                            );

                        }
                    )

                );


                setSelectedMessage(
                    null
                );


                setSelectedMessages(
                    []
                );


                await loadMessages({

                    showLoading:
                        false,

                    requestedPage:
                        page,

                });


                await loadFolderCounts();


            } catch (
                bulkDeleteError
            ) {

                console.error(
                    "Bulk delete error:",
                    bulkDeleteError
                );


                alert(

                    bulkDeleteError?.response
                        ?.data
                        ?.message ||

                    bulkDeleteError?.message ||

                    "Unable to process selected messages."

                );


            } finally {

                setActionLoading(
                    false
                );

            }

        };


    /* =====================================================
       RESTORE SINGLE
    ===================================================== */

    const handleRestoreSingle =
        async (
            messageId
        ) => {

            if (!messageId) {
                return;
            }


            try {

                setActionLoading(
                    true
                );


                await restoreMessageApi(
                    messageId
                );


                setSelectedMessages(
                    (previous) =>
                        previous.filter(
                            (id) =>
                                id !==
                                messageId
                        )
                );


                if (
                    selectedMessage &&
                    getMessageId(
                        selectedMessage
                    ) ===
                    messageId
                ) {

                    setSelectedMessage(
                        null
                    );

                }


                await loadMessages({

                    showLoading:
                        false,

                    requestedPage:
                        page,

                });


                await loadFolderCounts();


            } catch (
                restoreError
            ) {

                console.error(
                    "Restore error:",
                    restoreError
                );


                alert(

                    restoreError?.response
                        ?.data
                        ?.message ||

                    restoreError?.message ||

                    "Unable to restore message."

                );


            } finally {

                setActionLoading(
                    false
                );

            }

        };


    /* =====================================================
       BULK RESTORE
    ===================================================== */

    const handleBulkRestore =
        async () => {

            if (
                selectedMessages.length ===
                0
            ) {

                return;

            }


            const confirmed =
                window.confirm(
                    `Restore ${selectedMessages.length} selected message(s)?`
                );


            if (!confirmed) {
                return;
            }


            try {

                setActionLoading(
                    true
                );


                await Promise.all(

                    selectedMessages.map(
                        (messageId) =>
                            restoreMessageApi(
                                messageId
                            )
                    )

                );


                setSelectedMessages(
                    []
                );


                setSelectedMessage(
                    null
                );


                await loadMessages({

                    showLoading:
                        false,

                    requestedPage:
                        page,

                });


                await loadFolderCounts();


            } catch (
                restoreError
            ) {

                console.error(
                    "Bulk restore error:",
                    restoreError
                );


                alert(

                    restoreError?.response
                        ?.data
                        ?.message ||

                    restoreError?.message ||

                    "Unable to restore selected messages."

                );


            } finally {

                setActionLoading(
                    false
                );

            }

        };


    /* =====================================================
       SEND DRAFT
    ===================================================== */

    const handleSendDraft =
        async (
            draftId
        ) => {

            const confirmed =
                window.confirm(
                    "Send this draft?"
                );


            if (!confirmed) {
                return;
            }


            try {

                setActionLoading(
                    true
                );


                await sendDraftApi(
                    draftId
                );


                if (
                    selectedMessage &&
                    getMessageId(
                        selectedMessage
                    ) ===
                    draftId
                ) {

                    setSelectedMessage(
                        null
                    );

                }


                await loadMessages({

                    showLoading:
                        false,

                    requestedPage:
                        page,

                });


                await loadFolderCounts();


            } catch (
                sendError
            ) {

                console.error(
                    "Send draft error:",
                    sendError
                );


                alert(

                    sendError?.response
                        ?.data
                        ?.message ||

                    sendError?.message ||

                    "Unable to send draft."

                );


            } finally {

                setActionLoading(
                    false
                );

            }

        };


    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh =
        async () => {

            await loadMessages({

                showLoading:
                    false,

                requestedPage:
                    page,

            });


            await loadFolderCounts();

        };


    /* =====================================================
       PAGINATION
    ===================================================== */

    const handlePreviousPage =
        () => {

            if (
                page <= 1
            ) {

                return;

            }


            setSelectedMessages(
                []
            );


            setSelectedMessage(
                null
            );


            setPage(
                (previous) =>
                    Math.max(
                        1,
                        previous - 1
                    )
            );

        };


    const handleNextPage =
        () => {

            if (
                pagination.totalPages &&
                page >=
                pagination.totalPages
            ) {

                return;

            }


            setSelectedMessages(
                []
            );


            setSelectedMessage(
                null
            );


            setPage(
                (previous) =>
                    previous + 1
            );

        };


    /* =====================================================
       MESSAGE UPDATED
    ===================================================== */

    const handleMessageUpdated =
        async () => {

            await loadMessages({

                showLoading:
                    false,

                requestedPage:
                    page,

            });


            await loadFolderCounts();

        };


    /* =====================================================
       MESSAGE DELETED FROM VIEWER
    ===================================================== */

    const handleMessageDeleted =
        async (
            messageId
        ) => {

            if (
                selectedMessage &&
                getMessageId(
                    selectedMessage
                ) ===
                messageId
            ) {

                setSelectedMessage(
                    null
                );

            }


            setSelectedMessages(
                (previous) =>
                    previous.filter(
                        (id) =>
                            id !==
                            messageId
                    )
            );


            await loadMessages({

                showLoading:
                    false,

                requestedPage:
                    page,

            });


            await loadFolderCounts();

        };


    /* =====================================================
       CURRENT COUNT
    ===================================================== */

    const currentFolderCount =
        Number(
            folderCounts?.[
                folder
            ]
        ) || 0;


    /* =====================================================
       LOADING
    ===================================================== */

    if (
        loading &&
        messages.length ===
        0
    ) {

        return (

            <div
                className="
                    flex
                    h-full
                    min-h-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        items-center
                        gap-3
                    "
                >

                    <Loader2
                        size={30}
                        className="
                            animate-spin
                            text-indigo-600
                        "
                    />

                    <span
                        className="
                            text-sm
                            text-gray-500
                        "
                    >
                        Loading{" "}
                        {config.label}
                        ...
                    </span>

                </div>

            </div>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (
        error &&
        messages.length ===
        0
    ) {

        return (

            <div
                className="
                    flex
                    h-full
                    min-h-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white
                    p-6
                "
            >

                <div
                    className="
                        max-w-md
                        text-center
                    "
                >

                    <div
                        className="
                            mx-auto
                            mb-4
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-red-50
                            text-red-600
                        "
                    >

                        <AlertCircle
                            size={24}
                        />

                    </div>


                    <h2
                        className="
                            text-lg
                            font-semibold
                            text-gray-800
                        "
                    >
                        Unable to load{" "}
                        {config.label}
                    </h2>


                    <p
                        className="
                            mt-2
                            text-sm
                            text-gray-500
                        "
                    >
                        {error}
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            loadMessages({

                                showLoading:
                                    true,

                                requestedPage:
                                    page,

                            })
                        }
                        className="
                            mt-5
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-indigo-600
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            hover:bg-indigo-700
                        "
                    >

                        <RefreshCw
                            size={16}
                        />

                        Try Again

                    </button>

                </div>

            </div>

        );

    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div
            className="
                flex
                h-full
                min-h-0
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow-sm
            "
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="
                    shrink-0
                    border-b
                    border-gray-200
                    bg-white
                    px-4
                    py-3
                "
            >

                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                    "
                >

                    <div
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-indigo-50
                                text-indigo-600
                            "
                        >

                            <FolderIcon
                                size={20}
                            />

                        </div>


                        <div
                            className="
                                min-w-0
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <h1
                                    className="
                                        truncate
                                        text-lg
                                        font-bold
                                        text-gray-900
                                    "
                                >
                                    {
                                        config.label
                                    }
                                </h1>


                                <span
                                    className="
                                        inline-flex
                                        h-6
                                        min-w-[24px]
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-indigo-100
                                        px-2
                                        text-[10px]
                                        font-bold
                                        text-indigo-700
                                    "
                                >
                                    {
                                        currentFolderCount >
                                        99
                                            ? "99+"
                                            : currentFolderCount
                                    }
                                </span>

                            </div>


                            <p
                                className="
                                    hidden
                                    text-xs
                                    text-gray-500
                                    sm:block
                                "
                            >
                                {
                                    config.description
                                }
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            refreshing
                        }
                        title="Refresh"
                        className="
                            rounded-lg
                            p-2
                            text-gray-500
                            hover:bg-gray-100
                            hover:text-indigo-600
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        <RefreshCw
                            size={18}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                    </button>

                </div>

            </div>


            {/* =================================================
                SEARCH

                No folder navigation row.
            ================================================= */}

            <div
                className="
                    shrink-0
                    border-b
                    border-gray-100
                    bg-white
                    px-4
                    py-3
                "
            >

                <div
                    className="
                        relative
                    "
                >

                    <Search
                        size={17}
                        className="
                            pointer-events-none
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2
                            text-gray-400
                        "
                    />


                    <input
                        type="text"
                        value={
                            search
                        }
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder={
                            folder === "inbox"
                                ? "Search all mail..."
                                : `Search ${config.label.toLowerCase()}...`
                        }
                        className="
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            bg-gray-50
                            py-2.5
                            pl-10
                            pr-10
                            text-sm
                            text-gray-800
                            outline-none
                            transition
                            focus:border-indigo-400
                            focus:bg-white
                            focus:ring-2
                            focus:ring-indigo-100
                        "
                    />


                    {search && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearch(
                                    ""
                                )
                            }
                            className="
                                absolute
                                right-2
                                top-1/2
                                -translate-y-1/2
                                rounded-lg
                                p-1.5
                                text-gray-400
                                hover:bg-gray-200
                                hover:text-gray-700
                            "
                        >

                            <X
                                size={15}
                            />

                        </button>

                    )}

                </div>

            </div>


            {/* =================================================
                SELECTION TOOLBAR
            ================================================= */}

            <div
                className="
                    flex
                    shrink-0
                    flex-nowrap
                    items-center
                    justify-between
                    gap-2
                    border-b
                    border-gray-200
                    bg-gray-50
                    px-3
                    py-2
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <button
                        type="button"
                        onClick={
                            handleSelectAll
                        }
                        disabled={
                            filteredMessages.length ===
                            0
                        }
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-lg
                            px-2.5
                            py-2
                            text-xs
                            font-medium
                            text-gray-600
                            hover:bg-gray-200
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >

                        <span
                            className="
                                flex
                                h-4
                                w-4
                                items-center
                                justify-center
                                rounded
                                border
                                border-gray-300
                                bg-white
                            "
                        >

                            {allVisibleSelected && (

                                <Check
                                    size={12}
                                    className="
                                        text-indigo-600
                                    "
                                />

                            )}

                        </span>


                        <span
                            className="
                                hidden
                                sm:inline
                            "
                        >

                            {
                                allVisibleSelected
                                    ? "Unselect All"
                                    : "Select All"
                            }

                        </span>

                    </button>


                    {selectedMessages.length >
                        0 && (

                        <span
                            className="
                                rounded-full
                                bg-indigo-100
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                text-indigo-700
                            "
                        >

                            {
                                selectedMessages.length
                            }{" "}
                            selected

                        </span>

                    )}

                </div>


                {selectedMessages.length >
                    0 && (

                    <div
                        className="
                            flex
                            items-center
                            gap-1
                        "
                    >

                        {/* RESTORE FROM TRASH */}

                        {folder ===
                            "trash" && (

                            <button
                                type="button"
                                onClick={
                                    handleBulkRestore
                                }
                                disabled={
                                    actionLoading
                                }
                                title="Restore selected messages"
                                className="
                                    flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    px-2.5
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-indigo-600
                                    hover:bg-indigo-50
                                    disabled:opacity-50
                                "
                            >

                                {actionLoading ? (

                                    <Loader2
                                        size={15}
                                        className="
                                            animate-spin
                                        "
                                    />

                                ) : (

                                    <RotateCcw
                                        size={15}
                                    />

                                )}

                                <span
                                    className="
                                        hidden
                                        sm:inline
                                    "
                                >
                                    Restore
                                </span>

                            </button>

                        )}


                        {/* DELETE */}

                        <button
                            type="button"
                            onClick={
                                handleBulkDelete
                            }
                            disabled={
                                actionLoading
                            }
                            title={
                                folder === "trash"
                                    ? "Permanently delete selected messages"
                                    : "Move selected messages to Trash"
                            }
                            className="
                                flex
                                items-center
                                gap-1.5
                                rounded-lg
                                px-2.5
                                py-2
                                text-xs
                                font-semibold
                                text-red-600
                                hover:bg-red-50
                                disabled:opacity-50
                            "
                        >

                            {actionLoading ? (

                                <Loader2
                                    size={15}
                                    className="
                                        animate-spin
                                    "
                                />

                            ) : (

                                <Trash2
                                    size={15}
                                />

                            )}

                            <span
                                className="
                                    hidden
                                    sm:inline
                                "
                            >

                                {
                                    folder ===
                                    "trash"
                                        ? "Delete Permanently"
                                        : "Trash"
                                }

                            </span>

                        </button>


                        <button
                            type="button"
                            onClick={
                                clearSelection
                            }
                            title="Clear selection"
                            className="
                                rounded-lg
                                p-2
                                text-gray-500
                                hover:bg-gray-200
                            "
                        >

                            <X
                                size={16}
                            />

                        </button>

                    </div>

                )}

            </div>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div
                className="
                    flex
                    min-h-0
                    flex-1
                    overflow-hidden
                "
            >

                {/* =================================================
                    MESSAGE LIST
                ================================================= */}

                <div
                    className={`
                        flex
                        min-h-0
                        min-w-0
                        flex-1
                        flex-col
                        overflow-hidden

                        ${
                            selectedMessage
                                ? "hidden lg:flex lg:w-[45%] lg:max-w-[520px] lg:flex-none lg:border-r lg:border-gray-200"
                                : "w-full"
                        }
                    `}
                >

                    <div
                        className="
                            min-h-0
                            flex-1
                            overflow-y-auto
                            overflow-x-hidden
                        "
                    >

                        {filteredMessages.length ===
                            0 ? (

                            <div
                                className="
                                    flex
                                    min-h-[350px]
                                    items-center
                                    justify-center
                                    p-8
                                "
                            >

                                <div
                                    className="
                                        text-center
                                    "
                                >

                                    <div
                                        className="
                                            mx-auto
                                            mb-4
                                            flex
                                            h-14
                                            w-14
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-gray-100
                                            text-gray-400
                                        "
                                    >

                                        <FolderIcon
                                            size={25}
                                        />

                                    </div>


                                    <h3
                                        className="
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                    >

                                        {
                                            search
                                                ? "No messages found"
                                                : folder ===
                                                    "inbox"
                                                    ? "No messages"
                                                    : `No ${config.label.toLowerCase()} messages`
                                        }

                                    </h3>


                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-gray-400
                                        "
                                    >

                                        {
                                            search
                                                ? "Try a different search."
                                                : "You're all caught up."
                                        }

                                    </p>

                                </div>

                            </div>

                        ) : (

                            <div>

                                {filteredMessages.map(
                                    (
                                        message
                                    ) => {

                                        const messageId =
                                            getMessageId(
                                                message
                                            );


                                        const selected =
                                            selectedMessages.includes(
                                                messageId
                                            );


                                        /*
                                         * =================================================
                                         * IMPORTANT
                                         *
                                         * Badge is determined from THIS message.
                                         *
                                         * NOT:
                                         *
                                         * getFolderBadge(folder)
                                         *
                                         * Instead:
                                         *
                                         * getFolderBadge(message.mailFolder)
                                         * =================================================
                                         */

                                        const messageFolder =
                                            String(
                                                message?.mailFolder ||
                                                ""
                                            )
                                                .trim()
                                                .toLowerCase();


                                        const messageBadge =
                                            getFolderBadge(
                                                messageFolder
                                            );


                                        const isRead =
                                            message?.isRead ===
                                                true ||
                                            message?.read ===
                                                true;


                                        const senderName =
                                            getPersonName(
                                                message?.sender
                                            );


                                        const subject =
                                            getSubject(
                                                message
                                            );


                                        const preview =
                                            getBodyPreview(
                                                message
                                            );


                                        const sentDate =
                                            message?.sentAt ||
                                            message?.createdAt ||
                                            message?.updatedAt;


                                        return (

                                            <div
                                                key={
                                                    messageId
                                                }
                                                className={`
                                                    group
                                                    border-b
                                                    border-gray-100
                                                    transition

                                                    ${
                                                        selected
                                                            ? "bg-indigo-50"
                                                            : "bg-white hover:bg-gray-50"
                                                    }
                                                `}
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-stretch
                                                    "
                                                >

                                                    {/* =========================================
                                                        CHECKBOX
                                                    ========================================= */}

                                                    <div
                                                        className="
                                                            flex
                                                            w-10
                                                            shrink-0
                                                            items-start
                                                            justify-center
                                                            pt-5
                                                        "
                                                    >

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectMessage(
                                                                    messageId
                                                                )
                                                            }
                                                            className="
                                                                flex
                                                                h-4
                                                                w-4
                                                                items-center
                                                                justify-center
                                                                rounded
                                                                border
                                                                border-gray-300
                                                                bg-white
                                                                hover:border-indigo-500
                                                            "
                                                            aria-label={
                                                                selected
                                                                    ? "Unselect message"
                                                                    : "Select message"
                                                            }
                                                        >

                                                            {selected && (

                                                                <Check
                                                                    size={12}
                                                                    className="
                                                                        text-indigo-600
                                                                    "
                                                                />

                                                            )}

                                                        </button>

                                                    </div>


                                                    {/* =========================================
                                                        MESSAGE
                                                    ========================================= */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleOpenMessage(
                                                                message
                                                            )
                                                        }
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                            text-left
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                min-w-0
                                                                gap-3
                                                                py-3.5
                                                                pr-2
                                                            "
                                                        >

                                                            {/* AVATAR */}

                                                            <div
                                                                className={`
                                                                    flex
                                                                    h-9
                                                                    w-9
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-full
                                                                    text-xs
                                                                    font-bold

                                                                    ${
                                                                        isRead
                                                                            ? "bg-gray-100 text-gray-500"
                                                                            : "bg-indigo-100 text-indigo-700"
                                                                    }
                                                                `}
                                                            >

                                                                {getInitial(
                                                                    message?.sender
                                                                )}

                                                            </div>


                                                            {/* CONTENT */}

                                                            <div
                                                                className="
                                                                    min-w-0
                                                                    flex-1
                                                                "
                                                            >

                                                                {/* TOP LINE */}

                                                                <div
                                                                    className="
                                                                        flex
                                                                        min-w-0
                                                                        items-center
                                                                        justify-between
                                                                        gap-2
                                                                    "
                                                                >

                                                                    <div
                                                                        className="
                                                                            flex
                                                                            min-w-0
                                                                            items-center
                                                                            gap-2
                                                                        "
                                                                    >

                                                                        <span
                                                                            className={`
                                                                                truncate
                                                                                text-sm

                                                                                ${
                                                                                    isRead
                                                                                        ? "font-medium text-gray-700"
                                                                                        : "font-bold text-gray-900"
                                                                                }
                                                                            `}
                                                                        >
                                                                            {
                                                                                senderName
                                                                            }
                                                                        </span>


                                                                        {/* =================================
                                                                            PER-MESSAGE FOLDER BADGE
                                                                        ================================= */}

                                                                        <span
                                                                            className={`
                                                                                inline-flex
                                                                                shrink-0
                                                                                items-center
                                                                                gap-1
                                                                                rounded-full
                                                                                border
                                                                                px-2
                                                                                py-0.5
                                                                                text-[10px]
                                                                                font-semibold
                                                                                ${messageBadge.className}
                                                                            `}
                                                                        >

                                                                            {
                                                                                messageBadge.icon
                                                                            }

                                                                            {
                                                                                messageBadge.label
                                                                            }

                                                                        </span>

                                                                    </div>


                                                                    <span
                                                                        className="
                                                                            shrink-0
                                                                            text-[10px]
                                                                            text-gray-400
                                                                        "
                                                                    >
                                                                        {
                                                                            formatShortDate(
                                                                                sentDate
                                                                            )
                                                                        }
                                                                    </span>

                                                                </div>


                                                                {/* SUBJECT */}

                                                                <div
                                                                    className={`
                                                                        mt-1
                                                                        truncate
                                                                        text-sm

                                                                        ${
                                                                            isRead
                                                                                ? "font-medium text-gray-700"
                                                                                : "font-bold text-gray-900"
                                                                        }
                                                                    `}
                                                                >
                                                                    {
                                                                        subject
                                                                    }
                                                                </div>


                                                                {/* PREVIEW */}

                                                                {preview && (

                                                                    <div
                                                                        className="
                                                                            mt-1
                                                                            truncate
                                                                            text-xs
                                                                            text-gray-400
                                                                        "
                                                                    >
                                                                        {
                                                                            preview
                                                                        }
                                                                    </div>

                                                                )}


                                                                {/* META */}

                                                                <div
                                                                    className="
                                                                        mt-2
                                                                        flex
                                                                        items-center
                                                                        gap-2
                                                                    "
                                                                >

                                                                    {message?.attachments?.length >
                                                                        0 && (

                                                                        <span
                                                                            className="
                                                                                inline-flex
                                                                                items-center
                                                                                gap-1
                                                                                text-[10px]
                                                                                text-gray-400
                                                                            "
                                                                        >

                                                                            <Paperclip
                                                                                size={
                                                                                    12
                                                                                }
                                                                            />

                                                                            {
                                                                                message.attachments.length
                                                                            }

                                                                        </span>

                                                                    )}


                                                                    {messageFolder ===
                                                                        "drafts" && (

                                                                        <span
                                                                            className="
                                                                                text-[10px]
                                                                                font-medium
                                                                                text-amber-600
                                                                            "
                                                                        >
                                                                            Draft message
                                                                        </span>

                                                                    )}

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </button>


                                                    {/* =========================================
                                                        ACTIONS
                                                    ========================================= */}

                                                    <div
                                                        className="
                                                            flex
                                                            shrink-0
                                                            items-center
                                                            pr-2
                                                        "
                                                    >

                                                        {/* RESTORE */}

                                                        {messageFolder ===
                                                            "trash" && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRestoreSingle(
                                                                        messageId
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                                title="Restore"
                                                                className="
                                                                    rounded-lg
                                                                    p-1.5
                                                                    text-gray-400
                                                                    hover:bg-indigo-50
                                                                    hover:text-indigo-600
                                                                    disabled:opacity-50
                                                                "
                                                            >

                                                                <RotateCcw
                                                                    size={
                                                                        15
                                                                    }
                                                                />

                                                            </button>

                                                        )}


                                                        {/* SEND DRAFT */}

                                                        {messageFolder ===
                                                            "drafts" && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleSendDraft(
                                                                        messageId
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                                title="Send draft"
                                                                className="
                                                                    rounded-lg
                                                                    p-1.5
                                                                    text-gray-400
                                                                    hover:bg-green-50
                                                                    hover:text-green-600
                                                                    disabled:opacity-50
                                                                "
                                                            >

                                                                <Send
                                                                    size={
                                                                        15
                                                                    }
                                                                />

                                                            </button>

                                                        )}


                                                        {/* DELETE */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteSingle(
                                                                    messageId
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                            title={
                                                                messageFolder ===
                                                                "trash"
                                                                    ? "Delete permanently"
                                                                    : "Move to trash"
                                                            }
                                                            className="
                                                                rounded-lg
                                                                p-1.5
                                                                text-gray-400
                                                                hover:bg-red-50
                                                                hover:text-red-600
                                                                disabled:opacity-50
                                                            "
                                                        >

                                                            <Trash2
                                                                size={
                                                                    15
                                                                }
                                                            />

                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    <div
                        className="
                            flex
                            shrink-0
                            items-center
                            justify-between
                            border-t
                            border-gray-200
                            bg-white
                            px-3
                            py-2
                        "
                    >

                        <span
                            className="
                                text-xs
                                text-gray-500
                            "
                        >

                            {pagination.total >
                            0

                                ? `Page ${page} of ${pagination.totalPages}`

                                : `${filteredMessages.length} messages`

                            }

                        </span>


                        {(
                            folder ===
                                "inbox" ||
                            folder ===
                                "sent"
                        ) && (

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-1
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        handlePreviousPage
                                    }
                                    disabled={
                                        page <=
                                        1
                                    }
                                    className="
                                        rounded-lg
                                        p-1.5
                                        text-gray-500
                                        hover:bg-gray-100
                                        disabled:cursor-not-allowed
                                        disabled:opacity-30
                                    "
                                >

                                    <ChevronLeft
                                        size={17}
                                    />

                                </button>


                                <span
                                    className="
                                        min-w-[50px]
                                        text-center
                                        text-xs
                                        font-medium
                                        text-gray-600
                                    "
                                >
                                    {page}
                                </span>


                                <button
                                    type="button"
                                    onClick={
                                        handleNextPage
                                    }
                                    disabled={
                                        pagination.totalPages
                                            ? page >=
                                                pagination.totalPages
                                            : !pagination.hasNext
                                    }
                                    className="
                                        rounded-lg
                                        p-1.5
                                        text-gray-500
                                        hover:bg-gray-100
                                        disabled:cursor-not-allowed
                                        disabled:opacity-30
                                    "
                                >

                                    <ChevronRight
                                        size={17}
                                    />

                                </button>

                            </div>

                        )}

                    </div>

                </div>


                {/* =================================================
                    MESSAGE VIEWER
                ================================================= */}

                {selectedMessage && (

                    <div
                        className="
                            flex
                            min-h-0
                            min-w-0
                            flex-1
                            overflow-hidden
                        "
                    >

                        <MessageViewer
                            message={
                                selectedMessage
                            }

                            onClose={() =>
                                setSelectedMessage(
                                    null
                                )
                            }

                            onMessageDeleted={
                                handleMessageDeleted
                            }

                            onMessageUpdated={
                                handleMessageUpdated
                            }

                            showCloseButton={
                                true
                            }

                        />

                    </div>

                )}

            </div>

        </div>

    );

};


/* =========================================================
   INBOX

   This screen displays:

   [Inbox]
   [Sent]
   [Draft]
   [Trash]

   based on message.mailFolder.
========================================================= */

export const Inbox = () => {

    return (

        <MailFolder
            folder="inbox"
        />

    );

};


/* =========================================================
   SENT
========================================================= */

export const Sent = () => {

    return (

        <MailFolder
            folder="sent"
        />

    );

};


/* =========================================================
   DRAFTS
========================================================= */

export const Drafts = () => {

    return (

        <MailFolder
            folder="drafts"
        />

    );

};


/* =========================================================
   TRASH
========================================================= */

export const Trash = () => {

    return (

        <MailFolder
            folder="trash"
        />

    );

};

export default MailFolder;