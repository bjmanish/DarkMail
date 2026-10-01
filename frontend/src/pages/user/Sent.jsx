import React, { useCallback, useEffect, useState } from "react";
import MessageViewer from "../../components/mail/MessageViewer";

import {
    getMessagesApi,
    moveMessageToTrashApi,
} from "../../api/messageApi";

const LIMIT = 20;

const Sent = () => {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadMessages = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMessagesApi({
                folder: "sent",
                page,
                limit: LIMIT,
            });

            const list =
                response?.messages ||
                response?.data ||
                [];

            setMessages(Array.isArray(list) ? list : []);

            setTotalPages(
                Number(response?.pages) ||
                Number(response?.totalPages) ||
                1
            );

            // Keep selected message updated after refresh
            if (selectedMessage?._id) {
                const updated = list.find(
                    (item) => item._id === selectedMessage._id
                );

                setSelectedMessage(updated || null);
            }
        } catch (err) {
            console.error("Sent messages error:", err);

            setError(
                err?.response?.data?.message ||
                "Failed to load sent messages."
            );

            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [page, selectedMessage?._id]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const handleSelectMessage = (message) => {
        setSelectedMessage(message);
    };

    const handleDelete = async (messageId) => {
        try {
            await moveMessageToTrashApi(messageId);

            setMessages((prev) =>
                prev.filter((item) => item._id !== messageId)
            );

            if (selectedMessage?._id === messageId) {
                setSelectedMessage(null);
            }
        } catch (err) {
            console.error("Move sent message to trash:", err);

            alert(
                err?.response?.data?.message ||
                "Unable to move message to trash."
            );
        }
    };

    const formatDate = (date) => {
        if (!date) return "";

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return "";
        }

        return value.toLocaleDateString([], {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getRecipientText = (message) => {
        if (!message?.to) {
            return "No recipient";
        }

        if (Array.isArray(message.to)) {
            return message.to
                .map((recipient) => {
                    if (typeof recipient === "string") {
                        return recipient;
                    }

                    return (
                        recipient?.name ||
                        recipient?.email ||
                        recipient?.employeeId ||
                        ""
                    );
                })
                .filter(Boolean)
                .join(", ");
        }

        return (
            message.to?.name ||
            message.to?.email ||
            "No recipient"
        );
    };

    return (
        <div className="h-full w-full bg-white">

            {/* MOBILE VIEW */}
            <div className="lg:hidden h-full">

                {!selectedMessage ? (
                    <div className="h-full flex flex-col">

                        {/* Header */}
                        <div className="px-4 py-4 border-b">
                            <h1 className="text-xl font-semibold text-gray-800">
                                Sent
                            </h1>

                            <p className="text-sm text-gray-500 mt-1">
                                Messages you have sent
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="m-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Loading */}
                        {loading ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3, 4, 5].map((item) => (
                                    <div
                                        key={item}
                                        className="animate-pulse border-b pb-4"
                                    >
                                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-gray-200 rounded w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <div className="text-5xl mb-3">
                                        ✈
                                    </div>

                                    <p className="font-medium">
                                        No sent messages
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto">

                                {messages.map((message) => (
                                    <button
                                        type="button"
                                        key={message._id}
                                        onClick={() =>
                                            handleSelectMessage(message)
                                        }
                                        className="w-full text-left px-4 py-4 border-b hover:bg-gray-50 active:bg-gray-100"
                                    >
                                        <div className="flex items-start justify-between gap-3">

                                            <div className="min-w-0 flex-1">

                                                <div className="font-medium text-gray-800 truncate">
                                                    {message.subject ||
                                                        "(No Subject)"}
                                                </div>

                                                <div className="text-xs text-gray-500 mt-1 truncate">
                                                    To:{" "}
                                                    {getRecipientText(
                                                        message
                                                    )}
                                                </div>

                                                <div className="text-sm text-gray-500 mt-2 truncate">
                                                    {message.body ||
                                                        "No message content"}
                                                </div>

                                            </div>

                                            <div className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatDate(
                                                    message.sentAt ||
                                                    message.createdAt
                                                )}
                                            </div>

                                        </div>
                                    </button>
                                ))}

                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && messages.length > 0 && (
                            <div className="border-t px-4 py-3 flex items-center justify-between">

                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() =>
                                        setPage((value) =>
                                            Math.max(1, value - 1)
                                        )
                                    }
                                    className="px-3 py-2 text-sm rounded-lg border disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <span className="text-sm text-gray-500">
                                    {page} / {totalPages}
                                </span>

                                <button
                                    type="button"
                                    disabled={page >= totalPages}
                                    onClick={() =>
                                        setPage((value) =>
                                            Math.min(
                                                totalPages,
                                                value + 1
                                            )
                                        )
                                    }
                                    className="px-3 py-2 text-sm rounded-lg border disabled:opacity-40"
                                >
                                    Next
                                </button>

                            </div>
                        )}
                    </div>
                ) : (
                    <MessageViewer
                        message={selectedMessage}
                        folder="sent"
                        onClose={() => setSelectedMessage(null)}
                        onRefresh={loadMessages}
                    />
                )}

            </div>

            {/* DESKTOP SPLIT VIEW */}
            <div className="hidden lg:grid lg:grid-cols-[380px_minmax(0,1fr)] h-full">

                {/* LEFT LIST */}
                <div className="border-r flex flex-col min-w-0">

                    <div className="px-5 py-4 border-b">
                        <h1 className="text-xl font-semibold text-gray-800">
                            Sent
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Messages you have sent
                        </p>
                    </div>

                    {error && (
                        <div className="m-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="p-4 space-y-4 flex-1">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div
                                    key={item}
                                    className="animate-pulse"
                                >
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-full" />
                                </div>
                            ))}
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <div className="text-5xl mb-3">
                                    ✈
                                </div>

                                <p>No sent messages</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">

                            {messages.map((message) => (
                                <button
                                    type="button"
                                    key={message._id}
                                    onClick={() =>
                                        handleSelectMessage(message)
                                    }
                                    className={`w-full text-left px-4 py-4 border-b hover:bg-gray-50 transition ${
                                        selectedMessage?._id ===
                                        message._id
                                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                                            : ""
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">

                                        <div className="min-w-0 flex-1">

                                            <div className="font-medium text-gray-800 truncate">
                                                {message.subject ||
                                                    "(No Subject)"}
                                            </div>

                                            <div className="text-xs text-gray-500 mt-1 truncate">
                                                To:{" "}
                                                {getRecipientText(
                                                    message
                                                )}
                                            </div>

                                            <div className="text-sm text-gray-500 mt-2 truncate">
                                                {message.body ||
                                                    "No message content"}
                                            </div>

                                        </div>

                                        <div className="text-xs text-gray-400 whitespace-nowrap">
                                            {formatDate(
                                                message.sentAt ||
                                                message.createdAt
                                            )}
                                        </div>

                                    </div>
                                </button>
                            ))}

                        </div>
                    )}

                    {!loading && messages.length > 0 && (
                        <div className="border-t px-4 py-3 flex items-center justify-between">

                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((value) =>
                                        Math.max(1, value - 1)
                                    )
                                }
                                className="px-3 py-2 text-sm rounded-lg border disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span className="text-sm text-gray-500">
                                {page} / {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() =>
                                    setPage((value) =>
                                        Math.min(
                                            totalPages,
                                            value + 1
                                        )
                                    )
                                }
                                className="px-3 py-2 text-sm rounded-lg border disabled:opacity-40"
                            >
                                Next
                            </button>

                        </div>
                    )}

                </div>

                {/* RIGHT VIEWER */}
                <div className="min-w-0 h-full overflow-hidden">

                    <MessageViewer
                        message={selectedMessage}
                        folder="sent"
                        onClose={() => setSelectedMessage(null)}
                        onRefresh={loadMessages}
                        onDelete={handleDelete}
                    />

                </div>

            </div>

        </div>
    );
};

export default Sent;