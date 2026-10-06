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


const LIMIT = 50;


const Inbox = () => {

    // ============================================================
    // STATE
    // ============================================================

    const [messages, setMessages] = useState([]);

    const [selectedMessage, setSelectedMessage] =
        useState(null);

    const [selectedMessages, setSelectedMessages] =
        useState([]);

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
    // LOAD INBOX
    // ============================================================

    const loadInbox = useCallback(
        async (
            currentPage = 1,
            isRefresh = false
        ) => {

            try {

                setError("");

                if (isRefresh) {
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


                const responseMessages =
                    response?.messages ||
                    response?.data ||
                    [];


                const safeMessages =
                    Array.isArray(
                        responseMessages
                    )
                        ? responseMessages
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

                    const total =
                        Number(
                            response?.total
                        ) ||
                        safeMessages.length;


                    const pages =
                        Number(
                            response?.pages
                        ) ||
                        Number(
                            response?.totalPages
                        ) ||
                        Math.max(
                            1,
                            Math.ceil(
                                total / LIMIT
                            )
                        );


                    setPagination({

                        page:
                            currentPage,

                        limit:
                            LIMIT,

                        total,

                        pages,

                    });

                }


                setPage(
                    currentPage
                );


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
        []
    );


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadInbox(1);

    }, [loadInbox]);


    // ============================================================
    // UNREAD COUNT
    // ============================================================

    const unreadCount =
        messages.filter(
            (message) =>
                !message?.isRead
        ).length;


    // ============================================================
    // SELECTED COUNT
    // ============================================================

    const selectedCount =
        selectedMessages.length;


    // ============================================================
    // SELECT ALL
    // ============================================================

    const allSelected =
        messages.length > 0 &&
        selectedMessages.length ===
            messages.length;


    const partiallySelected =
        selectedMessages.length > 0 &&
        selectedMessages.length <
            messages.length;


    // ============================================================
    // REFRESH
    // ============================================================

    const handleRefresh = () => {

        if (
            refreshing ||
            loading
        ) {
            return;
        }


        loadInbox(
            page,
            true
        );

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


                /*
                 * Immediately display the message.
                 * This makes the UI feel instant.
                 */

                setSelectedMessage(
                    message
                );


                /*
                 * Remove checkbox selection
                 * when opening a message.
                 */

                setSelectedMessages([]);


                // ------------------------------------------------
                // MARK AS READ
                // ------------------------------------------------

                if (
                    !message.isRead
                ) {

                    try {

                        await markMessageAsReadApi(
                            message._id
                        );


                        setMessages(
                            (previous) =>
                                previous.map(
                                    (item) =>
                                        item._id ===
                                        message._id
                                            ? {
                                                  ...item,
                                                  isRead: true,
                                              }
                                            : item
                                )
                        );

                    } catch (
                        readError
                    ) {

                        console.warn(
                            "Mark as read failed:",
                            readError
                        );

                    }

                }


                // ------------------------------------------------
                // GET FULL MESSAGE
                // ------------------------------------------------

                if (
                    typeof getMessageByIdApi ===
                    "function"
                ) {

                    const response =
                        await getMessageByIdApi(
                            message._id
                        );


                    if (
                        response?.success
                    ) {

                        const fullMessage =
                            response?.data ||
                            response?.message;


                        if (
                            fullMessage &&
                            typeof fullMessage ===
                                "object"
                        ) {

                            setSelectedMessage(
                                fullMessage
                            );

                        }

                    }

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
    // SELECT CHECKBOX
    // ============================================================

    const handleSelectCheckbox = (
        messageId
    ) => {

        if (!messageId) {
            return;
        }


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


    // ============================================================
    // SELECT ALL
    // ============================================================

    const handleSelectAll = () => {

        if (
            messages.length === 0
        ) {
            return;
        }


        if (
            allSelected
        ) {

            setSelectedMessages([]);

            return;

        }


        setSelectedMessages(
            messages
                .map(
                    (message) =>
                        message?._id
                )
                .filter(Boolean)
        );

    };


    // ============================================================
    // CLEAR SELECTION
    // ============================================================

    const handleClearSelection = () => {

        setSelectedMessages([]);

    };


    // ============================================================
    // MESSAGE SELECTED CHECK
    // ============================================================

    const isSelected = (
        messageId
    ) => {

        return selectedMessages.includes(
            messageId
        );

    };


    // ============================================================
    // SENDER NAME
    // ============================================================

    const getSenderName = (
        message
    ) => {

        const sender =
            message?.sender;


        if (!sender) {
            return "Unknown sender";
        }


        if (
            typeof sender ===
            "string"
        ) {

            return sender;

        }


        return (
            sender.name ||
            sender.fullName ||
            sender.employeeName ||
            sender.username ||
            sender.email ||
            "Unknown sender"
        );

    };


    // ============================================================
    // SENDER EMAIL
    // ============================================================

    const getSenderEmail = (
        message
    ) => {

        const sender =
            message?.sender;


        if (
            !sender ||
            typeof sender ===
                "string"
        ) {

            return "";

        }


        return (
            sender.email ||
            sender.emailAddress ||
            ""
        );

    };


    // ============================================================
    // SENDER INITIAL
    // ============================================================

    const getInitial = (
        message
    ) => {

        return (
            getSenderName(message)
                ?.charAt(0)
                ?.toUpperCase() ||
            "U"
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


        const parsed =
            new Date(date);


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "";

        }


        const now =
            new Date();


        const isToday =
            parsed.toDateString() ===
            now.toDateString();


        if (isToday) {

            return parsed.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );

        }


        return parsed.toLocaleDateString(
            "en-IN",
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
                150
            ) ||
            "No message content";

    };


    // ============================================================
    // DELETE / MOVE TO TRASH
    // ============================================================

    const handleDelete = async (
        messageId
    ) => {

        if (!messageId) {
            return;
        }


        try {

            const response =
                await moveMessageToTrashApi(
                    messageId
                );


            if (
                response &&
                response.success === false
            ) {

                throw new Error(
                    response.message ||
                    "Unable to move message to trash."
                );

            }


            // Remove from inbox

            setMessages(
                (previous) =>
                    previous.filter(
                        (message) =>
                            message._id !==
                            messageId
                    )
            );


            // Remove from selection

            setSelectedMessages(
                (previous) =>
                    previous.filter(
                        (id) =>
                            id !==
                            messageId
                    )
            );


            // Close full-screen viewer

            setSelectedMessage(
                null
            );


            setMessageError("");

        } catch (err) {

            console.error(
                "Move to trash error:",
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
    // MESSAGE UPDATED
    // ============================================================

    const handleMessageUpdated =
        async () => {

            /*
             * Refresh the inbox without
             * opening the list beside the viewer.
             */

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

        setSelectedMessages([]);

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
                pagination.pages
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

        setSelectedMessages([]);

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
                pagination.pages
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


        const result = [];

        result.push(1);


        if (
            page > 3
        ) {

            result.push(
                "..."
            );

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

            result.push(
                index
            );

        }


        if (
            page <
            totalPages - 2
        ) {

            result.push(
                "..."
            );

        }


        result.push(
            totalPages
        );


        return result;

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
                                    mt-3
                                    h-4
                                    w-4
                                    shrink-0
                                    rounded
                                    bg-gray-200
                                "
                            />

                            <div
                                className="
                                    h-10
                                    w-10
                                    shrink-0
                                    rounded-full
                                    bg-gray-200
                                "
                            />

                            <div
                                className="
                                    min-w-0
                                    flex-1
                                "
                            >

                                <div
                                    className="
                                        h-4
                                        w-36
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
                    flex
                    h-full
                    min-h-[300px]
                    items-center
                    justify-center
                    px-5
                "
            >

                <div
                    className="
                        max-w-sm
                        text-center
                    "
                >

                    <div
                        className="
                            mx-auto
                            mb-4
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-full
                            bg-blue-50
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
    // SELECTION TOOLBAR
    // ============================================================

    const renderSelectionToolbar = () => {

        if (
            messages.length === 0
        ) {
            return null;
        }


        return (

            <div
                className="
                    flex
                    min-h-[54px]
                    shrink-0
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-gray-200
                    bg-white
                    px-3
                    sm:px-4
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

                    <label
                        className="
                            flex
                            shrink-0
                            cursor-pointer
                            select-none
                            items-center
                            gap-2
                            text-xs
                            text-gray-600
                            sm:text-sm
                        "
                    >

                        <input
                            type="checkbox"
                            checked={
                                allSelected
                            }
                            ref={(
                                element
                            ) => {

                                if (
                                    element
                                ) {

                                    element.indeterminate =
                                        partiallySelected;

                                }

                            }}
                            onChange={
                                handleSelectAll
                            }
                            className="
                                h-4
                                w-4
                                cursor-pointer
                                rounded
                                border-gray-300
                                text-blue-600
                                focus:ring-2
                                focus:ring-blue-500
                            "
                        />

                        <span>
                            Select All
                        </span>

                    </label>


                    {selectedCount > 0 && (

                        <span
                            className="
                                shrink-0
                                rounded-full
                                bg-blue-50
                                px-2.5
                                py-1
                                text-[11px]
                                font-semibold
                                text-blue-600
                                sm:text-xs
                            "
                        >
                            {selectedCount} selected
                        </span>

                    )}

                </div>


                {selectedCount > 0 && (

                    <button
                        type="button"
                        onClick={
                            handleClearSelection
                        }
                        className="
                            shrink-0
                            rounded-lg
                            px-2
                            py-1
                            text-xs
                            font-medium
                            text-gray-500
                            transition
                            hover:bg-red-50
                            hover:text-red-600
                        "
                    >
                        Clear
                    </button>

                )}

            </div>

        );

    };


    // ============================================================
    // PAGINATION
    // ============================================================

    const renderPagination = () => {

        if (
            loading ||
            messages.length === 0
        ) {
            return null;
        }


        const totalPages =
            Number(
                pagination.pages
            ) || 1;


        return (

            <div
                className="
                    shrink-0
                    border-t
                    border-gray-200
                    bg-white
                    px-3
                    py-3
                    sm:px-4
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
                            rounded-lg
                            border
                            border-gray-200
                            px-3
                            py-2
                            text-xs
                            text-gray-700
                            transition
                            hover:bg-gray-50
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                            sm:text-sm
                        "
                    >
                        Previous
                    </button>


                    <div
                        className="
                            hidden
                            items-center
                            gap-1
                            sm:flex
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
                                                pageNumber ===
                                                page
                                            ) {
                                                return;
                                            }


                                            setSelectedMessage(
                                                null
                                            );

                                            setSelectedMessages(
                                                []
                                            );

                                            loadInbox(
                                                pageNumber
                                            );

                                        }}
                                        className={`
                                            h-8
                                            w-8
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


                    <span
                        className="
                            text-xs
                            text-gray-500
                            sm:hidden
                        "
                    >
                        {page} /{" "}
                        {totalPages}
                    </span>


                    <button
                        type="button"
                        onClick={
                            handleNextPage
                        }
                        disabled={
                            page >=
                            totalPages
                        }
                        className="
                            rounded-lg
                            border
                            border-gray-200
                            px-3
                            py-2
                            text-xs
                            text-gray-700
                            transition
                            hover:bg-gray-50
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                            sm:text-sm
                        "
                    >
                        Next
                    </button>

                </div>

            </div>

        );

    };


    // ============================================================
    // MESSAGE CARD
    // ============================================================

    const renderMessageCard = (
        message
    ) => {

        const checked =
            isSelected(
                message?._id
            );


        const unread =
            !message?.isRead;


        return (

            <div
                key={
                    message?._id
                }
                className={`
                    flex
                    w-full
                    items-start
                    gap-2
                    border-l-4
                    px-3
                    py-3
                    transition
                    sm:px-4
                    sm:py-4
                    ${
                        checked
                            ? "border-l-blue-500 bg-blue-50"
                            : "border-l-transparent hover:bg-gray-50"
                    }
                `}
            >

                {/* ==================================================
                    CHECKBOX
                ================================================== */}

                <div
                    className="
                        flex
                        shrink-0
                        items-center
                        justify-center
                        pt-2
                    "
                >

                    <input
                        type="checkbox"
                        checked={
                            checked
                        }
                        onChange={() =>
                            handleSelectCheckbox(
                                message?._id
                            )
                        }
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                        className="
                            h-4
                            w-4
                            cursor-pointer
                            rounded
                            border-gray-300
                            text-blue-600
                            focus:ring-2
                            focus:ring-blue-500
                        "
                    />

                </div>


                {/* ==================================================
                    MESSAGE
                ================================================== */}

                <button
                    type="button"
                    onClick={() =>
                        handleSelectMessage(
                            message
                        )
                    }
                    className="
                        min-w-0
                        flex-1
                        text-left
                        outline-none
                    "
                >

                    <div
                        className="
                            flex
                            min-w-0
                            items-start
                            gap-3
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
                                text-sm
                                font-semibold
                                sm:h-10
                                sm:w-10
                                ${
                                    unread
                                        ? "bg-indigo-100 text-indigo-600"
                                        : "bg-gray-100 text-gray-500"
                                }
                            `}
                        >
                            {getInitial(
                                message
                            )}
                        </div>


                        {/* CONTENT */}

                        <div
                            className="
                                min-w-0
                                flex-1
                            "
                        >

                            {/* TOP */}

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
                                        min-w-0
                                        flex-1
                                        truncate
                                        text-sm
                                        sm:text-base
                                        ${
                                            unread
                                                ? "font-bold text-gray-900"
                                                : "font-medium text-gray-800"
                                        }
                                    `}
                                >
                                    {
                                        getSenderName(
                                            message
                                        )
                                    }
                                </span>


                                <span
                                    className="
                                        shrink-0
                                        text-[10px]
                                        text-gray-400
                                        sm:text-xs
                                    "
                                >
                                    {
                                        formatDate(
                                            message?.sentAt ||
                                            message?.createdAt
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
                                    sm:text-base
                                    ${
                                        unread
                                            ? "font-semibold text-gray-900"
                                            : "font-medium text-gray-700"
                                    }
                                `}
                            >
                                {
                                    message?.subject ||
                                    "(No Subject)"
                                }
                            </div>


                            {/* PREVIEW */}

                            <div
                                className="
                                    mt-1
                                    line-clamp-2
                                    break-words
                                    text-xs
                                    text-gray-500
                                    sm:text-sm
                                "
                            >
                                {
                                    getPreview(
                                        message?.body
                                    )
                                }
                            </div>

                        </div>

                    </div>

                </button>

            </div>

        );

    };


    // ============================================================
    // FULL-SCREEN MESSAGE VIEW
    // ============================================================

    const renderMessageView = () => {

        return (

            <div
                className="
                    relative
                    flex
                    h-full
                    min-h-0
                    w-full
                    min-w-0
                    flex-1
                    overflow-hidden
                    bg-white
                "
            >

                {/* =================================================
                    LOADING OVERLAY
                ================================================== */}

                {messageLoading && (

                    <div
                        className="
                            absolute
                            inset-0
                            z-50
                            flex
                            items-center
                            justify-center
                            bg-white/60
                            backdrop-blur-[1px]
                        "
                    >

                        <div
                            className="
                                h-9
                                w-9
                                animate-spin
                                rounded-full
                                border-2
                                border-blue-600
                                border-t-transparent
                            "
                        />

                    </div>

                )}


                {/* =================================================
                    MESSAGE VIEWER
                ================================================== */}

                <div
                    className="
                        h-full
                        min-h-0
                        
                        min-w-10
                        flex-wrap
                        overflow-x
                    "
                >

                    <MessageViewer
                        message={
                            selectedMessage
                        }

                        onClose={
                            handleCloseMessage
                        }

                        onMessageDeleted={
                            handleDelete
                        }

                        onMessageUpdated={
                            handleMessageUpdated
                        }

                        showCloseButton={
                            true
                        }
                    />

                </div>


                {/* =================================================
                    ERROR
                ================================================== */}

                {messageError && (

                    <div
                        className="
                            absolute
                            bottom-4
                            left-4
                            right-4
                            z-[60]
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

            </div>

        );

    };


    // ============================================================
    // FULL-SCREEN INBOX VIEW
    // ============================================================

    const renderInbox = () => {

        return (

            <div
                className="
                    flex
                    h-full
                    min-h-0
                    w-full
                    min-w-0
                    flex-col
                    overflow-hidden
                    bg-white
                "
            >

                {/* =================================================
                    HEADER
                ================================================== */}

                <div
                    className="
                        flex
                        shrink-0
                        items-center
                        justify-between
                        gap-3
                        border-b
                        border-gray-200
                        bg-white
                        px-4
                        py-4
                        sm:px-5
                        lg:px-6
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
                                    font-semibold
                                    text-gray-800
                                    sm:text-xl
                                "
                            >
                                Inbox
                            </h1>


                            {unreadCount > 0 && (

                                <span
                                    className="
                                        flex
                                        h-6
                                        min-w-6
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-blue-600
                                        px-2
                                        text-xs
                                        font-bold
                                        text-white
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
                                text-gray-500
                                sm:text-sm
                            "
                        >
                            {pagination.total} messages
                        </p>

                    </div>


                    {/* REFRESH */}

                    <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            loading ||
                            refreshing
                        }
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-gray-200
                            text-lg
                            text-gray-600
                            transition
                            hover:bg-gray-50
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            sm:h-10
                            sm:w-10
                        "
                        title="Refresh inbox"
                    >
                        {refreshing
                            ? "..."
                            : "↻"}
                    </button>

                </div>


                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div
                        className="
                            mx-4
                            mt-3
                            shrink-0
                            rounded-lg
                            border
                            border-red-200
                            bg-red-50
                            p-3
                            text-xs
                            text-red-600
                            sm:mx-5
                            sm:text-sm
                            lg:mx-6
                        "
                    >
                        {error}
                    </div>

                )}


                {/* =================================================
                    TOOLBAR
                ================================================== */}

                {renderSelectionToolbar()}


                {/* =================================================
                    LIST
                ================================================== */}

                <div
                    className="
                        min-h-0
                        min-w-0
                        flex-1
                        overflow-x
                        overflow-y
                    "
                >

                    {loading ? (

                        renderSkeletons()

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


                {/* =================================================
                    PAGINATION
                ================================================== */}

                {renderPagination()}

            </div>

        );

    };


    // ============================================================
    // IMPORTANT MAIN RETURN
    //
    // NEVER use:
    //
    // lg:grid
    // grid-cols-[...]
    //
    // here.
    //
    // Only one view is mounted at a time.
    // ============================================================

    return (

        <div
            className="
                h-full
                min-h-0
                w-full
                min-w-10
                overflow-hidden
                bg-white
            "
        >

            {selectedMessage
                ? renderMessageView()
                : renderInbox()}

        </div>

    );

};


export default Inbox;