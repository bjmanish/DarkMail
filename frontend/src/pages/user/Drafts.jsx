import { useCallback, useEffect, useState } from "react";

import {
    deleteDraftApi,
    getDraftsApi,
    sendDraftApi
} from "../../api/messageApi";

import ComposeModal from "../../components/mail/ComposeModal";

const Drafts = () => {
    const [drafts, setDrafts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [actionId, setActionId] = useState(null);

    /*
     * Compose modal state
     */
    const [composeOpen, setComposeOpen] =
        useState(false);

    const [selectedDraft, setSelectedDraft] =
        useState(null);

    /* =========================================================
       LOAD DRAFTS
    ========================================================= */

    const loadDrafts = useCallback(
        async (showRefresh = false) => {
            try {
                if (showRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response =
                    await getDraftsApi();

                if (!response.success) {
                    throw new Error(
                        response.message ||
                            "Failed to load drafts."
                    );
                }

                setDrafts(
                    response.drafts || []
                );
            } catch (err) {
                console.error(
                    "Load drafts error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Unable to load drafts."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useEffect(() => {
        loadDrafts();
    }, [loadDrafts]);

    /* =========================================================
       FORMAT DATE
    ========================================================= */

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

    /* =========================================================
       RECIPIENT DISPLAY
    ========================================================= */

    const getRecipients = (draft) => {
        const recipients = [
            ...(draft.to || []),
            ...(draft.cc || []),
            ...(draft.bcc || [])
        ];

        if (!recipients.length) {
            return "No recipients";
        }

        return recipients
            .map((recipient) => {
                if (
                    typeof recipient ===
                    "string"
                ) {
                    return recipient;
                }

                return (
                    recipient.name ||
                    recipient.email ||
                    "Unknown"
                );
            })
            .join(", ");
    };

    /* =========================================================
       PREVIEW
    ========================================================= */

    const getPreview = (body) => {
        if (!body) {
            return "No message content";
        }

        return body
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 120);
    };

    /* =========================================================
       DELETE DRAFT
    ========================================================= */

    const handleDelete = async (
        draftId
    ) => {
        const confirmed =
            window.confirm(
                "Delete this draft permanently?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setActionId(draftId);
            setError("");

            const response =
                await deleteDraftApi(
                    draftId
                );

            if (!response.success) {
                throw new Error(
                    response.message ||
                        "Failed to delete draft."
                );
            }

            setDrafts(
                (previous) =>
                    previous.filter(
                        (draft) =>
                            draft._id !==
                            draftId
                    )
            );
        } catch (err) {
            console.error(
                "Delete draft error:",
                err
            );

            setError(
                err.response?.data
                    ?.message ||
                    err.message ||
                    "Failed to delete draft."
            );
        } finally {
            setActionId(null);
        }
    };

    /* =========================================================
       SEND DRAFT
    ========================================================= */

    const handleSend = async (
        draftId
    ) => {
        const confirmed =
            window.confirm(
                "Send this draft now?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setActionId(draftId);
            setError("");

            const response =
                await sendDraftApi(
                    draftId
                );

            if (!response.success) {
                throw new Error(
                    response.message ||
                        "Failed to send draft."
                );
            }

            /*
             * Remove from Drafts immediately.
             */
            setDrafts(
                (previous) =>
                    previous.filter(
                        (draft) =>
                            draft._id !==
                            draftId
                    )
            );
        } catch (err) {
            console.error(
                "Send draft error:",
                err
            );

            setError(
                err.response?.data
                    ?.message ||
                    err.message ||
                    "Failed to send draft."
            );
        } finally {
            setActionId(null);
        }
    };

    /* =========================================================
       OPEN DRAFT
    ========================================================= */

    const handleOpenDraft = (
        draft
    ) => {
        /*
         * Do NOT navigate to:
         *
         * /user/drafts/:id
         *
         * Instead, open the existing ComposeModal
         * and pass the selected draft to it.
         */

        setSelectedDraft(draft);

        setComposeOpen(true);
    };

    /* =========================================================
       CLOSE COMPOSE
    ========================================================= */

    const handleCloseCompose = () => {
        setComposeOpen(false);

        setSelectedDraft(null);

        /*
         * Reload drafts because:
         *
         * - draft may have been updated
         * - draft may have been sent
         * - draft may have been deleted
         */

        loadDrafts(true);
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="p-4 sm:p-6">

                <div className="mb-6">
                    <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />

                    <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-200" />
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                    {Array.from({
                        length: 6
                    }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 border-b border-gray-100 px-4 py-4"
                            >
                                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />

                                <div className="flex-1">

                                    <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />

                                    <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-gray-200" />

                                </div>
                            </div>
                        )
                    )}

                </div>

            </div>
        );
    }

    /* =========================================================
       PAGE
    ========================================================= */

    return (
        <div className="min-h-full bg-gray-50 p-4 sm:p-6">

            {/* =================================================
                HEADER
            ================================================== */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <h1 className="text-2xl font-bold text-gray-900">
                        Drafts
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Continue working on your saved messages.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        loadDrafts(true)
                    }
                    disabled={refreshing}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {refreshing
                        ? "Refreshing..."
                        : "↻ Refresh"}
                </button>

            </div>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                    <span className="whitespace-pre-line">
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            loadDrafts()
                        }
                        className="shrink-0 font-semibold underline"
                    >
                        Retry
                    </button>

                </div>
            )}

            {/* =================================================
                EMPTY
            ================================================== */}

            {!drafts.length &&
                !error && (
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 text-center">

                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
                            📝
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900">
                            No drafts
                        </h2>

                        <p className="mt-1 max-w-md text-sm text-gray-500">
                            Messages that you save before
                            sending will appear here.
                        </p>

                    </div>
                )}

            {/* =================================================
                DESKTOP / TABLET
            ================================================== */}

            {drafts.length > 0 && (
                <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">

                    <div className="grid grid-cols-[minmax(220px,1fr)_minmax(180px,2fr)_140px_150px] border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">

                        <span>
                            Recipients
                        </span>

                        <span>
                            Subject
                        </span>

                        <span>
                            Saved
                        </span>

                        <span className="text-right">
                            Actions
                        </span>

                    </div>

                    {drafts.map(
                        (draft) => {
                            const isProcessing =
                                actionId ===
                                draft._id;

                            return (
                                <div
                                    key={
                                        draft._id
                                    }
                                    className="grid grid-cols-[minmax(220px,1fr)_minmax(180px,2fr)_140px_150px] items-center border-b border-gray-100 px-5 py-4 transition last:border-b-0 hover:bg-gray-50"
                                >

                                    {/* RECIPIENT */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenDraft(
                                                draft
                                            )
                                        }
                                        className="min-w-0 text-left"
                                    >
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                            {getRecipients(
                                                draft
                                            )}
                                        </p>

                                        <p className="mt-1 truncate text-xs text-gray-500">
                                            {getPreview(
                                                draft.body
                                            )}
                                        </p>
                                    </button>

                                    {/* SUBJECT */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenDraft(
                                                draft
                                            )
                                        }
                                        className="min-w-0 text-left"
                                    >
                                        <p className="truncate text-sm text-gray-800">
                                            {draft.subject ||
                                                "(No subject)"}
                                        </p>

                                        <span className="mt-1 inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700">
                                            DRAFT
                                        </span>
                                    </button>

                                    {/* DATE */}

                                    <span className="text-sm text-gray-500">
                                        {formatDate(
                                            draft.updatedAt ||
                                                draft.createdAt
                                        )}
                                    </span>

                                    {/* ACTIONS */}

                                    <div className="flex justify-end gap-2">

                                        <button
                                            type="button"
                                            disabled={
                                                isProcessing
                                            }
                                            onClick={() =>
                                                handleOpenDraft(
                                                    draft
                                                )
                                            }
                                            className="rounded-lg px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                                        >
                                            Open
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                isProcessing
                                            }
                                            onClick={() =>
                                                handleSend(
                                                    draft._id
                                                )
                                            }
                                            className="rounded-lg px-3 py-2 text-xs font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
                                        >
                                            Send
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                isProcessing
                                            }
                                            onClick={() =>
                                                handleDelete(
                                                    draft._id
                                                )
                                            }
                                            className="rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>
            )}

            {/* =================================================
                MOBILE
            ================================================== */}

            {drafts.length > 0 && (
                <div className="space-y-3 md:hidden">

                    {drafts.map(
                        (draft) => {
                            const isProcessing =
                                actionId ===
                                draft._id;

                            return (
                                <div
                                    key={
                                        draft._id
                                    }
                                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                                >

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenDraft(
                                                draft
                                            )
                                        }
                                        className="block w-full text-left"
                                    >

                                        <div className="flex items-start justify-between gap-3">

                                            <div className="min-w-0">

                                                <div className="flex items-center gap-2">

                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-sm">
                                                        📝
                                                    </span>

                                                    <div className="min-w-0">

                                                        <p className="truncate text-sm font-semibold text-gray-900">
                                                            {getRecipients(
                                                                draft
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(
                                                                draft.updatedAt ||
                                                                    draft.createdAt
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                            <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-bold text-yellow-700">
                                                DRAFT
                                            </span>

                                        </div>

                                        <p className="mt-4 truncate text-sm font-semibold text-gray-800">
                                            {draft.subject ||
                                                "(No subject)"}
                                        </p>

                                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                            {getPreview(
                                                draft.body
                                            )}
                                        </p>

                                    </button>

                                    {/* ACTIONS */}

                                    <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">

                                        <button
                                            type="button"
                                            disabled={
                                                isProcessing
                                            }
                                            onClick={() =>
                                                handleOpenDraft(
                                                    draft
                                                )
                                            }
                                            className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 disabled:opacity-50"
                                        >
                                            Open
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                isProcessing
                                            }
                                            onClick={() =>
                                                handleSend(
                                                    draft._id
                                                )
                                            }
                                            className="flex-1 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 disabled:opacity-50"
                                        >
                                            Send
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                isProcessing
                                            }
                                            onClick={() =>
                                                handleDelete(
                                                    draft._id
                                                )
                                            }
                                            className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>
            )}

            {/* =================================================
                EDIT DRAFT COMPOSE MODAL
            ================================================== */}

            <ComposeModal
                isOpen={composeOpen}
                initialDraft={selectedDraft}
                onClose={handleCloseCompose}
            />

        </div>
    );
};

export default Drafts;
