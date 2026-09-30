import { useCallback, useEffect, useState } from "react";

import {
    getMessagesApi,
    markMessageAsReadApi,
    moveMessageToTrashApi
} from "../../api/messageApi";

const Inbox = () => {

    const [messages, setMessages] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
    });

    const loadInbox = useCallback(async (
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

            const response = await getMessagesApi({
                folder: "inbox",
                page: currentPage,
                limit: 20
            });

            console.log(
                "Inbox response:",
                response
            );

            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Unable to load inbox"
                );
            }

            setMessages(
                response.messages || []
            );

            if (response.pagination) {

                setPagination(
                    response.pagination
                );

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

    }, []);

    useEffect(() => {

        loadInbox(1);

    }, [loadInbox]);

    const handleRefresh = () => {

        loadInbox(
            page,
            true
        );

    };

    const handleMarkRead = async (message) => {

        if (isRead(message)) {
            return;
        }

        try {

            await markMessageAsReadApi(
                message._id
            );

            setMessages((previous) =>
                previous.map((item) => {

                    if (item._id !== message._id) {
                        return item;
                    }

                    return {
                        ...item,
                        readBy: [
                            ...(item.readBy || []),
                            message.currentUserId
                        ]
                    };

                })
            );

        } catch (error) {

            console.error(
                "Mark read error:",
                error
            );

        }

    };

    const handleTrash = async (messageId) => {

        try {

            await moveMessageToTrashApi(
                messageId
            );

            setMessages((previous) =>
                previous.filter(
                    (message) =>
                        message._id !== messageId
                )
            );

        } catch (error) {

            console.error(
                "Move to trash error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                "Unable to move message to trash."
            );

        }

    };

    const isRead = (message) => {

        /*
         * Backend may provide `isRead`.
         * If not, fall back to `readBy`.
         */

        if (
            typeof message.isRead === "boolean"
        ) {
            return message.isRead;
        }

        return false;
    };

    const getSenderName = (message) => {

        if (!message.sender) {
            return "Unknown sender";
        }

        if (
            typeof message.sender === "object"
        ) {
            return (
                message.sender.name ||
                message.sender.email ||
                "Unknown sender"
            );
        }

        return "Unknown sender";
    };

    const getSenderEmail = (message) => {

        if (
            message.sender &&
            typeof message.sender === "object"
        ) {
            return message.sender.email || "";
        }

        return "";
    };

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
                    minute: "2-digit"
                }
            );
        }

        return messageDate.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

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

    if (loading) {

        return (
            <div className="h-full p-4 md:p-6">

                <div className="mx-auto max-w-7xl">

                    <div className="mb-5">

                        <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />

                        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200" />

                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

                        {[1, 2, 3, 4, 5].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="flex gap-4 border-b border-gray-100 p-5"
                                >
                                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />

                                    <div className="flex-1">

                                        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />

                                        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </div>

            </div>
        );
    }

    return (
        <div className="h-full p-4 md:p-6">

            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-5 flex items-center justify-between gap-4">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-900">
                            Inbox
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Your received messages
                            {pagination.total > 0 &&
                                ` · ${pagination.total} messages`
                            }
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
                            : "↻ Refresh"
                        }
                    </button>

                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                        <span>
                            {error}
                        </span>

                        <button
                            onClick={() =>
                                loadInbox(page)
                            }
                            className="font-semibold underline"
                        >
                            Retry
                        </button>

                    </div>
                )}

                {/* Messages */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    {messages.length === 0 ? (

                        <div className="flex min-h-[400px] items-center justify-center">

                            <div className="text-center">

                                <div className="mb-4 text-6xl">
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

                            {messages.map((message) => {

                                const read =
                                    isRead(message);

                                return (
                                    <div
                                        key={message._id}
                                        className={`group flex items-center gap-3 border-b border-gray-100 px-4 py-4 transition hover:bg-blue-50 md:px-5 ${
                                            !read
                                                ? "bg-blue-50/40"
                                                : "bg-white"
                                        }`}
                                    >

                                        {/* Avatar */}
                                        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 sm:flex">

                                            {getSenderName(
                                                message
                                            )
                                                .charAt(0)
                                                .toUpperCase()}

                                        </div>

                                        {/* Message */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMarkRead(
                                                    message
                                                )
                                            }
                                            className="min-w-0 flex-1 text-left"
                                        >

                                            <div className="flex items-center justify-between gap-3">

                                                <div className="min-w-0">

                                                    <p
                                                        className={`truncate text-sm ${
                                                            !read
                                                                ? "font-bold text-gray-900"
                                                                : "font-medium text-gray-700"
                                                        }`}
                                                    >
                                                        {getSenderName(
                                                            message
                                                        )}
                                                    </p>

                                                    <p className="truncate text-xs text-gray-400">
                                                        {getSenderEmail(
                                                            message
                                                        )}
                                                    </p>

                                                </div>

                                                <span className="shrink-0 text-xs text-gray-400">
                                                    {formatDate(
                                                        message.sentAt ||
                                                        message.createdAt
                                                    )}
                                                </span>

                                            </div>

                                            <p
                                                className={`mt-2 truncate text-sm ${
                                                    !read
                                                        ? "font-semibold text-gray-900"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {message.subject ||
                                                    "(No subject)"}
                                            </p>

                                            <p className="mt-1 truncate text-xs text-gray-400">
                                                {getPreview(
                                                    message.body
                                                )}
                                            </p>

                                        </button>

                                        {/* Actions */}
                                        <div className="hidden shrink-0 items-center gap-1 group-hover:flex sm:flex">

                                            <button
                                                type="button"
                                                title="Move to trash"
                                                onClick={() =>
                                                    handleTrash(
                                                        message._id
                                                    )
                                                }
                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                            >
                                                🗑️
                                            </button>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    )}

                </div>

                {/* Pagination */}
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
                            Page {page} of {pagination.pages}
                        </span>

                        <button
                            type="button"
                            disabled={
                                page >= pagination.pages
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