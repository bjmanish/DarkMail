import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Archive,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    Inbox as InboxIcon,
    Mail,
    MailOpen,
    MoreHorizontal,
    RefreshCw,
    RotateCcw,
    Search,
    Send,
    Trash2,
    X,
    Loader2,
    AlertCircle,
    Paperclip,
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
            "Messages received in your inbox.",
    },

    sent: {
        label: "Sent",
        icon: Send,
        description:
            "Messages you have sent.",
    },

    drafts: {
        label: "Drafts",
        icon: FileText,
        description:
            "Messages saved as drafts.",
    },

    trash: {
        label: "Trash",
        icon: Trash2,
        description:
            "Deleted messages.",
    },

};


/* =========================================================
   HELPERS
========================================================= */

const getMessageId = (message) => {

    return (
        message?._id ||
        message?.id ||
        message?.messageId
    );

};


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


const getInitial = (person) => {

    return (
        getPersonName(person)
            ?.charAt(0)
            ?.toUpperCase() ||
        "U"
    );

};


const getSubject = (message) => {

    return (
        message?.subject ||
        "(No Subject)"
    );

};


const getBodyPreview = (message) => {

    const body =
        message?.body ||
        message?.text ||
        "";


    return body
        .replace(/\s+/g, " ")
        .trim();

};


const formatDate = (date) => {

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
   NORMALIZE PAGINATION
========================================================= */

const normalizePagination = (
    response
) => {

    const pagination =
        response?.pagination ||
        response?.data?.pagination ||
        {};


    return {

        page:
            pagination.page ||
            1,

        limit:
            pagination.limit ||
            LIMIT,

        total:
            pagination.total ||
            0,

        totalPages:
            pagination.totalPages ||
            pagination.pages ||
            1,

        hasNext:
            pagination.hasNext ??
            false,

        hasPrevious:
            pagination.hasPrevious ??
            pagination.hasPrev ??
            false,

    };

};


/* =========================================================
   MAIN MAIL FOLDER COMPONENT
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
        setMessages
    ] = useState([]);


    const [
        selectedMessages,
        setSelectedMessages
    ] = useState([]);


    const [
        selectedMessage,
        setSelectedMessage
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        refreshing,
        setRefreshing
    ] = useState(false);


    const [
        actionLoading,
        setActionLoading
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        search,
        setSearch
    ] = useState("");


    const [
        page,
        setPage
    ] = useState(1);


    const [
        pagination,
        setPagination
    ] = useState({
        page: 1,
        limit: LIMIT,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
    });


    /* =====================================================
       LOAD MESSAGES
    ===================================================== */

    const loadMessages = useCallback(
        async ({
            showLoading = true,
            requestedPage = page,
        } = {}) => {

            try {

                if (showLoading) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }


                setError("");


                let response;


                /* -----------------------------------------
                   INBOX / SENT
                ----------------------------------------- */

                if (
                    folder === "inbox" ||
                    folder === "sent"
                ) {

                    response =
                        await getMessagesApi({
                            folder,
                            page:
                                requestedPage,
                            limit: LIMIT,
                        });

                }


                /* -----------------------------------------
                   DRAFTS
                ----------------------------------------- */

                else if (
                    folder === "drafts"
                ) {

                    response =
                        await getDraftsApi();

                }


                /* -----------------------------------------
                   TRASH
                ----------------------------------------- */

                else if (
                    folder === "trash"
                ) {

                    response =
                        await getTrashApi();

                }


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


                /*
                 * Clear selection after reload.
                 */

                setSelectedMessages(
                    []
                );


            } catch (err) {

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

                setLoading(false);

                setRefreshing(false);

            }

        },
        [
            folder,
            page,
        ]
    );


    /* =====================================================
       INITIAL / FOLDER CHANGE
    ===================================================== */

    useEffect(() => {

        setPage(1);

        setMessages([]);

        setSelectedMessages([]);

        setSelectedMessage(null);

    }, [folder]);


    useEffect(() => {

        loadMessages({
            showLoading: true,
            requestedPage: page,
        });

    }, [
        folder,
        page,
    ]);


    /* =====================================================
       SEARCH
    ===================================================== */

    const filteredMessages =
        useMemo(() => {

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
                        ).toLowerCase();


                    const body =
                        getBodyPreview(
                            message
                        ).toLowerCase();


                    const sender =
                        getPersonName(
                            message.sender
                        ).toLowerCase();


                    const email =
                        getPersonEmail(
                            message.sender
                        ).toLowerCase();


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
                        )
                    );

                }
            );

        }, [
            messages,
            search,
        ]);


    /* =====================================================
       SELECT MESSAGE
    ===================================================== */

    const handleSelectMessage = (
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
                            id !== messageId
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
        filteredMessages.length > 0 &&
        filteredMessages.every(
            (message) =>
                selectedMessages.includes(
                    getMessageId(message)
                )
        );


    const handleSelectAll = () => {

        if (allVisibleSelected) {

            setSelectedMessages(
                (previous) =>
                    previous.filter(
                        (id) =>
                            !filteredMessages.some(
                                (message) =>
                                    getMessageId(
                                        message
                                    ) === id
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

    const clearSelection = () => {

        setSelectedMessages(
            []
        );

    };


    /* =====================================================
       OPEN MESSAGE
    ===================================================== */

    const handleOpenMessage = async (
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
         * Drafts should not be marked read.
         */

        if (
            folder === "drafts" ||
            folder === "trash"
        ) {

            return;

        }


        /*
         * Mark unread message as read.
         */

        if (
            message?.isRead === false ||
            message?.read === false
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
                                    isRead: true,
                                    read: true,
                                };

                            }
                        )
                );

            } catch (error) {

                console.warn(
                    "Mark read failed:",
                    error
                );

            }

        }

    };


    /* =====================================================
       DELETE SINGLE MESSAGE
    ===================================================== */

    const handleDeleteSingle = async (
        messageId
    ) => {

        if (
            !messageId
        ) {

            return;

        }


        try {

            setActionLoading(
                true
            );


            if (
                folder === "drafts"
            ) {

                await deleteDraftApi(
                    messageId
                );

            } else if (
                folder === "trash"
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
                ) === messageId
            ) {

                setSelectedMessage(
                    null
                );

            }


            setSelectedMessages(
                (previous) =>
                    previous.filter(
                        (id) =>
                            id !== messageId
                    )
            );


            await loadMessages({
                showLoading: false,
                requestedPage: page,
            });


        } catch (error) {

            console.error(
                "Delete error:",
                error
            );


            alert(
                error?.response
                    ?.data
                    ?.message ||
                error?.message ||
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


            let confirmationText;


            if (
                folder === "trash"
            ) {

                confirmationText =
                    `Permanently delete ${selectedMessages.length} selected message(s)? This cannot be undone.`;

            } else if (
                folder === "drafts"
            ) {

                confirmationText =
                    `Delete ${selectedMessages.length} selected draft(s)?`;

            } else {

                confirmationText =
                    `Move ${selectedMessages.length} selected message(s) to Trash?`;

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


                /*
                 * We use your existing single-message
                 * API endpoints in parallel.
                 *
                 * This means you don't need to add a
                 * new bulk endpoint to the backend.
                 */

                if (
                    folder === "drafts"
                ) {

                    await Promise.all(
                        selectedMessages.map(
                            (messageId) =>
                                deleteDraftApi(
                                    messageId
                                )
                        )
                    );

                } else if (
                    folder === "trash"
                ) {

                    await Promise.all(
                        selectedMessages.map(
                            (messageId) =>
                                permanentlyDeleteMessageApi(
                                    messageId
                                )
                        )
                    );

                } else {

                    await Promise.all(
                        selectedMessages.map(
                            (messageId) =>
                                moveMessageToTrashApi(
                                    messageId
                                )
                        )
                    );

                }


                setSelectedMessage(
                    null
                );


                setSelectedMessages(
                    []
                );


                await loadMessages({
                    showLoading: false,
                    requestedPage: page,
                });


            } catch (error) {

                console.error(
                    "Bulk delete error:",
                    error
                );


                alert(
                    error?.response
                        ?.data
                        ?.message ||
                    error?.message ||
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
                                id !== messageId
                        )
                );


                if (
                    selectedMessage &&
                    getMessageId(
                        selectedMessage
                    ) === messageId
                ) {

                    setSelectedMessage(
                        null
                    );

                }


                await loadMessages({
                    showLoading: false,
                    requestedPage: page,
                });


            } catch (error) {

                console.error(
                    "Restore error:",
                    error
                );


                alert(
                    error?.response
                        ?.data
                        ?.message ||
                    error?.message ||
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
                    showLoading: false,
                    requestedPage: page,
                });


            } catch (error) {

                console.error(
                    "Bulk restore error:",
                    error
                );


                alert(
                    error?.response
                        ?.data
                        ?.message ||
                    error?.message ||
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
                    ) === draftId
                ) {

                    setSelectedMessage(
                        null
                    );

                }


                await loadMessages({
                    showLoading: false,
                    requestedPage: page,
                });


            } catch (error) {

                console.error(
                    "Send draft error:",
                    error
                );


                alert(
                    error?.response
                        ?.data
                        ?.message ||
                    error?.message ||
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

    const handleRefresh = () => {

        loadMessages({
            showLoading: false,
            requestedPage: page,
        });

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


            if (
                pagination.hasNext ===
                    false &&
                pagination.totalPages <=
                    page
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
                showLoading: false,
                requestedPage: page,
            });

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
                ) === messageId
            ) {

                setSelectedMessage(
                    null
                );

            }


            setSelectedMessages(
                (previous) =>
                    previous.filter(
                        (id) =>
                            id !== messageId
                    )
            );


            await loadMessages({
                showLoading: false,
                requestedPage: page,
            });

        };


    /* =====================================================
       LOADING
    ===================================================== */

    if (
        loading &&
        messages.length === 0
    ) {

        return (

            <div className="
                flex
                h-full
                min-h-0
                items-center
                justify-center
                rounded-2xl
                bg-white
            ">

                <div className="
                    flex
                    flex-col
                    items-center
                    gap-3
                ">

                    <Loader2
                        size={30}
                        className="
                            animate-spin
                            text-indigo-600
                        "
                    />

                    <span className="
                        text-sm
                        text-gray-500
                    ">
                        Loading {config.label}...
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
        messages.length === 0
    ) {

        return (

            <div className="
                flex
                h-full
                min-h-0
                items-center
                justify-center
                rounded-2xl
                bg-white
                p-6
            ">

                <div className="
                    max-w-md
                    text-center
                ">

                    <div className="
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
                    ">

                        <AlertCircle
                            size={24}
                        />

                    </div>


                    <h2 className="
                        text-lg
                        font-semibold
                        text-gray-800
                    ">
                        Unable to load {config.label}
                    </h2>


                    <p className="
                        mt-2
                        text-sm
                        text-gray-500
                    ">
                        {error}
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            loadMessages({
                                showLoading: true,
                                requestedPage: page,
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

        <div className="
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
        ">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
                shrink-0
                border-b
                border-gray-200
                bg-white
                px-4
                py-3
            ">

                <div className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-3
                ">

                    {/* LEFT */}

                    <div className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                    ">

                        <div className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-indigo-50
                            text-indigo-600
                        ">

                            <FolderIcon
                                size={20}
                            />

                        </div>


                        <div className="
                            min-w-0
                        ">

                            <h1 className="
                                truncate
                                text-lg
                                font-bold
                                text-gray-900
                            ">

                                {config.label}

                            </h1>


                            <p className="
                                hidden
                                text-xs
                                text-gray-500
                                sm:block
                            ">

                                {config.description}

                            </p>

                        </div>

                    </div>


                    {/* RIGHT */}

                    <div className="
                        flex
                        items-center
                        gap-1
                    ">

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

            </div>


            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="
                shrink-0
                border-b
                border-gray-100
                bg-white
                px-4
                py-3
            ">

                <div className="
                    relative
                ">

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
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder={`Search ${config.label.toLowerCase()}...`}
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
                                setSearch("")
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

            <div className="
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
            ">

                <div className="
                    flex
                    items-center
                    gap-2
                ">

                    {/* SELECT ALL */}

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

                        <span className="
                            flex
                            h-4
                            w-4
                            items-center
                            justify-center
                            rounded
                            border
                            border-gray-300
                            bg-white
                        ">

                            {allVisibleSelected && (

                                <Check
                                    size={12}
                                    className="
                                        text-indigo-600
                                    "
                                />

                            )}

                        </span>


                        <span className="
                            hidden
                            sm:inline
                        ">

                            {allVisibleSelected
                                ? "Unselect All"
                                : "Select All"}

                        </span>

                    </button>


                    {selectedMessages.length >
                        0 && (

                        <span className="
                            rounded-full
                            bg-indigo-100
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            text-indigo-700
                        ">

                            {
                                selectedMessages.length
                            }{" "}
                            selected

                        </span>

                    )}

                </div>


                {/* BULK ACTIONS */}

                {selectedMessages.length >
                    0 && (

                    <div className="
                        flex
                        items-center
                        gap-1
                    ">

                        {/* TRASH / DELETE */}

                        {folder !== "trash" && (

                            <button
                                type="button"
                                onClick={
                                    handleBulkDelete
                                }
                                disabled={
                                    actionLoading
                                }
                                title={
                                    folder ===
                                    "drafts"
                                        ? "Delete selected drafts"
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

                                <span className="
                                    hidden
                                    sm:inline
                                ">

                                    {folder ===
                                    "drafts"
                                        ? "Delete"
                                        : "Trash"}

                                </span>

                            </button>

                        )}


                        {/* RESTORE */}

                        {folder === "trash" && (

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

                                <span className="
                                    hidden
                                    sm:inline
                                ">
                                    Restore
                                </span>

                            </button>

                        )}


                        {/* PERMANENT DELETE */}

                        {folder === "trash" && (

                            <button
                                type="button"
                                onClick={
                                    handleBulkDelete
                                }
                                disabled={
                                    actionLoading
                                }
                                title="Permanently delete selected messages"
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

                                <Trash2
                                    size={15}
                                />

                                <span className="
                                    hidden
                                    sm:inline
                                ">
                                    Delete Permanently
                                </span>

                            </button>

                        )}


                        {/* CLEAR */}

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

            <div className="
                flex
                min-h-0
                flex-1
                overflow-hidden
            ">

                {/* =================================================
                    MESSAGE LIST
                ================================================= */}

                <div className={`
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
                `}>

                    {/* LIST */}

                    <div className="
                        min-h-0
                        flex-1
                        overflow-y-auto
                        overflow-x-hidden
                    ">

                        {filteredMessages.length ===
                        0 ? (

                            <div className="
                                flex
                                min-h-[350px]
                                items-center
                                justify-center
                                p-8
                            ">

                                <div className="
                                    text-center
                                ">

                                    <div className="
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
                                    ">

                                        <FolderIcon
                                            size={25}
                                        />

                                    </div>


                                    <h3 className="
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                    ">

                                        {search
                                            ? "No messages found"
                                            : `No ${config.label.toLowerCase()} messages`}

                                    </h3>


                                    <p className="
                                        mt-1
                                        text-xs
                                        text-gray-400
                                    ">

                                        {search
                                            ? "Try a different search."
                                            : "You're all caught up."}

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


                                        const opened =
                                            selectedMessage &&
                                            getMessageId(
                                                selectedMessage
                                            ) ===
                                                messageId;


                                        const sender =
                                            folder ===
                                            "sent"
                                                ? message.to?.[0] ||
                                                  message.to
                                                : message.sender;


                                        const senderName =
                                            folder ===
                                            "sent"
                                                ? getPersonEmail(
                                                      sender
                                                  ) ||
                                                  getPersonName(
                                                      sender
                                                  )
                                                : getPersonName(
                                                      sender
                                                  );


                                        const preview =
                                            getBodyPreview(
                                                message
                                            );


                                        const hasAttachment =
                                            Array.isArray(
                                                message.attachments
                                            ) &&
                                            message.attachments.length >
                                                0;


                                        return (

                                            <div
                                                key={
                                                    messageId
                                                }
                                                className={`
                                                    group
                                                    flex
                                                    items-start
                                                    gap-2
                                                    border-b
                                                    border-gray-100
                                                    px-3
                                                    py-3
                                                    transition
                                                    ${
                                                        opened
                                                            ? "bg-indigo-50"
                                                            : selected
                                                            ? "bg-gray-50"
                                                            : "bg-white hover:bg-gray-50"
                                                    }
                                                `}
                                            >

                                                {/* CHECKBOX */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectMessage(
                                                            messageId
                                                        )
                                                    }
                                                    className="
                                                        mt-1
                                                        flex
                                                        h-5
                                                        w-5
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded
                                                        border
                                                        border-gray-300
                                                        bg-white
                                                        hover:border-indigo-400
                                                    "
                                                >

                                                    {selected && (

                                                        <Check
                                                            size={13}
                                                            className="
                                                                text-indigo-600
                                                            "
                                                        />

                                                    )}

                                                </button>


                                                {/* AVATAR */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenMessage(
                                                            message
                                                        )
                                                    }
                                                    className="
                                                        mt-0.5
                                                        flex
                                                        h-9
                                                        w-9
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        bg-indigo-600
                                                        text-xs
                                                        font-semibold
                                                        text-white
                                                    "
                                                >

                                                    {getInitial(
                                                        sender
                                                    )}

                                                </button>


                                                {/* MESSAGE */}

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

                                                    <div className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-2
                                                    ">

                                                        <span className={`
                                                            min-w-0
                                                            truncate
                                                            text-sm
                                                            ${
                                                                message.isRead ===
                                                                    false ||
                                                                message.read ===
                                                                    false
                                                                    ? "font-bold text-gray-900"
                                                                    : "font-medium text-gray-700"
                                                            }
                                                        `}>

                                                            {
                                                                senderName
                                                            }

                                                        </span>


                                                        <span className="
                                                            shrink-0
                                                            text-[11px]
                                                            text-gray-400
                                                        ">

                                                            {formatShortDate(
                                                                message.sentAt ||
                                                                message.createdAt ||
                                                                message.updatedAt
                                                            )}

                                                        </span>

                                                    </div>


                                                    <div className="
                                                        mt-0.5
                                                        flex
                                                        items-center
                                                        gap-2
                                                    ">

                                                        <span className="
                                                            min-w-0
                                                            truncate
                                                            text-sm
                                                            font-medium
                                                            text-gray-800
                                                        ">

                                                            {
                                                                getSubject(
                                                                    message
                                                                )
                                                            }

                                                        </span>


                                                        {hasAttachment && (

                                                            <Paperclip
                                                                size={13}
                                                                className="
                                                                    shrink-0
                                                                    text-gray-400
                                                                "
                                                            />

                                                        )}

                                                    </div>


                                                    {preview && (

                                                        <p className="
                                                            mt-0.5
                                                            truncate
                                                            text-xs
                                                            text-gray-400
                                                        ">

                                                            {
                                                                preview
                                                            }

                                                        </p>

                                                    )}

                                                </button>


                                                {/* QUICK ACTION */}

                                                <div className="
                                                    hidden
                                                    items-center
                                                    gap-1
                                                    group-hover:flex
                                                ">

                                                    {folder ===
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
                                                            "
                                                        >

                                                            <RotateCcw
                                                                size={15}
                                                            />

                                                        </button>

                                                    )}


                                                    {folder !==
                                                        "trash" && (

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
                                                                folder ===
                                                                "drafts"
                                                                    ? "Delete draft"
                                                                    : "Move to trash"
                                                            }
                                                            className="
                                                                rounded-lg
                                                                p-1.5
                                                                text-gray-400
                                                                hover:bg-red-50
                                                                hover:text-red-600
                                                            "
                                                        >

                                                            <Trash2
                                                                size={15}
                                                            />

                                                        </button>

                                                    )}

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

                    <div className="
                        flex
                        shrink-0
                        items-center
                        justify-between
                        border-t
                        border-gray-200
                        bg-white
                        px-3
                        py-2
                    ">

                        <span className="
                            text-xs
                            text-gray-500
                        ">

                            {pagination.total > 0
                                ? `Page ${page}${pagination.totalPages ? ` of ${pagination.totalPages}` : ""}`
                                : `${filteredMessages.length} messages`}

                        </span>


                        {folder !== "drafts" &&
                            folder !==
                                "trash" && (

                            <div className="
                                flex
                                items-center
                                gap-1
                            ">

                                <button
                                    type="button"
                                    onClick={
                                        handlePreviousPage
                                    }
                                    disabled={
                                        page <= 1
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


                                <span className="
                                    min-w-[50px]
                                    text-center
                                    text-xs
                                    font-medium
                                    text-gray-600
                                ">

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

                    <div className="
                        flex
                        min-h-0
                        min-w-0
                        flex-1
                        overflow-hidden
                    ">

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


/* =========================================================
   DEFAULT
========================================================= */

export default MailFolder;