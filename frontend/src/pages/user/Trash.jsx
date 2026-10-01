import React, { useCallback, useEffect, useState } from "react";
import MessageViewer from "../../components/mail/MessageViewer";

import {
    getTrashApi,
    restoreMessageApi,
    permanentlyDeleteMessageApi,
} from "../../api/messageApi";

const Trash = () => {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTrash = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getTrashApi();

            const list =
                response?.messages ||
                response?.data ||
                [];

            setMessages(Array.isArray(list) ? list : []);

            if (selectedMessage?._id) {
                const updated = list.find(
                    (item) => item._id === selectedMessage._id
                );

                setSelectedMessage(updated || null);
            }
        } catch (err) {
            console.error("Trash error:", err);

            setError(
                err?.response?.data?.message ||
                "Failed to load trash."
            );

            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [selectedMessage?._id]);

    useEffect(() => {
        loadTrash();
    }, [loadTrash]);

    const handleSelectMessage = (message) => {
        setSelectedMessage(message);
    };

    const handleRestore = async (messageId) => {
        try {
            await restoreMessageApi(messageId);

            setMessages((prev) =>
                prev.filter((item) => item._id !== messageId)
            );

            if (selectedMessage?._id === messageId) {
                setSelectedMessage(null);
            }
        } catch (err) {
            console.error("Restore error:", err);

            alert(
                err?.response?.data?.message ||
                "Unable to restore message."
            );
        }
    };

    const handlePermanentDelete = async (messageId) => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this message?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await permanentlyDeleteMessageApi(messageId);

            setMessages((prev) =>
                prev.filter((item) => item._id !== messageId)
            );

            if (selectedMessage?._id === messageId) {
                setSelectedMessage(null);
            }
        } catch (err) {
            console.error("Permanent delete error:", err);

            alert(
                err?.response?.data?.message ||
                "Unable to permanently delete message."
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

    const getSenderText = (message) => {
        if (!message?.sender) {
            return "Unknown sender";
        }

        if (typeof message.sender === "string") {
            return message.sender;
        }

        return (
            message.sender.name ||
            message.sender.email ||
            message.sender.employeeId ||
            "Unknown sender"
        );
    };

    return (
        <div className="h-full w-full bg-white">

            {/* MOBILE */}
            <div className="lg:hidden h-full">

                {!selectedMessage ? (
                    <div className="h-full flex flex-col">

                        <div className="px-4 py-4 border-b">
                            <h1 className="text-xl font-semibold text-gray-800">
                                Trash
                            </h1>

                            <p className="text-sm text-gray-500 mt-1">
                                Deleted messages
                            </p>
                        </div>

                        {error && (
                            <div className="m-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3, 4, 5].map((item) => (
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
                                        🗑
                                    </div>

                                    <p className="font-medium">
                                        Trash is empty
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
                                        className="w-full text-left px-4 py-4 border-b hover:bg-gray-50"
                                    >
                                        <div className="flex items-start justify-between gap-3">

                                            <div className="min-w-0 flex-1">

                                                <div className="font-medium text-gray-800 truncate">
                                                    {message.subject ||
                                                        "(No Subject)"}
                                                </div>

                                                <div className="text-xs text-gray-500 mt-1 truncate">
                                                    From:{" "}
                                                    {getSenderText(
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

                    </div>
                ) : (
                    <MessageViewer
                        message={selectedMessage}
                        folder="trash"
                        onClose={() => setSelectedMessage(null)}
                        onRefresh={loadTrash}
                        onRestore={handleRestore}
                        onPermanentDelete={
                            handlePermanentDelete
                        }
                    />
                )}

            </div>

            {/* DESKTOP */}
            <div className="hidden lg:grid lg:grid-cols-[380px_minmax(0,1fr)] h-full">

                {/* LEFT */}
                <div className="border-r flex flex-col min-w-0">

                    <div className="px-5 py-4 border-b">
                        <h1 className="text-xl font-semibold text-gray-800">
                            Trash
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Deleted messages
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
                                    🗑
                                </div>

                                <p>Trash is empty</p>
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
                                                From:{" "}
                                                {getSenderText(
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

                </div>

                {/* RIGHT */}
                <div className="min-w-0 h-full overflow-hidden">

                    <MessageViewer
                        message={selectedMessage}
                        folder="trash"
                        onClose={() => setSelectedMessage(null)}
                        onRefresh={loadTrash}
                        onRestore={handleRestore}
                        onPermanentDelete={
                            handlePermanentDelete
                        }
                    />

                </div>

            </div>

        </div>
    );
};

export default Trash;