import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import MessageViewer from "../../components/mail/MessageViewer";

import {
    getTrashApi,
    restoreMessageApi,
    permanentlyDeleteMessageApi,
} from "../../api/messageApi";


const Trash = () => {

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

    const [actionLoading, setActionLoading] =
        useState(false);


    // ============================================================
    // LOAD TRASH
    // ============================================================

    const loadTrash = useCallback(
        async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await getTrashApi();

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

                // ------------------------------------------------
                // Keep selected message updated
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
                    "Trash error:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load trash."
                );

                setMessages([]);

            } finally {

                setLoading(false);
            }

        },
        [selectedMessage?._id]
    );


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadTrash();

    }, [loadTrash]);


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
    // RESTORE MESSAGE
    // ============================================================

    const handleRestore = async (
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

            await restoreMessageApi(
                messageId
            );

            // Remove from trash
            setMessages((prev) =>
                prev.filter(
                    (item) =>
                        item._id !==
                        messageId
                )
            );

            // Close viewer
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
                "Restore error:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Unable to restore message."
            );

        } finally {

            setActionLoading(false);
        }
    };


    // ============================================================
    // PERMANENT DELETE
    // ============================================================

    const handlePermanentDelete = async (
        messageId
    ) => {

        if (
            !messageId ||
            actionLoading
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to permanently delete this message?\n\nThis action cannot be undone."
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(true);

            await permanentlyDeleteMessageApi(
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
                "Permanent delete error:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Unable to permanently delete message."
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
    // SENDER TEXT
    // ============================================================

    const getSenderText = (
        message
    ) => {

        if (!message?.sender) {
            return "Unknown sender";
        }

        if (
            typeof message.sender ===
            "string"
        ) {
            return message.sender;
        }

        return (
            message.sender.name ||
            message.sender.email ||
            message.sender.employeeId ||
            "Unknown sender"
        );
    };


    // ============================================================
    // SENDER INITIAL
    // ============================================================

    const getSenderInitial = (
        message
    ) => {

        const sender =
            getSenderText(
                message
            );

        return (
            sender
                ?.charAt(0)
                ?.toUpperCase() ||
            "?"
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
            loadTrash();
        }
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
                            MOBILE HEADER
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
                                    Trash
                                </h1>

                                <p
                                    className="
                                        text-xs
                                        sm:text-sm
                                        text-gray-500
                                        mt-0.5
                                    "
                                >
                                    {messages.length}{" "}
                                    {messages.length === 1
                                        ? "deleted message"
                                        : "deleted messages"}
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
                                title="Refresh trash"
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
                                                bg-gray-100
                                                flex
                                                items-center
                                                justify-center
                                                text-3xl
                                            "
                                        >
                                            🗑️
                                        </div>

                                        <p
                                            className="
                                                font-semibold
                                                text-gray-700
                                            "
                                        >
                                            Trash is empty
                                        </p>

                                        <p
                                            className="
                                                text-sm
                                                mt-1
                                                text-gray-500
                                            "
                                        >
                                            Deleted messages
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

                                                    {/* SENDER AVATAR */}

                                                    <div
                                                        className="
                                                            shrink-0
                                                            w-9
                                                            h-9
                                                            sm:w-10
                                                            sm:h-10
                                                            rounded-full
                                                            bg-gray-200
                                                            text-gray-600
                                                            flex
                                                            items-center
                                                            justify-center
                                                            font-semibold
                                                            text-sm
                                                        "
                                                    >
                                                        {getSenderInitial(
                                                            message
                                                        )}
                                                    </div>


                                                    {/* MESSAGE CONTENT */}

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
                                                                    bg-gray-100
                                                                    text-gray-600
                                                                    font-medium
                                                                "
                                                            >
                                                                Deleted
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
                                                            From:{" "}
                                                            {getSenderText(
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
                            folder="trash"
                            onClose={() =>
                                setSelectedMessage(
                                    null
                                )
                            }
                            onRefresh={
                                loadTrash
                            }
                            onRestore={
                                handleRestore
                            }
                            onPermanentDelete={
                                handlePermanentDelete
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
                    LEFT MESSAGE LIST
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
                                    Trash
                                </h1>

                                <p
                                    className="
                                        text-xs
                                        xl:text-sm
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    {messages.length}{" "}
                                    {messages.length === 1
                                        ? "deleted message"
                                        : "deleted messages"}
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
                                            bg-gray-100
                                            flex
                                            items-center
                                            justify-center
                                            text-3xl
                                        "
                                    >
                                        🗑️
                                    </div>

                                    <p
                                        className="
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        Trash is empty
                                    </p>

                                    <p
                                        className="
                                            text-sm
                                            mt-1
                                        "
                                    >
                                        No deleted messages
                                        available.
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

                                                    {/* AVATAR */}

                                                    <div
                                                        className="
                                                            shrink-0
                                                            w-9
                                                            h-9
                                                            rounded-full
                                                            bg-gray-200
                                                            text-gray-600
                                                            flex
                                                            items-center
                                                            justify-center
                                                            font-semibold
                                                            text-sm
                                                        "
                                                    >
                                                        {getSenderInitial(
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
                                                                    bg-gray-100
                                                                    text-gray-600
                                                                    font-medium
                                                                "
                                                            >
                                                                Deleted
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
                                                            From:{" "}
                                                            {getSenderText(
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
                            folder="trash"
                            onClose={() =>
                                setSelectedMessage(
                                    null
                                )
                            }
                            onRefresh={
                                loadTrash
                            }
                            onRestore={
                                handleRestore
                            }
                            onPermanentDelete={
                                handlePermanentDelete
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
                                    🗑️
                                </div>

                                <h2
                                    className="
                                        text-lg
                                        font-semibold
                                        text-gray-700
                                    "
                                >
                                    Select a message
                                </h2>

                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                        mt-2
                                    "
                                >
                                    Select a deleted message
                                    from the list to view,
                                    restore, or permanently
                                    delete it.
                                </p>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};


export default Trash;