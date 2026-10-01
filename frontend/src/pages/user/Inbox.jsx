import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    getMessagesApi,
    getMessageByIdApi,
    markMessageAsReadApi,
    moveMessageToTrashApi,
} from "../../api/messageApi";

import MessageViewer from "../../components/mail/MessageViewer";

const Inbox = () => {

    /* =====================================================
       MAIL LIST
    ===================================================== */

    const [messages, setMessages] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 1,
    });

    /* =====================================================
       SELECTED MESSAGE
    ===================================================== */

    const [selectedMessage, setSelectedMessage] =
        useState(null);

    const [messageLoading, setMessageLoading] =
        useState(false);

    const [messageError, setMessageError] =
        useState("");

    /* =====================================================
       LOAD INBOX
    ===================================================== */

    const loadInbox = useCallback(
        async (
            currentPage = 1,
            showRefresh = false
        ) => {

            try {

                setError("");

                if (showRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                const response =
                    await getMessagesApi({
                        folder: "inbox",
                        page: currentPage,
                        limit: 20,
                    });

                console.log(
                    "Inbox response:",
                    response
                );

                if (!response?.success) {

                    throw new Error(
                        response?.message ||
                        "Unable to load inbox"
                    );

                }

                /*
                 * Backend supports both:
                 *
                 * response.data
                 * response.messages
                 */

                const inboxMessages =
                    response.messages ||
                    response.data ||
                    [];

                setMessages(
                    Array.isArray(inboxMessages)
                        ? inboxMessages
                        : []
                );

                /*
                 * Pagination
                 */

                if (response.pagination) {

                    setPagination(
                        response.pagination
                    );

                } else {

                    setPagination({
                        page: currentPage,
                        limit: 20,
                        total:
                            response.total ||
                            inboxMessages.length,
                        pages:
                            response.pages ||
                            1,
                    });

                }

                setPage(currentPage);

            } catch (error) {

                console.error(
                    "Inbox loading error:",
                    error
                );

                setError(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load inbox."
                );

            } finally {

                setLoading(false);

                setRefreshing(false);

            }

        },
        []
    );

    useEffect(() => {

        loadInbox(1);

    }, [loadInbox]);

    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = () => {

        loadInbox(
            page,
            true
        );

    };

    /* =====================================================
       IS READ
    ===================================================== */

    const isRead = (message) => {

        if (
            typeof message?.isRead ===
            "boolean"
        ) {

            return message.isRead;

        }

        return false;
    };

    /* =====================================================
       GET SENDER NAME
    ===================================================== */

    const getSenderName = (message) => {

        if (!message?.sender) {
            return "Unknown sender";
        }

        if (
            typeof message.sender ===
            "object"
        ) {

            return (
                message.sender.name ||
                message.sender.fullName ||
                message.sender.employeeName ||
                message.sender.email ||
                "Unknown sender"
            );

        }

        return String(
            message.sender
        );

    };

    /* =====================================================
       GET SENDER EMAIL
    ===================================================== */

    const getSenderEmail = (message) => {

        if (
            message?.sender &&
            typeof message.sender ===
            "object"
        ) {

            return (
                message.sender.email ||
                ""
            );

        }

        return "";

    };

    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        const messageDate =
            new Date(date);

        if (
            Number.isNaN(
                messageDate.getTime()
            )
        ) {

            return "";

        }

        const now = new Date();

        const sameDay =
            messageDate.toDateString() ===
            now.toDateString();

        if (sameDay) {

            return messageDate.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );

        }

        return messageDate.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };

    /* =====================================================
       MESSAGE PREVIEW
    ===================================================== */

    const getPreview = (body) => {

        if (!body) {
            return "";
        }

        return body
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 120);

    };

    /* =====================================================
       SELECT MESSAGE
    ===================================================== */

    const handleSelectMessage = async (
        message
    ) => {

        try {

            setMessageError("");

            setMessageLoading(true);

            /*
             * Immediately highlight selected mail
             */

            setSelectedMessage(
                message
            );

            /*
             * Mark as read
             */

            if (!isRead(message)) {

                try {

                    await markMessageAsReadApi(
                        message._id
                    );

                    /*
                     * Update list
                     */

                    setMessages(
                        (previous) =>
                            previous.map(
                                (item) => {

                                    if (
                                        item._id !==
                                        message._id
                                    ) {

                                        return item;

                                    }

                                    return {
                                        ...item,
                                        isRead: true,
                                    };

                                }
                            )
                    );

                } catch (readError) {

                    console.warn(
                        "Mark read error:",
                        readError
                    );

                }

            }

            /*
             * Load complete message
             *
             * This is important because the list
             * may only contain a preview.
             */

            const response =
                await getMessageByIdApi(
                    message._id
                );

            if (
                response?.success &&
                response?.data
            ) {

                setSelectedMessage(
                    response.data
                );

            } else if (
                response?.success &&
                response?.message &&
                typeof response.message ===
                    "object"
            ) {

                setSelectedMessage(
                    response.message
                );

            }

        } catch (error) {

            console.error(
                "Message loading error:",
                error
            );

            /*
             * Keep list version visible
             * if detail request fails.
             */

            setMessageError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load message."
            );

        } finally {

            setMessageLoading(false);

        }

    };

    /* =====================================================
       CLOSE MESSAGE
    ===================================================== */

    const handleCloseMessage = () => {

        setSelectedMessage(null);

        setMessageError("");

    };

    /* =====================================================
       MESSAGE DELETED
    ===================================================== */

    const handleMessageDeleted = (
        messageId
    ) => {

        setMessages(
            (previous) =>
                previous.filter(
                    (message) =>
                        message._id !==
                        messageId
                )
        );

        setSelectedMessage(null);

    };

    /* =====================================================
       MESSAGE UPDATED
    ===================================================== */

    const handleMessageUpdated = async () => {

        await loadInbox(
            page,
            true
        );

    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (
            <div className="h-full p-3 md:p-5">

                <div className="mx-auto max-w-[1800px]">

                    {/* Header */}

                    <div className="mb-4">

                        <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />

                        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200" />

                    </div>

                    {/* Two section skeleton */}

                    <div className="grid min-h-[650px] overflow-hidden rounded-xl border border-gray-200 bg-white lg:grid-cols-[360px_minmax(0,1fr)]">

                        {/* List */}

                        <div className="border-r border-gray-200">

                            {[1, 2, 3, 4, 5, 6].map(
                                (item) => (

                                    <div
                                        key={item}
                                        className="flex gap-3 border-b border-gray-100 p-4"
                                    >

                                        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />

                                        <div className="flex-1">

                                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />

                                            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-200" />

                                            <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-200" />

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                        {/* Viewer */}

                        <div className="hidden lg:block">

                            <div className="flex h-full min-h-[650px] items-center justify-center">

                                <div className="h-20 w-20 animate-pulse rounded-full bg-gray-100" />

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );

    }

    /* =====================================================
       MAIN UI
    ===================================================== */

    return (
        <div className="h-full p-3 md:p-5">

            <div className="mx-auto max-w-[1800px]">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-4 flex items-center justify-between gap-4">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-900">
                            Inbox
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">

                            Your received messages

                            {pagination.total > 0 &&
                                ` · ${pagination.total} messages`}

                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {refreshing
                            ? "Refreshing..."
                            : "↻ Refresh"}

                    </button>

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                loadInbox(page)
                            }
                            className="font-semibold underline"
                        >
                            Retry
                        </button>

                    </div>
                )}

                {/* =================================================
                    MAIN SPLIT VIEW
                ================================================= */}

                <div className="grid min-h-[650px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">

                    {/* =================================================
                        SECTION 1 — MAIL LIST
                    ================================================= */}

                    <section
                        className={`
                            min-w-0
                            border-gray-200
                            lg:border-r
                            ${
                                selectedMessage
                                    ? "hidden lg:block"
                                    : "block"
                            }
                        `}
                    >

                        {/* List Header */}

                        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h2 className="text-sm font-semibold text-gray-800">
                                        Messages
                                    </h2>

                                    <p className="text-xs text-gray-400">
                                        {messages.length} shown
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* Messages */}

                        {messages.length === 0 ? (

                            <div className="flex min-h-[500px] items-center justify-center px-5">

                                <div className="text-center">

                                    <div className="mb-4 text-5xl">
                                        📥
                                    </div>

                                    <h2 className="font-semibold text-gray-700">
                                        Your inbox is empty
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-400">
                                        New messages will appear here.
                                    </p>

                                </div>

                            </div>

                        ) : (

                            <div>

                                {messages.map(
                                    (message) => {

                                        const read =
                                            isRead(
                                                message
                                            );

                                        const selected =
                                            selectedMessage?._id ===
                                            message._id;

                                        return (
                                            <button
                                                key={
                                                    message._id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleSelectMessage(
                                                        message
                                                    )
                                                }
                                                className={`
                                                    group
                                                    flex
                                                    w-full
                                                    items-start
                                                    gap-3
                                                    border-b
                                                    border-gray-100
                                                    px-4
                                                    py-4
                                                    text-left
                                                    transition

                                                    ${
                                                        selected
                                                            ? "bg-indigo-50"
                                                            : !read
                                                            ? "bg-blue-50/40"
                                                            : "bg-white hover:bg-gray-50"
                                                    }
                                                `}
                                            >

                                                {/* Selected indicator */}

                                                <div
                                                    className={`
                                                        mt-1
                                                        h-2
                                                        w-2
                                                        shrink-0
                                                        rounded-full

                                                        ${
                                                            !read
                                                                ? "bg-indigo-600"
                                                                : "bg-transparent"
                                                        }
                                                    `}
                                                />

                                                {/* Avatar */}

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">

                                                    {getSenderName(
                                                        message
                                                    )
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}

                                                </div>

                                                {/* Content */}

                                                <div className="min-w-0 flex-1">

                                                    <div className="flex items-start justify-between gap-2">

                                                        <p
                                                            className={`
                                                                truncate
                                                                text-sm

                                                                ${
                                                                    !read
                                                                        ? "font-bold text-gray-900"
                                                                        : "font-medium text-gray-700"
                                                                }
                                                            `}
                                                        >
                                                            {getSenderName(
                                                                message
                                                            )}
                                                        </p>

                                                        <span className="shrink-0 text-[11px] text-gray-400">

                                                            {formatDate(
                                                                message.sentAt ||
                                                                message.createdAt
                                                            )}

                                                        </span>

                                                    </div>

                                                    <p className="mt-0.5 truncate text-xs text-gray-400">

                                                        {getSenderEmail(
                                                            message
                                                        )}

                                                    </p>

                                                    <p
                                                        className={`
                                                            mt-2
                                                            truncate
                                                            text-sm

                                                            ${
                                                                !read
                                                                    ? "font-semibold text-gray-900"
                                                                    : "text-gray-700"
                                                            }
                                                        `}
                                                    >
                                                        {message.subject ||
                                                            "(No subject)"}
                                                    </p>

                                                    <p className="mt-1 truncate text-xs text-gray-400">

                                                        {getPreview(
                                                            message.body
                                                        )}

                                                    </p>

                                                </div>

                                            </button>
                                        );

                                    }
                                )}

                            </div>

                        )}

                    </section>

                    {/* =================================================
                        SECTION 2 — MESSAGE VIEW
                    ================================================= */}

                    <section
                        className={`
                            min-w-0
                            bg-white

                            ${
                                selectedMessage
                                    ? "block"
                                    : "hidden lg:block"
                            }
                        `}
                    >

                        {/* Mobile back */}

                        {selectedMessage && (
                            <div className="border-b border-gray-200 px-3 py-2 lg:hidden">

                                <button
                                    type="button"
                                    onClick={
                                        handleCloseMessage
                                    }
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                                >
                                    ← Back to messages
                                </button>

                            </div>
                        )}

                        {/* Message loading */}

                        {messageLoading ? (

                            <div className="flex min-h-[600px] items-center justify-center">

                                <div className="text-center">

                                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />

                                    <p className="text-sm text-gray-500">
                                        Loading message...
                                    </p>

                                </div>

                            </div>

                        ) : messageError ? (

                            <div className="flex min-h-[600px] items-center justify-center p-6">

                                <div className="text-center">

                                    <div className="mb-3 text-4xl">
                                        ⚠️
                                    </div>

                                    <h3 className="font-semibold text-gray-700">
                                        Unable to open message
                                    </h3>

                                    <p className="mt-1 text-sm text-red-500">
                                        {messageError}
                                    </p>

                                </div>

                            </div>

                        ) : (

                            <MessageViewer
                                message={
                                    selectedMessage
                                }
                                onClose={
                                    handleCloseMessage
                                }
                                onMessageDeleted={
                                    handleMessageDeleted
                                }
                                onMessageUpdated={
                                    handleMessageUpdated
                                }
                                showCloseButton={false}
                            />

                        )}

                    </section>

                </div>

                {/* =================================================
                    PAGINATION
                ================================================= */}

                {pagination.pages > 1 && (
                    <div className="mt-4 flex items-center justify-between">

                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() =>
                                loadInbox(
                                    page - 1
                                )
                            }
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            ← Previous
                        </button>

                        <span className="text-sm text-gray-500">
                            Page {page} of{" "}
                            {pagination.pages}
                        </span>

                        <button
                            type="button"
                            disabled={
                                page >=
                                pagination.pages
                            }
                            onClick={() =>
                                loadInbox(
                                    page + 1
                                )
                            }
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next →
                        </button>

                    </div>
                )}

            </div>

        </div>
    );
};

export default Inbox;