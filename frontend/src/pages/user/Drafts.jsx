import React, { useCallback, useEffect, useState } from "react";
import MessageViewer from "../../components/mail/MessageViewer";

import {
    getDraftsApi,
    sendDraftApi,
    deleteDraftApi,
} from "../../api/messageApi";

const Drafts = () => {
    const [drafts, setDrafts] = useState([]);
    const [selectedDraft, setSelectedDraft] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDrafts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getDraftsApi();

            const list =
                response?.drafts ||
                response?.data ||
                [];

            setDrafts(Array.isArray(list) ? list : []);

            if (selectedDraft?._id) {
                const updated = list.find(
                    (item) => item._id === selectedDraft._id
                );

                setSelectedDraft(updated || null);
            }
        } catch (err) {
            console.error("Drafts error:", err);

            setError(
                err?.response?.data?.message ||
                "Failed to load drafts."
            );

            setDrafts([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDraft?._id]);

    useEffect(() => {
        loadDrafts();
    }, [loadDrafts]);

    const handleSelectDraft = (draft) => {
        setSelectedDraft(draft);
    };

    const handleSendDraft = async (draftId) => {
        try {
            await sendDraftApi(draftId);

            setDrafts((prev) =>
                prev.filter((item) => item._id !== draftId)
            );

            if (selectedDraft?._id === draftId) {
                setSelectedDraft(null);
            }
        } catch (err) {
            console.error("Send draft error:", err);

            alert(
                err?.response?.data?.message ||
                "Unable to send draft."
            );
        }
    };

    const handleDeleteDraft = async (draftId) => {
        try {
            await deleteDraftApi(draftId);

            setDrafts((prev) =>
                prev.filter((item) => item._id !== draftId)
            );

            if (selectedDraft?._id === draftId) {
                setSelectedDraft(null);
            }
        } catch (err) {
            console.error("Delete draft error:", err);

            alert(
                err?.response?.data?.message ||
                "Unable to delete draft."
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

    const getRecipientText = (draft) => {
        if (!draft?.to) {
            return "No recipient";
        }

        if (Array.isArray(draft.to)) {
            return draft.to
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
            draft.to?.name ||
            draft.to?.email ||
            "No recipient"
        );
    };

    return (
        <div className="h-full w-full bg-white">

            {/* MOBILE */}
            <div className="lg:hidden h-full">

                {!selectedDraft ? (
                    <div className="h-full flex flex-col">

                        <div className="px-4 py-4 border-b">
                            <h1 className="text-xl font-semibold text-gray-800">
                                Drafts
                            </h1>

                            <p className="text-sm text-gray-500 mt-1">
                                Your saved messages
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
                        ) : drafts.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <div className="text-5xl mb-3">
                                        📝
                                    </div>

                                    <p className="font-medium">
                                        No drafts
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto">

                                {drafts.map((draft) => (
                                    <button
                                        type="button"
                                        key={draft._id}
                                        onClick={() =>
                                            handleSelectDraft(draft)
                                        }
                                        className="w-full text-left px-4 py-4 border-b hover:bg-gray-50"
                                    >
                                        <div className="flex items-start justify-between gap-3">

                                            <div className="min-w-0 flex-1">

                                                <div className="flex items-center gap-2">

                                                    <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-600">
                                                        Draft
                                                    </span>

                                                    <span className="font-medium text-gray-800 truncate">
                                                        {draft.subject ||
                                                            "(No Subject)"}
                                                    </span>

                                                </div>

                                                <div className="text-xs text-gray-500 mt-1 truncate">
                                                    To:{" "}
                                                    {getRecipientText(
                                                        draft
                                                    )}
                                                </div>

                                                <div className="text-sm text-gray-500 mt-2 truncate">
                                                    {draft.body ||
                                                        "Empty draft"}
                                                </div>

                                            </div>

                                            <div className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatDate(
                                                    draft.updatedAt ||
                                                    draft.createdAt
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
                        message={selectedDraft}
                        folder="drafts"
                        onClose={() => setSelectedDraft(null)}
                        onRefresh={loadDrafts}
                        onSend={handleSendDraft}
                        onDelete={handleDeleteDraft}
                    />
                )}

            </div>

            {/* DESKTOP */}
            <div className="hidden lg:grid lg:grid-cols-[380px_minmax(0,1fr)] h-full">

                {/* LEFT */}
                <div className="border-r flex flex-col min-w-0">

                    <div className="px-5 py-4 border-b">
                        <h1 className="text-xl font-semibold text-gray-800">
                            Drafts
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Your saved messages
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
                    ) : drafts.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <div className="text-5xl mb-3">
                                    📝
                                </div>

                                <p>No drafts</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">

                            {drafts.map((draft) => (
                                <button
                                    type="button"
                                    key={draft._id}
                                    onClick={() =>
                                        handleSelectDraft(draft)
                                    }
                                    className={`w-full text-left px-4 py-4 border-b hover:bg-gray-50 transition ${
                                        selectedDraft?._id ===
                                        draft._id
                                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                                            : ""
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">

                                        <div className="min-w-0 flex-1">

                                            <div className="flex items-center gap-2">

                                                <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-600">
                                                    Draft
                                                </span>

                                                <span className="font-medium text-gray-800 truncate">
                                                    {draft.subject ||
                                                        "(No Subject)"}
                                                </span>

                                            </div>

                                            <div className="text-xs text-gray-500 mt-1 truncate">
                                                To:{" "}
                                                {getRecipientText(
                                                    draft
                                                )}
                                            </div>

                                            <div className="text-sm text-gray-500 mt-2 truncate">
                                                {draft.body ||
                                                    "Empty draft"}
                                            </div>

                                        </div>

                                        <div className="text-xs text-gray-400 whitespace-nowrap">
                                            {formatDate(
                                                draft.updatedAt ||
                                                draft.createdAt
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
                        message={selectedDraft}
                        folder="drafts"
                        onClose={() => setSelectedDraft(null)}
                        onRefresh={loadDrafts}
                        onSend={handleSendDraft}
                        onDelete={handleDeleteDraft}
                    />

                </div>

            </div>

        </div>
    );
};

export default Drafts;