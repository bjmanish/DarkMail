import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import MessageViewer from "../../components/mail/MessageViewer";

import {
    getMessagesApi,
    moveMessageToTrashApi,
} from "../../api/messageApi";


const LIMIT = 20;


const Sent = () => {

    // ============================================================
    // STATE
    // ============================================================

    const [messages, setMessages] =
        useState([]);

    const [selectedMessage, setSelectedMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [totalPages, setTotalPages] =
        useState(1);

    const [actionLoading, setActionLoading] =
        useState(false);


    // ============================================================
    // LOAD SENT MESSAGES
    // ============================================================

    const loadMessages = useCallback(
        async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await getMessagesApi({
                        folder: "sent",
                        page,
                        limit: LIMIT,
                    });

                const list =
                    response?.messages ||
                    response?.data ||
                    [];

                const safeList =
                    Array.isArray(list)
                        ? list
                        : [];

                setMessages(
                    safeList
                );

                setTotalPages(
                    Math.max(
                        1,
                        Number(
                            response?.pages
                        ) ||
                        Number(
                            response?.totalPages
                        ) ||
                        1
                    )
                );

                // ------------------------------------------------
                // Keep selected message after refresh
                // ------------------------------------------------

                if (
                    selectedMessage?._id
                ) {

                    const updated =
                        safeList.find(
                            (item) =>
                                item._id ===
                                selectedMessage._id
                        );

                    setSelectedMessage(
                        updated || null
                    );
                }

            } catch (err) {

                console.error(
                    "Sent messages error:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load sent messages."
                );

                setMessages([]);

            } finally {

                setLoading(false);
            }

        },
        [
            page,
            selectedMessage?._id,
        ]
    );


    // ============================================================
    // INITIAL / PAGE LOAD
    // ============================================================

    useEffect(() => {

        loadMessages();

    }, [loadMessages]);


    // ============================================================
    // SELECT MESSAGE
    // ============================================================

    const handleSelectMessage = (
        message
    ) => {

        setSelectedMessage(
            message
        );
    };


    // ============================================================
    // MOVE SENT MESSAGE TO TRASH
    // ============================================================

    const handleDelete = async (
        messageId
    ) => {

        if (
            !messageId ||
            actionLoading
        ) {
            return;
        }

        try {

            setActionLoading(true);

            await moveMessageToTrashApi(
                messageId
            );

            setMessages((prev) =>
                prev.filter(
                    (item) =>
                        item._id !==
                        messageId
                )
            );

            if (
                selectedMessage?._id ===
                messageId
            ) {

                setSelectedMessage(
                    null
                );
            }

        } catch (err) {

            console.error(
                "Move sent message to trash:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Unable to move message to trash."
            );

        } finally {

            setActionLoading(false);
        }
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
    // RECIPIENT TEXT
    // ============================================================

    const getRecipientText = (
        message
    ) => {

        if (!message?.to) {
            return "No recipient";
        }

        if (
            Array.isArray(
                message.to
            )
        ) {

            const recipients =
                message.to
                    .map((recipient) => {

                        if (
                            typeof recipient ===
                            "string"
                        ) {
                            return recipient;
                        }

                        return (
                            recipient?.name ||
                            recipient?.email ||
                            recipient?.employeeId ||
                            ""
                        );
                    })
                    .filter(Boolean);

            if (
                recipients.length === 0
            ) {
                return "No recipient";
            }

            return recipients.join(", ");
        }

        return (
            message.to?.name ||
            message.to?.email ||
            "No recipient"
        );
    };


    // ============================================================
    // MESSAGE PREVIEW
    // ============================================================

    const getMessagePreview = (
        message
    ) => {

        if (!message?.body) {
            return "No message content";
        }

        return String(
            message.body
        )
            .replace(
                /<[^>]*>/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim() ||
            "No message content";
    };


    // ============================================================
    // REFRESH
    // ============================================================

    const handleRefresh = () => {

        if (!loading) {
            loadMessages();
        }
    };


    // ============================================================
    // PREVIOUS PAGE
    // ============================================================

    const handlePreviousPage = () => {

        setPage((value) =>
            Math.max(
                1,
                value - 1
            )
        );

        setSelectedMessage(
            null
        );
    };


    // ============================================================
    // NEXT PAGE
    // ============================================================

    const handleNextPage = () => {

        setPage((value) =>
            Math.min(
                totalPages,
                value + 1
            )
        );

        setSelectedMessage(
            null
        );
    };


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div
            className="
                w-full
                h-full
                min-h-0
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
                            HEADER
                        =========================================== */}

                        <div
                            className="
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
                                shrink-0
                            "
                        >

                            <div
                                className="
                                    min-w-0
                                "
                            >

                                <h1
                                    className="
                                        text-lg
                                        sm:text-xl
                                        font-semibold
                                        text-gray-800
                                        truncate
                                    "
                                >
                                    Sent
                                </h1>

                                <p
                                    className="
                                        text-xs
                                        sm:text-sm
                                        text-gray-500
                                        mt-0.5
                                    "
                                >
                                    Messages you have sent
                                </p>

                            </div>


                            {/* REFRESH */}

                            <button
                                type="button"
                                onClick={
                                    handleRefresh
                                }
                                disabled={loading}
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
                                title="Refresh sent messages"
                            >
                                ↻
                            </button>

                        </div>


                        {/* ==========================================
                            ERROR
                        =========================================== */}

                        {error && (

                            <div
                                className="
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
                                    shrink-0
                                "
                            >
                                {error}
                            </div>

                        )}


                        {/* ==========================================
                            CONTENT
                        =========================================== */}

                        <div
                            className="
                                flex-1
                                min-h-0
                                overflow-y-auto
                                overscroll-contain
                            "
                        >

                            {/* LOADING */}

                            {loading ? (

                                <div
                                    className="
                                        p-3
                                        sm:p-4
                                        space-y-3
                                    "
                                >

                                    {[
                                        1,
                                        2,
                                        3,
                                        4,
                                        5,
                                    ].map(
                                        (item) => (

                                            <div
                                                key={item}
                                                className="
                                                    p-3
                                                    sm:p-4
                                                    rounded-xl
                                                    border
                                                    border-gray-100
                                                    animate-pulse
                                                "
                                            >

                                                <div
                                                    className="
                                                        h-4
                                                        bg-gray-200
                                                        rounded
                                                        w-2/3
                                                        mb-3
                                                    "
                                                />

                                                <div
                                                    className="
                                                        h-3
                                                        bg-gray-200
                                                        rounded
                                                        w-1/2
                                                        mb-3
                                                    "
                                                />

                                                <div
                                                    className="
                                                        h-3
                                                        bg-gray-200
                                                        rounded
                                                        w-full
                                                        mb-2
                                                    "
                                                />

                                                <div
                                                    className="
                                                        h-3
                                                        bg-gray-200
                                                        rounded
                                                        w-4/5
                                                    "
                                                />

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : messages.length === 0 ? (

                                /* EMPTY */

                                <div
                                    className="
                                        min-h-full
                                        flex
                                        items-center
                                        justify-center
                                        px-6
                                        py-12
                                        text-gray-500
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
                                            ✈️
                                        </div>

                                        <p
                                            className="
                                                font-semibold
                                                text-gray-700
                                            "
                                        >
                                            No sent messages
                                        </p>

                                        <p
                                            className="
                                                text-sm
                                                mt-1
                                                text-gray-500
                                            "
                                        >
                                            Messages you send
                                            will appear here.
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                /* MESSAGE LIST */

                                <div
                                    className="
                                        divide-y
                                        divide-gray-100
                                    "
                                >

                                    {messages.map(
                                        (message) => (

                                            <button
                                                type="button"
                                                key={
                                                    message._id
                                                }
                                                onClick={() =>
                                                    handleSelectMessage(
                                                        message
                                                    )
                                                }
                                                className="
                                                    w-full
                                                    text-left
                                                    px-3
                                                    sm:px-4
                                                    py-3
                                                    sm:py-4
                                                    hover:bg-gray-50
                                                    active:bg-gray-100
                                                    transition
                                                    focus:outline-none
                                                    focus:bg-blue-50
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-start
                                                        gap-3
                                                    "
                                                >

                                                    {/* ICON */}

                                                    <div
                                                        className="
                                                            shrink-0
                                                            w-9
                                                            h-9
                                                            sm:w-10
                                                            sm:h-10
                                                            rounded-full
                                                            bg-blue-100
                                                            text-blue-600
                                                            flex
                                                            items-center
                                                            justify-center
                                                            font-semibold
                                                            text-sm
                                                        "
                                                    >
                                                        ↑
                                                    </div>


                                                    {/* CONTENT */}

                                                    <div
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                        "
                                                    >

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
                                                                Sent
                                                            </span>

                                                            <span
                                                                className="
                                                                    min-w-0
                                                                    font-medium
                                                                    text-gray-800
                                                                    truncate
                                                                    text-sm
                                                                    sm:text-base
                                                                "
                                                            >
                                                                {message.subject ||
                                                                    "(No Subject)"}
                                                            </span>

                                                        </div>


                                                        <div
                                                            className="
                                                                text-xs
                                                                sm:text-sm
                                                                text-gray-500
                                                                mt-1
                                                                truncate
                                                            "
                                                        >
                                                            To:{" "}
                                                            {getRecipientText(
                                                                message
                                                            )}
                                                        </div>


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
                                                            {getMessagePreview(
                                                                message
                                                            )}
                                                        </div>


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

                                        )
                                    )}

                                </div>

                            )}

                        </div>


                        {/* ==========================================
                            MOBILE PAGINATION
                        =========================================== */}

                        {!loading &&
                            messages.length > 0 && (

                                <div
                                    className="
                                        shrink-0
                                        border-t
                                        border-gray-200
                                        px-3
                                        sm:px-4
                                        py-2.5
                                        sm:py-3
                                        flex
                                        items-center
                                        justify-between
                                        gap-2
                                        bg-white
                                    "
                                >

                                    <button
                                        type="button"
                                        disabled={
                                            page <= 1
                                        }
                                        onClick={
                                            handlePreviousPage
                                        }
                                        className="
                                            px-3
                                            sm:px-4
                                            py-2
                                            text-xs
                                            sm:text-sm
                                            rounded-lg
                                            border
                                            border-gray-200
                                            text-gray-700
                                            hover:bg-gray-50
                                            disabled:opacity-40
                                            disabled:cursor-not-allowed
                                            transition
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
                                        {totalPages}
                                    </span>


                                    <button
                                        type="button"
                                        disabled={
                                            page >=
                                            totalPages
                                        }
                                        onClick={
                                            handleNextPage
                                        }
                                        className="
                                            px-3
                                            sm:px-4
                                            py-2
                                            text-xs
                                            sm:text-sm
                                            rounded-lg
                                            border
                                            border-gray-200
                                            text-gray-700
                                            hover:bg-gray-50
                                            disabled:opacity-40
                                            disabled:cursor-not-allowed
                                            transition
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
                        "
                    >

                        <MessageViewer
                            message={
                                selectedMessage
                            }
                            folder="sent"
                            onClose={() =>
                                setSelectedMessage(
                                    null
                                )
                            }
                            onRefresh={
                                loadMessages
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
                    h-full
                    min-h-0
                    grid-cols-[minmax(300px,360px)_minmax(0,1fr)]
                    xl:grid-cols-[380px_minmax(0,1fr)]
                    2xl:grid-cols-[420px_minmax(0,1fr)]
                "
            >

                {/* =================================================
                    LEFT SENT LIST
                ================================================== */}

                <div
                    className="
                        border-r
                        border-gray-200
                        flex
                        flex-col
                        min-w-0
                        min-h-0
                        bg-white
                    "
                >

                    {/* HEADER */}

                    <div
                        className="
                            px-4
                            xl:px-5
                            py-4
                            border-b
                            border-gray-200
                            shrink-0
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

                                <h1
                                    className="
                                        text-lg
                                        xl:text-xl
                                        font-semibold
                                        text-gray-800
                                        truncate
                                    "
                                >
                                    Sent
                                </h1>

                                <p
                                    className="
                                        text-xs
                                        xl:text-sm
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Messages you have sent
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleRefresh
                                }
                                disabled={loading}
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
                                    transition
                                    disabled:opacity-50
                                "
                                title="Refresh"
                            >
                                ↻
                            </button>

                        </div>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div
                            className="
                                m-3
                                p-3
                                rounded-lg
                                border
                                border-red-200
                                bg-red-50
                                text-red-600
                                text-sm
                                shrink-0
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
                            overscroll-contain
                        "
                    >

                        {loading ? (

                            <div
                                className="
                                    p-4
                                    space-y-3
                                "
                            >

                                {[
                                    1,
                                    2,
                                    3,
                                    4,
                                    5,
                                    6,
                                ].map(
                                    (item) => (

                                        <div
                                            key={item}
                                            className="
                                                animate-pulse
                                                p-3
                                                rounded-lg
                                            "
                                        >

                                            <div
                                                className="
                                                    h-4
                                                    bg-gray-200
                                                    rounded
                                                    w-1/2
                                                    mb-2
                                                "
                                            />

                                            <div
                                                className="
                                                    h-3
                                                    bg-gray-200
                                                    rounded
                                                    w-3/4
                                                    mb-2
                                                "
                                            />

                                            <div
                                                className="
                                                    h-3
                                                    bg-gray-200
                                                    rounded
                                                    w-full
                                                "
                                            />

                                        </div>

                                    )
                                )}

                            </div>

                        ) : messages.length === 0 ? (

                            <div
                                className="
                                    h-full
                                    min-h-[250px]
                                    flex
                                    items-center
                                    justify-center
                                    px-6
                                "
                            >

                                <div
                                    className="
                                        text-center
                                        text-gray-500
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
                                        ✈️
                                    </div>

                                    <p
                                        className="
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        No sent messages
                                    </p>

                                    <p
                                        className="
                                            text-sm
                                            mt-1
                                        "
                                    >
                                        No messages have
                                        been sent yet.
                                    </p>

                                </div>

                            </div>

                        ) : (

                            <div
                                className="
                                    divide-y
                                    divide-gray-100
                                "
                            >

                                {messages.map(
                                    (message) => {

                                        const isSelected =
                                            selectedMessage?._id ===
                                            message._id;

                                        return (

                                            <button
                                                type="button"
                                                key={
                                                    message._id
                                                }
                                                onClick={() =>
                                                    handleSelectMessage(
                                                        message
                                                    )
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
                                                    ${
                                                        isSelected
                                                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                                                            : "hover:bg-gray-50 border-l-4 border-l-transparent"
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

                                                    {/* ICON */}

                                                    <div
                                                        className="
                                                            shrink-0
                                                            w-9
                                                            h-9
                                                            rounded-full
                                                            bg-blue-100
                                                            text-blue-600
                                                            flex
                                                            items-center
                                                            justify-center
                                                            font-semibold
                                                            text-sm
                                                        "
                                                    >
                                                        ↑
                                                    </div>


                                                    {/* CONTENT */}

                                                    <div
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                        "
                                                    >

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
                                                                    px-2
                                                                    py-0.5
                                                                    text-xs
                                                                    rounded
                                                                    bg-blue-100
                                                                    text-blue-600
                                                                    font-medium
                                                                "
                                                            >
                                                                Sent
                                                            </span>

                                                            <span
                                                                className="
                                                                    font-medium
                                                                    text-gray-800
                                                                    truncate
                                                                    text-sm
                                                                "
                                                            >
                                                                {message.subject ||
                                                                    "(No Subject)"}
                                                            </span>

                                                        </div>


                                                        <div
                                                            className="
                                                                text-xs
                                                                text-gray-500
                                                                mt-1
                                                                truncate
                                                            "
                                                        >
                                                            To:{" "}
                                                            {getRecipientText(
                                                                message
                                                            )}
                                                        </div>


                                                        <div
                                                            className="
                                                                text-xs
                                                                text-gray-500
                                                                mt-1.5
                                                                line-clamp-2
                                                                break-words
                                                            "
                                                        >
                                                            {getMessagePreview(
                                                                message
                                                            )}
                                                        </div>


                                                        <div
                                                            className="
                                                                text-[11px]
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
                                    }
                                )}

                            </div>

                        )}

                    </div>


                    {/* DESKTOP PAGINATION */}

                    {!loading &&
                        messages.length > 0 && (

                            <div
                                className="
                                    shrink-0
                                    border-t
                                    border-gray-200
                                    px-3
                                    xl:px-4
                                    py-3
                                    flex
                                    items-center
                                    justify-between
                                    gap-2
                                    bg-white
                                "
                            >

                                <button
                                    type="button"
                                    disabled={
                                        page <= 1
                                    }
                                    onClick={
                                        handlePreviousPage
                                    }
                                    className="
                                        px-3
                                        py-2
                                        text-sm
                                        rounded-lg
                                        border
                                        border-gray-200
                                        text-gray-700
                                        hover:bg-gray-50
                                        disabled:opacity-40
                                        disabled:cursor-not-allowed
                                        transition
                                    "
                                >
                                    Previous
                                </button>


                                <span
                                    className="
                                        text-xs
                                        text-gray-500
                                        whitespace-nowrap
                                    "
                                >
                                    {page} /{" "}
                                    {totalPages}
                                </span>


                                <button
                                    type="button"
                                    disabled={
                                        page >=
                                        totalPages
                                    }
                                    onClick={
                                        handleNextPage
                                    }
                                    className="
                                        px-3
                                        py-2
                                        text-sm
                                        rounded-lg
                                        border
                                        border-gray-200
                                        text-gray-700
                                        hover:bg-gray-50
                                        disabled:opacity-40
                                        disabled:cursor-not-allowed
                                        transition
                                    "
                                >
                                    Next
                                </button>

                            </div>

                        )}

                </div>


                {/* =================================================
                    RIGHT MESSAGE VIEWER
                ================================================== */}

                <div
                    className="
                        min-w-0
                        min-h-0
                        h-full
                        overflow-hidden
                        bg-gray-50
                    "
                >

                    {selectedMessage ? (

                        <MessageViewer
                            message={
                                selectedMessage
                            }
                            folder="sent"
                            onClose={() =>
                                setSelectedMessage(
                                    null
                                )
                            }
                            onRefresh={
                                loadMessages
                            }
                            onDelete={
                                handleDelete
                            }
                        />

                    ) : (

                        <div
                            className="
                                h-full
                                flex
                                items-center
                                justify-center
                                px-6
                            "
                        >

                            <div
                                className="
                                    text-center
                                    max-w-sm
                                "
                            >

                                <div
                                    className="
                                        w-20
                                        h-20
                                        mx-auto
                                        mb-5
                                        rounded-full
                                        bg-white
                                        shadow-sm
                                        flex
                                        items-center
                                        justify-center
                                        text-4xl
                                    "
                                >
                                    ✈️
                                </div>

                                <h2
                                    className="
                                        text-lg
                                        font-semibold
                                        text-gray-700
                                    "
                                >
                                    Select a sent message
                                </h2>

                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                        mt-2
                                    "
                                >
                                    Select a message from
                                    the list to view its
                                    complete contents.
                                </p>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};


export default Sent;