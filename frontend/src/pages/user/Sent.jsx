import { useCallback, useEffect, useState } from "react";

import {
    getMessagesApi,
    moveMessageToTrashApi
} from "../../api/messageApi";

const Sent = () => {
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

    const loadSent = useCallback(async (currentPage = 1, showRefresh = false) => {
        try {
            setError("");

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await getMessagesApi({
                folder: "sent",
                page: currentPage,
                limit: 20
            });

            if (!response.success) {
                throw new Error(response.message || "Unable to load sent messages.");
            }

            setMessages(response.messages || response.data || []);

            if (response.pagination) {
                setPagination(response.pagination);
            }

            setPage(currentPage);
        } catch (err) {
            console.error("Sent loading error:", err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load sent messages."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadSent(1);
    }, [loadSent]);

    const handleTrash = async (messageId) => {
        try {
            setError("");

            const response = await moveMessageToTrashApi(messageId);

            if (response && response.success === false) {
                throw new Error(response.message || "Unable to move message to trash.");
            }

            setMessages((previous) =>
                previous.filter((message) => message._id !== messageId)
            );

            setPagination((previous) => ({
                ...previous,
                total: Math.max((previous.total || 0) - 1, 0)
            }));
        } catch (err) {
            console.error("Move sent message to trash error:", err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to move message to trash."
            );
        }
    };

    const formatDate = (date) => {
        if (!date) return "";

        const value = new Date(date);
        if (Number.isNaN(value.getTime())) return "";

        const now = new Date();

        if (value.toDateString() === now.toDateString()) {
            return value.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });
        }

        return value.toLocaleDateString([], {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getRecipients = (message) => {
        const recipients = [
            ...(message.to || []),
            ...(message.cc || []),
            ...(message.bcc || [])
        ];

        if (!recipients.length) return "No recipients";

        return recipients
            .map((recipient) => {
                if (typeof recipient === "string") return recipient;
                return recipient?.name || recipient?.email || "Unknown";
            })
            .join(", ");
    };

    const getPreview = (body) => {
        if (!body) return "No message content";

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
                        {[1, 2, 3, 4, 5].map((item) => (
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
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Sent</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Messages you have sent
                            {pagination.total > 0 && ` · ${pagination.total} messages`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadSent(page, true)}
                        disabled={refreshing}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        {refreshing ? "Refreshing..." : "↻ Refresh"}
                    </button>
                </div>

                {error && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => loadSent(page)}
                            className="font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    {messages.length === 0 ? (
                        <div className="flex min-h-[400px] items-center justify-center">
                            <div className="text-center">
                                <div className="mb-4 text-6xl">📤</div>
                                <h2 className="font-semibold text-gray-700">
                                    No sent messages
                                </h2>
                                <p className="mt-1 text-sm text-gray-400">
                                    Messages you send will appear here.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {messages.map((message) => (
                                <div
                                    key={message._id}
                                    className="group border-b border-gray-100 px-4 py-4 transition hover:bg-gray-50 md:px-5"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700 sm:flex">
                                            {(getRecipients(message).charAt(0) || "T").toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-gray-800">
                                                        To: {getRecipients(message)}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-400">
                                                        {formatDate(message.sentAt || message.createdAt)}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    title="Move to trash"
                                                    onClick={() => handleTrash(message._id)}
                                                    className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    🗑️
                                                </button>
                                            </div>

                                            <p className="mt-2 truncate text-sm font-semibold text-gray-800">
                                                {message.subject || "(No subject)"}
                                            </p>

                                            <p className="mt-1 truncate text-xs text-gray-400">
                                                {getPreview(message.body)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {pagination.pages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => loadSent(page - 1)}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            ← Previous
                        </button>

                        <span className="text-sm text-gray-500">
                            Page {page} of {pagination.pages}
                        </span>

                        <button
                            type="button"
                            disabled={page >= pagination.pages}
                            onClick={() => loadSent(page + 1)}
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

export default Sent;
