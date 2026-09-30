import { useCallback, useEffect, useState } from "react";

import {
    getTrashApi,
    restoreMessageApi,
    permanentlyDeleteMessageApi
} from "../../api/messageApi";

const Trash = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [actionId, setActionId] = useState(null);

    const loadTrash = useCallback(async (showRefresh = false) => {
        try {
            setError("");

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await getTrashApi();

            if (!response.success) {
                throw new Error(response.message || "Unable to load trash.");
            }

            setMessages(response.data || response.messages || []);
        } catch (err) {
            console.error("Trash loading error:", err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load trash."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadTrash();
    }, [loadTrash]);

    const handleRestore = async (messageId) => {
        try {
            setActionId(messageId);
            setError("");

            const response = await restoreMessageApi(messageId);

            if (response && response.success === false) {
                throw new Error(response.message || "Unable to restore message.");
            }

            setMessages((previous) =>
                previous.filter((message) => message._id !== messageId)
            );
        } catch (err) {
            console.error("Restore message error:", err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to restore message."
            );
        } finally {
            setActionId(null);
        }
    };

    const handlePermanentDelete = async (messageId) => {
        const confirmed = window.confirm(
            "Permanently delete this message from your trash?"
        );

        if (!confirmed) return;

        try {
            setActionId(messageId);
            setError("");

            const response = await permanentlyDeleteMessageApi(messageId);

            if (response && response.success === false) {
                throw new Error(response.message || "Unable to permanently delete message.");
            }

            setMessages((previous) =>
                previous.filter((message) => message._id !== messageId)
            );
        } catch (err) {
            console.error("Permanent delete error:", err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to permanently delete message."
            );
        } finally {
            setActionId(null);
        }
    };

    const getSender = (message) => {
        if (!message.sender) return "Unknown sender";
        if (typeof message.sender === "string") return message.sender;
        return message.sender.name || message.sender.email || "Unknown sender";
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

    const formatDate = (date) => {
        if (!date) return "";

        const value = new Date(date);
        if (Number.isNaN(value.getTime())) return "";

        return value.toLocaleDateString([], {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
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
                        <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Messages moved to trash
                            {messages.length > 0 && ` · ${messages.length} messages`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadTrash(true)}
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
                            onClick={() => loadTrash()}
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
                                <div className="mb-4 text-6xl">🗑️</div>
                                <h2 className="font-semibold text-gray-700">
                                    Trash is empty
                                </h2>
                                <p className="mt-1 text-sm text-gray-400">
                                    Deleted messages will appear here.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {messages.map((message) => {
                                const processing = actionId === message._id;

                                return (
                                    <div
                                        key={message._id}
                                        className="border-b border-gray-100 px-4 py-4 transition hover:bg-gray-50 md:px-5"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600 sm:flex">
                                                {(getSender(message).charAt(0) || "?").toUpperCase()}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-gray-800">
                                                            {getSender(message)}
                                                        </p>
                                                        <p className="truncate text-xs text-gray-400">
                                                            To: {getRecipients(message)}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {formatDate(message.sentAt || message.createdAt)}
                                                        </p>
                                                    </div>

                                                    <div className="flex shrink-0 gap-1">
                                                        <button
                                                            type="button"
                                                            disabled={processing}
                                                            onClick={() => handleRestore(message._id)}
                                                            className="rounded-lg px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                                                        >
                                                            Restore
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={processing}
                                                            onClick={() => handlePermanentDelete(message._id)}
                                                            className="rounded-lg px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
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
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Trash;
