import React, {
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


const LIMIT = 20;


const Inbox = () => {

    // ============================================================
    // STATE
    // ============================================================

    const [messages, setMessages] =
        useState([]);

    const [selectedMessage, setSelectedMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [messageLoading, setMessageLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [messageError, setMessageError] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: LIMIT,
            total: 0,
            pages: 1,
        });


    // ============================================================
    // UNREAD COUNT
    // ============================================================

    const unreadCount =
        messages.filter(
            (message) =>
                !message?.isRead
        ).length;


    // ============================================================
    // LOAD INBOX
    // ============================================================

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
                        limit: LIMIT,
                    });

                if (!response?.success) {

                    throw new Error(
                        response?.message ||
                        "Unable to load inbox."
                    );
                }

                const inboxMessages =
                    response?.messages ||
                    response?.data ||
                    [];

                const safeMessages =
                    Array.isArray(
                        inboxMessages
                    )
                        ? inboxMessages
                        : [];

                setMessages(
                    safeMessages
                );


                // ------------------------------------------------
                // Pagination
                // ------------------------------------------------

                if (
                    response?.pagination
                ) {

                    setPagination({
                        page:
                            Number(
                                response.pagination.page
                            ) ||
                            currentPage,

                        limit:
                            Number(
                                response.pagination.limit
                            ) ||
                            LIMIT,

                        total:
                            Number(
                                response.pagination.total
                            ) ||
                            safeMessages.length,

                        pages:
                            Number(
                                response.pagination.pages
                            ) ||
                            1,
                    });

                } else {

                    setPagination({
                        page: currentPage,

                        limit: LIMIT,

                        total:
                            Number(
                                response?.total
                            ) ||
                            safeMessages.length,

                        pages:
                            Number(
                                response?.pages
                            ) ||
                            Number(
                                response?.totalPages
                            ) ||
                            1,
                    });
                }


                setPage(
                    currentPage
                );


                // ------------------------------------------------
                // Keep selected message updated
                // ------------------------------------------------

                if (
                    selectedMessage?._id
                ) {

                    const updatedMessage =
                        safeMessages.find(
                            (item) =>
                                item._id ===
                                selectedMessage._id
                        );

                    if (
                        updatedMessage
                    ) {

                        setSelectedMessage(
                            updatedMessage
                        );
                    }
                }

            } catch (err) {

                console.error(
                    "Inbox loading error:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load inbox."
                );

                setMessages([]);

            } finally {

                setLoading(false);
                setRefreshing(false);
            }

        },
        [selectedMessage?._id]
    );


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadInbox(1);

    }, []);


    // ============================================================
    // REFRESH
    // ============================================================

    const handleRefresh = () => {

        if (
            loading ||
            refreshing
        ) {
            return;
        }

        loadInbox(
            page,
            true
        );
    };


    // ============================================================
    // CHECK READ
    // ============================================================

    const isRead = (
        message
    ) => {

        if (
            typeof message?.isRead ===
            "boolean"
        ) {

            return message.isRead;
        }

        return false;
    };


    // ============================================================
    // SENDER NAME
    // ============================================================

    const getSenderName = (
        message
    ) => {

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


    // ============================================================
    // SENDER EMAIL
    // ============================================================

    const getSenderEmail = (
        message
    ) => {

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


    // ============================================================
    // SENDER INITIAL
    // ============================================================

    const getSenderInitial = (
        message
    ) => {

        const name =
            getSenderName(
                message
            );

        return (
            name
                ?.charAt(0)
                ?.toUpperCase() ||
            "?"
        );
    };


    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "";
        }

        const value =
            new Date(date);

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {

            return "";
        }

        const now =
            new Date();

        const isToday =
            value.toDateString() ===
            now.toDateString();

        if (isToday) {

            return value.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );
        }

        return value.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    // ============================================================
    // MESSAGE PREVIEW
    // ============================================================

    const getPreview = (
        body
    ) => {

        if (!body) {
            return "No message content";
        }

        return String(body)
            .replace(
                /<[^>]*>/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim()
            .slice(
                0,
                160
            ) ||
            "No message content";
    };


    // ============================================================
    // SELECT MESSAGE
    // ============================================================

    const handleSelectMessage =
        async (message) => {

            if (
                !message?._id
            ) {
                return;
            }

            try {

                setMessageError("");

                setMessageLoading(
                    true
                );

                // ------------------------------------------------
                // Immediately display selected message
                // ------------------------------------------------

                setSelectedMessage(
                    message
                );


                // ------------------------------------------------
                // Mark as read
                // ------------------------------------------------

                if (
                    !isRead(message)
                ) {

                    try {

                        await markMessageAsReadApi(
                            message._id
                        );

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

                    } catch (
                        readError
                    ) {

                        console.warn(
                            "Mark message as read error:",
                            readError
                        );
                    }
                }


                // ------------------------------------------------
                // Get complete message
                // ------------------------------------------------

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

            } catch (err) {

                console.error(
                    "Message loading error:",
                    err
                );

                setMessageError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load message."
                );

            } finally {

                setMessageLoading(
                    false
                );
            }
        };


    // ============================================================
    // CLOSE MESSAGE
    // ============================================================

    const handleCloseMessage = () => {

        setSelectedMessage(
            null
        );

        setMessageError("");

        setMessageLoading(
            false
        );
    };


    // ============================================================
    // DELETE MESSAGE
    // ============================================================

    const handleDelete = async (
        messageId
    ) => {

        if (!messageId) {
            return;
        }

        try {

            await moveMessageToTrashApi(
                messageId
            );

            setMessages(
                (previous) =>
                    previous.filter(
                        (message) =>
                            message._id !==
                            messageId
                    )
            );

            setSelectedMessage(
                null
            );

            setMessageError("");

        } catch (err) {

            console.error(
                "Move message to trash error:",
                err
            );

            setMessageError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to move message to trash."
            );
        }
    };


    // ============================================================
    // REFRESH AFTER MESSAGE ACTION
    // ============================================================

    const handleMessageUpdated =
        async () => {

            await loadInbox(
                page,
                true
            );
        };


    // ============================================================
    // PREVIOUS PAGE
    // ============================================================

    const handlePreviousPage = () => {

        if (
            page <= 1 ||
            loading
        ) {
            return;
        }

        setSelectedMessage(
            null
        );

        setMessageError("");

        loadInbox(
            page - 1
        );
    };


    // ============================================================
    // NEXT PAGE
    // ============================================================

    const handleNextPage = () => {

        const totalPages =
            Number(
                pagination?.pages
            ) || 1;

        if (
            page >= totalPages ||
            loading
        ) {
            return;
        }

        setSelectedMessage(
            null
        );

        setMessageError("");

        loadInbox(
            page + 1
        );
    };


    // ============================================================
    // PAGE NUMBERS
    // ============================================================

    const getPageNumbers = () => {

        const totalPages =
            Number(
                pagination?.pages
            ) || 1;

        if (
            totalPages <= 5
        ) {

            return Array.from(
                {
                    length:
                        totalPages,
                },
                (_, index) =>
                    index + 1
            );
        }

        const pages = [];

        pages.push(1);

        if (page > 3) {
            pages.push("...");
        }

        const start =
            Math.max(
                2,
                page - 1
            );

        const end =
            Math.min(
                totalPages - 1,
                page + 1
            );

        for (
            let index = start;
            index <= end;
            index++
        ) {

            pages.push(
                index
            );
        }

        if (
            page <
            totalPages - 2
        ) {

            pages.push(
                "..."
            );
        }

        pages.push(
            totalPages
        );

        return pages;
    };


    // ============================================================
    // MESSAGE CARD
    // ============================================================

    const renderMessageCard = (
        message
    ) => {

        const read =
            isRead(message);

        const selected =
            selectedMessage?._id ===
            message._id;

        return (

            <button
                key={message._id}
                type="button"
                onClick={() =>
                    handleSelectMessage(message)
                }
                className={`
                    w-full
                    text-left
                    px-3
                    xl:px-4
                    py-3
                    xl:py-4
                    transition
                    focus:outline-none
                    border-l-4
                    ${
                        selected
                            ? "bg-blue-50 border-l-blue-500"
                            : "hover:bg-gray-50 border-l-transparent"
                    }
                `}
            >

                <div
                    className="
                        flex
                        items-start
                        gap-3
                        min-w-0
                    "
                >

                    {/* INBOX ICON */}

                    <div
                        className={`
                            shrink-0
                            w-9
                            h-9
                            sm:w-10
                            sm:h-10
                            rounded-full
                            flex
                            items-center
                            justify-center
                            font-semibold
                            text-lg
                            ${
                                !read
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-500"
                            }
                        `}
                    >
                        ↓
                    </div>


                    {/* MESSAGE CONTENT */}

                    <div
                        className="
                            min-w-0
                            flex-1
                        "
                    >

                        {/* SUBJECT + INBOX BADGE */}

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                min-w-0
                            "
                        >

                            <span
                                className="
                                    shrink-0
                                    px-1.5
                                    sm:px-2
                                    py-0.5
                                    text-[10px]
                                    sm:text-xs
                                    rounded
                                    bg-blue-100
                                    text-blue-600
                                    font-medium
                                "
                            >
                                Inbox
                            </span>

                            <span
                                className={`
                                    min-w-0
                                    flex-1
                                    truncate
                                    text-sm
                                    sm:text-base
                                    ${
                                        read
                                            ? "font-medium text-gray-800"
                                            : "font-bold text-gray-900"
                                    }
                                `}
                            >
                                {message.subject ||
                                    "(No Subject)"}
                            </span>

                            {/* UNREAD BADGE */}

                            {!read && (
                                <span
                                    className="
                                        shrink-0
                                        min-w-5
                                        h-5
                                        px-1.5
                                        rounded-full
                                        bg-blue-600
                                        text-white
                                        text-[10px]
                                        font-bold
                                        flex
                                        items-center
                                        justify-center
                                    "
                                    title="Unread"
                                >
                                    1
                                </span>
                            )}

                        </div>


                        {/* FROM */}

                        <div
                            className="
                                text-xs
                                sm:text-sm
                                text-gray-500
                                mt-1
                                truncate
                            "
                        >
                            From:{" "}
                            {getSenderName(message)}
                        </div>


                        {/* EMAIL */}

                        {getSenderEmail(message) && (
                            <div
                                className="
                                    text-[10px]
                                    sm:text-xs
                                    text-gray-400
                                    mt-0.5
                                    truncate
                                "
                            >
                                {getSenderEmail(message)}
                            </div>
                        )}


                        {/* PREVIEW */}

                        <div
                            className="
                                text-xs
                                sm:text-sm
                                text-gray-500
                                mt-1.5
                                line-clamp-2
                                break-words
                            "
                        >
                            {getPreview(message.body)}
                        </div>


                        {/* DATE */}

                        <div
                            className="
                                text-[11px]
                                sm:text-xs
                                text-gray-400
                                mt-2
                            "
                        >
                            {formatDate(
                                message.sentAt ||
                                message.createdAt
                            )}
                        </div>

                    </div>

                </div>

            </button>
        );
    };


    // ============================================================
    // LOADING SKELETON
    // ============================================================

    const renderSkeletons = (
        count = 7
    ) => {

        return (

            <div
                className="
                    divide-y
                    divide-gray-100
                "
            >

                {Array.from(
                    {
                        length: count,
                    }
                ).map(
                    (_, index) => (

                        <div
                            key={index}
                            className="
                                flex
                                gap-3
                                p-4
                                animate-pulse
                            "
                        >

                            <div
                                className="
                                    w-10
                                    h-10
                                    shrink-0
                                    rounded-full
                                    bg-gray-200
                                "
                            />

                            <div
                                className="
                                    flex-1
                                    min-w-0
                                "
                            >

                                <div
                                    className="
                                        h-4
                                        w-32
                                        rounded
                                        bg-gray-200
                                    "
                                />

                                <div
                                    className="
                                        mt-2
                                        h-3
                                        w-24
                                        rounded
                                        bg-gray-200
                                    "
                                />

                                <div
                                    className="
                                        mt-3
                                        h-3
                                        w-full
                                        rounded
                                        bg-gray-200
                                    "
                                />

                                <div
                                    className="
                                        mt-2
                                        h-3
                                        w-3/4
                                        rounded
                                        bg-gray-200
                                    "
                                />

                            </div>

                        </div>
                    )
                )}

            </div>
        );
    };


    // ============================================================
    // EMPTY STATE
    // ============================================================

    const renderEmptyState = () => {

        return (

            <div
                className="
                    h-full
                    min-h-[280px]
                    flex
                    items-center
                    justify-center
                    
                "
            >

                <div
                    className="
                        text-center
                        max-w-xs
                    "
                >

                    <div
                        className="
                            w-16
                            h-16
                            mx-auto
                            mb-4
                            rounded-full
                            bg-blue-50
                            flex
                            items-center
                            justify-center
                            text-3xl
                        "
                    >
                        📥
                    </div>

                    <h2
                        className="
                            font-semibold
                            text-gray-700
                        "
                    >
                        Your inbox is empty
                    </h2>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-gray-500
                        "
                    >
                        New messages will
                        appear here.
                    </p>

                </div>

            </div>
        );
    };


    // ============================================================
    // DEFAULT RIGHT PANEL
    // ============================================================

    const renderDefaultPanel = () => {

        return (

            <div
                className="
                    h-full
                    min-h-0
                    flex
                    justify-center
                    bg-gray-50
                    px-10
                    py-30
                "
            >

                <div
                    className="
                        text-center
                        max-w-md
                    "
                >

                    <div
                        className="
                            w-20
                            h-20
                            mx-auto
                            mb-7
                            rounded-full
                            bg-white
                            border
                            border-gray-200
                            shadow-sm
                            flex
                            items-center
                            justify-center
                            text-4xl
                        "
                    >
                        📥
                    </div>

                    <h2
                        className="
                            text-lg
                            xl:text-xl
                            font-semibold
                            text-gray-700
                        "
                    >
                        Select an inbox message
                    </h2>

                    <p
                        className="
                            text-sm
                            text-gray-500
                            mt-2
                        "
                    >
                        Select a message from the list to view its complete contents.
                    </p>

                </div>

            </div>
        );
    };


    // ============================================================
    // RETURN
    // ============================================================

    return (

        <div
            className="
                w-full
                h-full
                min-h-0
                max-h-full
                overflow-hidden
                bg-white
            "
        >

            {/* ====================================================
                MOBILE + TABLET
            ===================================================== */}

            <div
                className="
                    lg:hidden
                    w-full
                    h-full
                    min-h-0
                "
            >

                {!selectedMessage ? (

                    <div
                        className="
                            h-full
                            min-h-0
                            flex
                            flex-col
                            bg-white
                        "
                    >

                        {/* ==========================================
                            MOBILE HEADER
                        =========================================== */}

                        <div
                            className="
                                shrink-0
                                flex
                                items-center
                                justify-between
                                gap-3
                                px-3
                                sm:px-4
                                py-3
                                sm:py-4
                                border-b
                                border-gray-200
                                bg-white
                            "
                        >

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
                                            text-lg
                                            sm:text-xl
                                            font-semibold
                                            text-gray-800
                                        "
                                    >
                                        Inbox
                                    </h1>


                                    {/* BADGE */}

                                    {unreadCount > 0 && (

                                        <span
                                            className="
                                                min-w-6
                                                h-6
                                                px-2
                                                rounded-full
                                                bg-blue-600
                                                text-white
                                                text-xs
                                                font-bold
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >
                                            {unreadCount > 99
                                                ? "99+"
                                                : unreadCount}
                                        </span>

                                    )}

                                </div>


                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        sm:text-sm
                                        text-gray-500
                                    "
                                >
                                    {pagination.total > 0
                                        ? `${pagination.total} messages`
                                        : "Your received messages"}
                                </p>

                            </div>


                            {/* REFRESH */}

                            <button
                                type="button"
                                onClick={
                                    handleRefresh
                                }
                                disabled={
                                    refreshing
                                }
                                className="
                                    shrink-0
                                    w-9
                                    h-9
                                    sm:w-10
                                    sm:h-10
                                    rounded-lg
                                    border
                                    border-gray-200
                                    flex
                                    items-center
                                    justify-center
                                    text-gray-600
                                    hover:bg-gray-50
                                    active:bg-gray-100
                                    disabled:opacity-50
                                    transition
                                "
                                title="Refresh inbox"
                            >
                                {refreshing
                                    ? "..."
                                    : "↻"}
                            </button>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div
                                className="
                                    shrink-0
                                    mx-3
                                    sm:mx-4
                                    mt-3
                                    p-3
                                    rounded-lg
                                    border
                                    border-red-200
                                    bg-red-50
                                    text-red-600
                                    text-xs
                                    sm:text-sm
                                "
                            >
                                {error}
                            </div>

                        )}


                        {/* LIST */}

                        <div
                            className="
                                flex-1
                                min-h-0
                                overflow-y-auto
                                overflow-x-hidden
                                overscroll-contain
                            "
                        >

                            {loading ? (

                                renderSkeletons(6)

                            ) : messages.length === 0 ? (

                                renderEmptyState()

                            ) : (

                                <div
                                    className="
                                        divide-y
                                        divide-gray-100
                                    "
                                >

                                    {messages.map(
                                        renderMessageCard
                                    )}

                                </div>

                            )}

                        </div>


                        {/* MOBILE PAGINATION */}

                        {!loading &&
                            messages.length > 0 && (

                                <div
                                    className="
                                        shrink-0
                                        border-t
                                        border-gray-200
                                        bg-white
                                        px-3
                                        sm:px-4
                                        py-2.5
                                        sm:py-3
                                        flex
                                        items-center
                                        justify-between
                                        gap-2
                                    "
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            handlePreviousPage
                                        }
                                        disabled={
                                            page <= 1
                                        }
                                        className="
                                            px-3
                                            py-2
                                            rounded-lg
                                            border
                                            border-gray-200
                                            text-xs
                                            sm:text-sm
                                            text-gray-700
                                            hover:bg-gray-50
                                            disabled:opacity-40
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        Previous
                                    </button>


                                    <span
                                        className="
                                            text-xs
                                            sm:text-sm
                                            text-gray-500
                                            whitespace-nowrap
                                        "
                                    >
                                        {page} /{" "}
                                        {pagination.pages}
                                    </span>


                                    <button
                                        type="button"
                                        onClick={
                                            handleNextPage
                                        }
                                        disabled={
                                            page >=
                                            pagination.pages
                                        }
                                        className="
                                            px-3
                                            py-2
                                            rounded-lg
                                            border
                                            border-gray-200
                                            text-xs
                                            sm:text-sm
                                            text-gray-700
                                            hover:bg-gray-50
                                            disabled:opacity-40
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        Next
                                    </button>

                                </div>

                            )}

                    </div>

                ) : (

                    /* ==============================================
                       MOBILE MESSAGE VIEWER
                    =============================================== */

                    <div
                        className="
                            h-full
                            min-h-0
                            overflow-hidden
                            relative
                        "
                    >

                        {messageLoading && (

                            <div
                                className="
                                    absolute
                                    inset-0
                                    z-20
                                    flex
                                    items-center
                                    justify-center
                                    bg-white/70
                                    backdrop-blur-sm
                                "
                            >

                                <div
                                    className="
                                        w-8
                                        h-8
                                        rounded-full
                                        border-2
                                        border-blue-600
                                        border-t-transparent
                                        animate-spin
                                    "
                                />

                            </div>
                        )}


                        <MessageViewer
                            message={
                                selectedMessage
                            }
                            folder="inbox"
                            onClose={
                                handleCloseMessage
                            }
                            onRefresh={
                                handleMessageUpdated
                            }
                            onDelete={
                                handleDelete
                            }
                        />

                    </div>

                )}

            </div>


            {/* ====================================================
                DESKTOP
            ===================================================== */}

            <div
                className="
                    hidden
                    lg:grid
                    w-full
                    h-full
                    min-h-0
                    max-h-full
                    overflow-hidden
                    grid-cols-[minmax(300px,360px)_minmax(0,1fr)]
                    xl:grid-cols-[380px_minmax(0,1fr)]
                    2xl:grid-cols-[420px_minmax(0,1fr)]
                "
            >

                {/* =================================================
                    LEFT MAIL LIST
                ================================================== */}

                <section
                    className="
                        min-w-0
                        min-h-0
                        h-full
                        overflow-hidden
                        border-r
                        border-gray-200
                        bg-white
                        flex
                        flex-col
                    "
                >

                    {/* HEADER */}

                    <div
                        className="
                            shrink-0
                            px-4
                            xl:px-5
                            py-4
                            border-b
                            border-gray-200
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                gap-3
                            "
                        >

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
                                            text-lg
                                            xl:text-xl
                                            font-semibold
                                            text-gray-800
                                        "
                                    >
                                        Inbox
                                    </h1>


                                    {/* UNREAD BADGE */}

                                    {unreadCount > 0 && (

                                        <span
                                            className="
                                                min-w-6
                                                h-6
                                                px-2
                                                rounded-full
                                                bg-blue-600
                                                text-white
                                                text-xs
                                                font-bold
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >
                                            {unreadCount > 99
                                                ? "99+"
                                                : unreadCount}
                                        </span>

                                    )}

                                </div>


                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        xl:text-sm
                                        text-gray-500
                                    "
                                >
                                    {pagination.total > 0
                                        ? `${pagination.total} messages`
                                        : "Your received messages"}
                                </p>

                            </div>


                            {/* REFRESH */}

                            <button
                                type="button"
                                onClick={
                                    handleRefresh
                                }
                                disabled={
                                    refreshing
                                }
                                className="
                                    shrink-0
                                    w-9
                                    h-9
                                    rounded-lg
                                    border
                                    border-gray-200
                                    flex
                                    items-center
                                    justify-center
                                    text-gray-600
                                    hover:bg-gray-50
                                    disabled:opacity-50
                                    transition
                                "
                                title="Refresh inbox"
                            >
                                {refreshing
                                    ? "..."
                                    : "↻"}
                            </button>

                        </div>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div
                            className="
                                shrink-0
                                m-3
                                p-3
                                rounded-lg
                                border
                                border-red-200
                                bg-red-50
                                text-red-600
                                text-sm
                            "
                        >
                            {error}
                        </div>

                    )}


                    {/* MESSAGE LIST */}

                    <div
                        className="
                            flex-1
                            min-h-0
                            overflow-y-auto
                            overflow-x-hidden
                            overscroll-contain
                        "
                    >

                        {loading ? (

                            renderSkeletons(7)

                        ) : messages.length === 0 ? (

                            renderEmptyState()

                        ) : (

                            <div
                                className="
                                    divide-y
                                    divide-gray-100
                                "
                            >

                                {messages.map(
                                    renderMessageCard
                                )}

                            </div>

                        )}

                    </div>


                    {/* PAGINATION */}

                    {!loading &&
                        messages.length > 0 && (

                            <div
                                className="
                                    shrink-0
                                    border-t
                                    border-gray-200
                                    bg-white
                                    px-3
                                    xl:px-4
                                    py-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-2
                                    "
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            handlePreviousPage
                                        }
                                        disabled={
                                            page <= 1
                                        }
                                        className="
                                            px-3
                                            py-2
                                            rounded-lg
                                            border
                                            border-gray-200
                                            text-xs
                                            text-gray-700
                                            hover:bg-gray-50
                                            disabled:opacity-40
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        Previous
                                    </button>


                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-1
                                        "
                                    >

                                        {getPageNumbers().map(
                                            (
                                                pageNumber,
                                                index
                                            ) => {

                                                if (
                                                    pageNumber ===
                                                    "..."
                                                ) {

                                                    return (

                                                        <span
                                                            key={
                                                                `dots-${index}`
                                                            }
                                                            className="
                                                                px-1
                                                                text-xs
                                                                text-gray-400
                                                            "
                                                        >
                                                            ...
                                                        </span>

                                                    );
                                                }


                                                return (

                                                    <button
                                                        key={
                                                            pageNumber
                                                        }
                                                        type="button"
                                                        onClick={() => {

                                                            if (
                                                                pageNumber !==
                                                                page
                                                            ) {

                                                                setSelectedMessage(
                                                                    null
                                                                );

                                                                loadInbox(
                                                                    pageNumber
                                                                );
                                                            }
                                                        }}
                                                        className={`
                                                            w-7
                                                            h-7
                                                            rounded-md
                                                            text-xs
                                                            transition
                                                            ${
                                                                pageNumber ===
                                                                page
                                                                    ? "bg-blue-600 text-white"
                                                                    : "text-gray-600 hover:bg-gray-100"
                                                            }
                                                        `}
                                                    >
                                                        {
                                                            pageNumber
                                                        }
                                                    </button>

                                                );
                                            }
                                        )}

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            handleNextPage
                                        }
                                        disabled={
                                            page >=
                                            pagination.pages
                                        }
                                        className="
                                            px-3
                                            py-2
                                            rounded-lg
                                            border
                                            border-gray-200
                                            text-xs
                                            text-gray-700
                                            hover:bg-gray-50
                                            disabled:opacity-40
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        Next
                                    </button>

                                </div>

                            </div>

                        )}

                </section>


                {/* =================================================
                    RIGHT CONTENT
                ================================================== */}

                <section
                    className="
                        min-w-0
                        min-h-0
                        h-full
                        overflow-hidden
                        bg-gray-50
                        relative
                    "
                >

                    {selectedMessage ? (

                        <>

                            {messageLoading && (

                                <div
                                    className="
                                        absolute
                                        inset-0
                                        z-20
                                        flex
                                        items-center
                                        justify-center
                                        bg-white/70
                                        backdrop-blur-sm
                                    "
                                >

                                    <div
                                        className="
                                            w-8
                                            h-8
                                            rounded-full
                                            border-2
                                            border-blue-600
                                            border-t-transparent
                                            animate-spin
                                        "
                                    />

                                </div>

                            )}


                            <MessageViewer
                                message={
                                    selectedMessage
                                }
                                folder="inbox"
                                onClose={
                                    handleCloseMessage
                                }
                                onRefresh={
                                    handleMessageUpdated
                                }
                                onDelete={
                                    handleDelete
                                }
                            />


                            {messageError && (

                                <div
                                    className="
                                        absolute
                                        left-4
                                        right-4
                                        bottom-4
                                        z-30
                                        rounded-lg
                                        border
                                        border-red-200
                                        bg-red-50
                                        px-4
                                        py-3
                                        text-sm
                                        text-red-700
                                        shadow-lg
                                    "
                                >
                                    {messageError}
                                </div>

                            )}

                        </>

                    ) : (

                        renderDefaultPanel()

                    )}

                </section>

            </div>

        </div>
    );
};


export default Inbox;