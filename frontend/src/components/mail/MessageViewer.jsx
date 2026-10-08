import React, { useState } from "react";

import {
    ArrowLeft,
    Reply,
    ReplyAll,
    Forward,
    Pencil,
    Trash2,
    RotateCcw,
    Paperclip,
    Download,
    Calendar,
    Clock,
    Loader2,
    Send,
    X,
    ChevronDown,
    ChevronUp,
    Mail,
    Copy,
    MoreVertical,
} from "lucide-react";

import {
    moveMessageToTrashApi,
    restoreMessageApi,
    permanentlyDeleteMessageApi,
    replyToMessageApi,
    downloadAttachmentApi,
} from "../../api/messageApi";


const MessageViewer = ({
    message,
    onClose,
    onMessageDeleted,
    onMessageUpdated,
    showCloseButton = false,
}) => {

    /* =========================================================
       STATE
    ========================================================= */

    const [actionLoading, setActionLoading] =
        useState(false);

    const [showReply, setShowReply] =
        useState(false);

    const [replyBody, setReplyBody] =
        useState("");

    const [showDetails, setShowDetails] =
        useState(false);

    const [showAllAttachments, setShowAllAttachments] =
        useState(false);

    const [downloadingAttachment, setDownloadingAttachment] =
        useState(null);

    const [showMoreMenu, setShowMoreMenu] =
        useState(false);


    /* =========================================================
       NO MESSAGE
    ========================================================= */

    if (!message) {

        return (
            <div
                className="
                    flex
                    h-full
                    min-h-0
                    w-full
                    flex-col
                    overflow-hidden
                    bg-white
                "
            >

                {/* MESSAGE HEADER */}

                <div
                    className="
                        flex
                        h-14
                        shrink-0
                        items-center
                        justify-between
                        border-b
                        border-gray-200
                        bg-gray-50
                        px-4
                    "
                >

                    <div className="flex items-center gap-0">

                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="
                                    rounded-lg
                                    p-2
                                    text-gray-500
                                    hover:bg-gray-200
                                "
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}

                        <Mail
                            size={18}
                            className="shrink-0 text-gray-600"
                        />

                        <h2
                            className="
                                truncate
                                text-base
                                font-medium
                                text-gray-800
                            "
                        >
                            No message selected
                        </h2>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-lg
                            p-2
                            text-gray-500
                            hover:bg-gray-200
                        "
                    >
                        <X size={20} />
                    </button>

                </div>


                <div
                    className="
                        flex
                        flex-1
                        items-center
                        justify-center
                        text-sm
                        text-gray-400
                    "
                >
                    Select a message to view it.
                </div>

            </div>
        );
    }


    /* =========================================================
       PERSON HELPERS
    ========================================================= */

    const getPersonName = (person) => {

        if (!person) {
            return "Unknown User";
        }

        if (typeof person === "string") {
            return person;
        }

        return (
            person.name ||
            person.fullName ||
            person.employeeName ||
            person.username ||
            person.email ||
            "Unknown User"
        );
    };


    const getPersonEmail = (person) => {

        if (!person) {
            return "";
        }

        if (typeof person === "string") {
            return person;
        }

        return (
            person.email ||
            person.emailAddress ||
            ""
        );
    };


    const getInitial = (person) => {

        return (
            getPersonName(person)
                ?.charAt(0)
                ?.toUpperCase() ||
            "U"
        );
    };


    /* =========================================================
       RECIPIENTS
    ========================================================= */

    const normalizeRecipients = (recipients) => {

        if (!recipients) {
            return [];
        }

        if (Array.isArray(recipients)) {
            return recipients;
        }

        return [recipients];
    };


    const toRecipients =
        normalizeRecipients(message.to);

    const ccRecipients =
        normalizeRecipients(message.cc);

    const bccRecipients =
        normalizeRecipients(message.bcc);


    const allRecipients = [
        ...toRecipients,
        ...ccRecipients,
        ...bccRecipients,
    ];


    /* =========================================================
       DATE
    ========================================================= */

    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


    /* =========================================================
       SHORT DATE
    ========================================================= */

    const formatShortDate = (date) => {

        if (!date) {
            return "";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


    /* =========================================================
       MESSAGE STATUS
       
       IMPORTANT:
       
       Draft is detected using:
       
       message.status === "DRAFT"
    ========================================================= */

    const isDraft =
        String(
            message?.status || ""
        )
            .trim()
            .toUpperCase() ===
        "DRAFT";


    /* =========================================================
       TRASH STATUS
    ========================================================= */

    const isTrash =
        Array.isArray(message.deletedBy) &&
        message.deletedBy.length > 0;


    /* =========================================================
       ATTACHMENTS
    ========================================================= */

    const attachments =
        Array.isArray(message.attachments)
            ? message.attachments
            : [];


    const visibleAttachments =
        showAllAttachments
            ? attachments
            : attachments.slice(0, 2);


    /* =========================================================
       FILE SIZE
    ========================================================= */

    const formatFileSize = (bytes) => {

        if (
            bytes === undefined ||
            bytes === null ||
            bytes === ""
        ) {
            return "";
        }

        const size =
            Number(bytes);

        if (
            Number.isNaN(size) ||
            size <= 0
        ) {
            return "";
        }

        if (size < 1024) {
            return `${size} B`;
        }

        if (size < 1024 * 1024) {
            return `${(
                size / 1024
            ).toFixed(2)} KB`;
        }

        if (size < 1024 * 1024 * 1024) {
            return `${(
                size /
                (1024 * 1024)
            ).toFixed(2)} MB`;
        }

        return `${(
            size /
            (1024 * 1024 * 1024)
        ).toFixed(2)} GB`;
    };


    /* =========================================================
       ATTACHMENT NAME
    ========================================================= */

    const getAttachmentName = (
        attachment,
        index
    ) => {

        return (
            attachment?.filename ||
            attachment?.originalname ||
            attachment?.originalName ||
            attachment?.name ||
            `Attachment ${index + 1}`
        );
    };


    /* =========================================================
       ATTACHMENT SIZE
    ========================================================= */

    const getAttachmentSize = (
        attachment
    ) => {

        return (
            formatFileSize(
                attachment?.size ||
                attachment?.fileSize ||
                attachment?.length
            ) ||
            attachment?.sizeText ||
            ""
        );
    };


    /* =========================================================
       FILE EXTENSION
    ========================================================= */

    const getFileExtension = (
        filename
    ) => {

        if (!filename) {
            return "FILE";
        }

        const parts =
            filename.split(".");

        if (parts.length < 2) {
            return "FILE";
        }

        return parts[
            parts.length - 1
        ]
            .toUpperCase()
            .slice(0, 5);
    };


    /* =========================================================
       EDIT DRAFT
    ========================================================= */

    const handleEditDraft = () => {

        if (!message?._id) {
            alert(
                "Draft ID is missing."
            );

            return;
        }


        /*
         * Navigate to Compose page
         * with the draft ID.
         *
         * ComposeModal can use this
         * draftId to load the draft.
         */

        window.location.href =
            `/user/compose?draftId=${encodeURIComponent(
                message._id
            )}`;
    };


    /* =========================================================
       DOWNLOAD SINGLE ATTACHMENT
    ========================================================= */

    const handleDownloadAttachment = async (
        attachment,
        index
    ) => {

        try {

            if (!message?._id) {

                throw new Error(
                    "Message ID is missing."
                );
            }


            if (
                downloadingAttachment !==
                null
            ) {
                return;
            }


            setDownloadingAttachment(
                index
            );


            const filename =
                getAttachmentName(
                    attachment,
                    index
                );


            const response =
                await downloadAttachmentApi(
                    message._id,
                    index
                );


            const contentType =
                response?.headers?.[
                    "content-type"
                ] ||
                attachment?.mimeType ||
                attachment?.mimetype ||
                "application/octet-stream";


            const blob =
                new Blob(
                    [response.data],
                    {
                        type: contentType,
                    }
                );


            const downloadUrl =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement("a");


            link.href =
                downloadUrl;


            link.download =
                filename;


            link.style.display =
                "none";


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            window.URL.revokeObjectURL(
                downloadUrl
            );


        } catch (error) {

            console.error(
                "Attachment download error:",
                error
            );


            let errorMessage =
                "Unable to download attachment.";


            try {

                const responseData =
                    error?.response?.data;


                if (
                    responseData instanceof Blob
                ) {

                    const text =
                        await responseData.text();


                    try {

                        const json =
                            JSON.parse(text);

                        errorMessage =
                            json?.message ||
                            errorMessage;

                    } catch {

                        if (text) {
                            errorMessage =
                                text;
                        }
                    }

                } else {

                    errorMessage =
                        error?.response?.data?.message ||
                        error?.message ||
                        errorMessage;
                }

            } catch (parseError) {

                console.error(
                    "Attachment parsing error:",
                    parseError
                );
            }


            alert(
                errorMessage
            );

        } finally {

            setDownloadingAttachment(
                null
            );
        }
    };


    /* =========================================================
       DOWNLOAD ALL
    ========================================================= */

    const handleDownloadAll = async () => {

        if (!attachments.length) {
            return;
        }

        for (
            let index = 0;
            index < attachments.length;
            index++
        ) {

            try {

                await handleDownloadAttachment(
                    attachments[index],
                    index
                );

            } catch (error) {

                console.error(
                    "Download all error:",
                    error
                );
            }
        }
    };


    /* =========================================================
       MOVE TO TRASH
    ========================================================= */

    const handleTrash = async () => {

        try {

            setActionLoading(true);


            const response =
                await moveMessageToTrashApi(
                    message._id
                );


            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    "Unable to move message to trash."
                );
            }


            if (onMessageDeleted) {

                onMessageDeleted(
                    message._id
                );
            }

        } catch (error) {

            console.error(
                "Move to trash error:",
                error
            );


            alert(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to move message to trash."
            );

        } finally {

            setActionLoading(false);
        }
    };


    /* =========================================================
       RESTORE
    ========================================================= */

    const handleRestore = async () => {

        try {

            setActionLoading(true);


            const response =
                await restoreMessageApi(
                    message._id
                );


            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    "Unable to restore message."
                );
            }


            if (onMessageUpdated) {
                onMessageUpdated();
            }

        } catch (error) {

            console.error(
                "Restore error:",
                error
            );


            alert(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to restore message."
            );

        } finally {

            setActionLoading(false);
        }
    };


    /* =========================================================
       PERMANENT DELETE
    ========================================================= */

    const handlePermanentDelete =
        async () => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to permanently delete this message?"
                );


            if (!confirmed) {
                return;
            }


            try {

                setActionLoading(true);


                const response =
                    await permanentlyDeleteMessageApi(
                        message._id
                    );


                if (!response?.success) {

                    throw new Error(
                        response?.message ||
                        "Unable to permanently delete message."
                    );
                }


                if (onMessageDeleted) {

                    onMessageDeleted(
                        message._id
                    );
                }

            } catch (error) {

                console.error(
                    "Permanent delete error:",
                    error
                );


                alert(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to permanently delete message."
                );

            } finally {

                setActionLoading(false);
            }
        };


    /* =========================================================
       REPLY
    ========================================================= */

    const handleReply = async () => {

        if (!replyBody.trim()) {
            return;
        }


        try {

            setActionLoading(true);


            const response =
                await replyToMessageApi(
                    message._id,
                    replyBody.trim()
                );


            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    "Unable to send reply."
                );
            }


            setReplyBody("");

            setShowReply(false);


            alert(
                "Reply sent successfully."
            );

        } catch (error) {

            console.error(
                "Reply error:",
                error
            );


            alert(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to send reply."
            );

        } finally {

            setActionLoading(false);
        }
    };


    /* =========================================================
       RECIPIENT CHIP
    ========================================================= */

    const renderRecipientChip = (
        person,
        index
    ) => {

        const name =
            getPersonName(person);

        const email =
            getPersonEmail(person);


        return (
            <div
                key={`${email}-${index}`}
                className="
                    inline-flex
                    max-w-full
                    items-center
                    gap-1.5
                    rounded-full
                    bg-white
                    px-1.5
                    py-1
                    shadow-sm
                    ring-1
                    ring-gray-200
                "
            >

                <span
                    className="
                        flex
                        h-5
                        w-5
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-indigo-500
                        text-[9px]
                        font-semibold
                        text-white
                    "
                >
                    {getInitial(person)}
                </span>


                <span
                    className="
                        max-w-[230px]
                        truncate
                        text-xs
                        text-gray-600
                    "
                    title={
                        email ||
                        name
                    }
                >
                    {email || name}
                </span>


                <button
                    type="button"
                    className="
                        flex
                        h-5
                        w-5
                        items-center
                        justify-center
                        rounded-full
                        text-gray-400
                        hover:bg-gray-100
                        hover:text-gray-700
                    "
                    title="Email"
                    onClick={() => {

                        if (email) {

                            window.location.href =
                                `mailto:${email}`;
                        }
                    }}
                >
                    <Mail size={12} />
                </button>


                <button
                    type="button"
                    className="
                        flex
                        h-5
                        w-5
                        items-center
                        justify-center
                        rounded-full
                        text-gray-400
                        hover:bg-gray-100
                        hover:text-gray-700
                    "
                    title="Copy email"
                    onClick={() => {

                        if (email) {

                            navigator.clipboard
                                ?.writeText(email);
                        }
                    }}
                >
                    <Copy size={11} />
                </button>

            </div>
        );
    };


    /* =========================================================
       RENDER RECIPIENT LIST
    ========================================================= */

    const renderRecipientSection = (
        label,
        recipients
    ) => {

        if (!recipients.length) {
            return null;
        }


        return (
            <div
                className="
                    flex
                    items-start
                    gap-3
                "
            >

                <div
                    className="
                        w-14
                        shrink-0
                        pt-1
                        text-xs
                        font-medium
                        text-gray-500
                    "
                >
                    {label}:
                </div>


                <div
                    className="
                        flex
                        min-w-0
                        flex-wrap
                        gap-1.5
                    "
                >

                    {recipients.map(
                        (
                            person,
                            index
                        ) =>
                            renderRecipientChip(
                                person,
                                index
                            )
                    )}

                </div>

            </div>
        );
    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div
            className="
                flex
                h-full
                min-h-0
                flex-col
                overflow-hidden
                bg-white
            "
        >

            {/* =================================================
                SUBJECT HEADER
            ================================================= */}

            <div
                className="
                    flex
                    h-[58px]
                    shrink-0
                    items-center
                    justify-between
                    border-b
                    border-gray-200
                    bg-gray-50
                    px-4
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

                    {showCloseButton && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                rounded-lg
                                p-1.5
                                text-gray-500
                                hover:bg-gray-200
                            "
                            title="Back"
                        >
                            <ArrowLeft
                                size={18}
                            />
                        </button>
                    )}


                    <Mail
                        size={18}
                        className="
                            shrink-0
                            text-gray-600
                        "
                    />


                    <h2
                        className="
                            truncate
                            text-base
                            font-medium
                            text-gray-800
                        "
                        title={
                            message.subject ||
                            "(No Subject)"
                        }
                    >
                        {message.subject ||
                            "(No Subject)"}
                    </h2>

                </div>


                <button
                    type="button"
                    onClick={onClose}
                    className="
                        rounded-lg
                        p-1.5
                        text-gray-500
                        transition
                        hover:bg-gray-200
                        hover:text-gray-800
                    "
                    title="Close"
                >
                    <X size={21} />
                </button>

            </div>


            {/* =================================================
                SCROLLABLE MESSAGE AREA
            ================================================= */}

            <div
                className="
                    min-h-0
                    flex-1
                    overflow-y-auto
                    overflow-x-hidden
                    bg-white
                    p-4
                "
            >

                {/* =================================================
                    MESSAGE HEADER CARD
                ================================================= */}

                <div
                    className="
                        overflow-hidden
                        rounded-lg
                        bg-gray-100
                    "
                >

                    {/* =================================================
                        TOP SENDER ROW
                    ================================================= */}

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            px-3
                            py-3
                        "
                    >

                        {/* SENDER AVATAR */}

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-orange-400
                                text-xs
                                font-semibold
                                text-white
                            "
                        >
                            {getInitial(
                                message.sender
                            )}
                        </div>


                        {/* SENDER */}

                        <div
                            className="
                                min-w-0
                                flex-1
                            "
                        >

                            <div
                                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                "
                            >

                                <span
                                    className="
                                        text-sm
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    {getPersonName(
                                        message.sender
                                    )}
                                </span>


                                {getPersonEmail(
                                    message.sender
                                ) && (
                                    <span
                                        className="
                                            truncate
                                            text-sm
                                            text-gray-500
                                        "
                                    >
                                        {getPersonEmail(
                                            message.sender
                                        )}
                                    </span>
                                )}

                            </div>

                        </div>


                        {/* DRAFT STATUS */}

                        {isDraft && (
                            <span
                                className="
                                    hidden
                                    shrink-0
                                    rounded-full
                                    bg-yellow-100
                                    px-2
                                    py-1
                                    text-[11px]
                                    font-medium
                                    text-yellow-700
                                    sm:inline-flex
                                "
                            >
                                Draft
                            </span>
                        )}


                        {/* ATTACHMENT INDICATOR */}

                        {attachments.length > 0 && (
                            <Paperclip
                                size={18}
                                className="
                                    shrink-0
                                    text-gray-500
                                "
                            />
                        )}


                        {/* DATE */}

                        <span
                            className="
                                hidden
                                shrink-0
                                text-xs
                                text-gray-500
                                sm:block
                            "
                        >
                            {formatShortDate(
                                message.sentAt ||
                                message.createdAt
                            )}
                        </span>


                        {/* =================================================
                            DRAFT EDIT / NORMAL MESSAGE ACTIONS
                        ================================================= */}

                        {isDraft ? (

                            /* -----------------------------------------
                               DRAFT
                            ----------------------------------------- */

                            <button
                                type="button"
                                onClick={
                                    handleEditDraft
                                }
                                className="
                                    rounded-lg
                                    p-1.5
                                    text-gray-600
                                    transition
                                    hover:bg-white
                                    hover:text-indigo-600
                                "
                                title="Edit draft"
                                aria-label="Edit draft"
                            >
                                <Pencil
                                    size={18}
                                />
                            </button>

                        ) : (

                            /* -----------------------------------------
                               NORMAL MESSAGE
                            ----------------------------------------- */

                            !isTrash && (
                                <>
                                    {/* REPLY */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowReply(
                                                true
                                            )
                                        }
                                        className="
                                            rounded-lg
                                            p-1.5
                                            text-gray-600
                                            hover:bg-white
                                            hover:text-indigo-600
                                        "
                                        title="Reply"
                                    >
                                        <Reply
                                            size={18}
                                        />
                                    </button>


                                    {/* REPLY ALL */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowReply(
                                                true
                                            )
                                        }
                                        className="
                                            hidden
                                            rounded-lg
                                            p-1.5
                                            text-gray-600
                                            hover:bg-white
                                            hover:text-indigo-600
                                            sm:block
                                        "
                                        title="Reply all"
                                    >
                                        <ReplyAll
                                            size={18}
                                        />
                                    </button>


                                    {/* FORWARD */}

                                    <button
                                        type="button"
                                        className="
                                            hidden
                                            rounded-lg
                                            p-1.5
                                            text-gray-600
                                            hover:bg-white
                                            hover:text-indigo-600
                                            md:block
                                        "
                                        title="Forward"
                                    >
                                        <Forward
                                            size={18}
                                        />
                                    </button>
                                </>
                            )
                        )}


                        {/* =================================================
                            DELETE / TRASH ACTION
                        ================================================= */}

                        {isTrash ? (

                            <>
                                <button
                                    type="button"
                                    disabled={
                                        actionLoading
                                    }
                                    onClick={
                                        handleRestore
                                    }
                                    className="
                                        rounded-lg
                                        p-1.5
                                        text-gray-600
                                        hover:bg-white
                                        hover:text-green-600
                                        disabled:opacity-50
                                    "
                                    title="Restore"
                                >
                                    {actionLoading ? (
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <RotateCcw
                                            size={18}
                                        />
                                    )}
                                </button>


                                <button
                                    type="button"
                                    disabled={
                                        actionLoading
                                    }
                                    onClick={
                                        handlePermanentDelete
                                    }
                                    className="
                                        rounded-lg
                                        p-1.5
                                        text-gray-600
                                        hover:bg-white
                                        hover:text-red-600
                                        disabled:opacity-50
                                    "
                                    title="Delete permanently"
                                >
                                    <Trash2
                                        size={18}
                                    />
                                </button>
                            </>

                        ) : (

                            <button
                                type="button"
                                disabled={
                                    actionLoading
                                }
                                onClick={
                                    handleTrash
                                }
                                className="
                                    rounded-lg
                                    p-1.5
                                    text-gray-600
                                    hover:bg-white
                                    hover:text-red-600
                                    disabled:opacity-50
                                "
                                title="Move to trash"
                            >
                                <Trash2
                                    size={18}
                                />
                            </button>
                        )}


                        {/* =================================================
                            MORE
                        ================================================= */}

                        <div
                            className="
                                relative
                            "
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setShowMoreMenu(
                                        (value) =>
                                            !value
                                    )
                                }
                                className="
                                    rounded-lg
                                    p-1.5
                                    text-gray-600
                                    hover:bg-white
                                "
                                title="More"
                            >
                                <MoreVertical
                                    size={18}
                                />
                            </button>


                            {showMoreMenu && (
                                <div
                                    className="
                                        absolute
                                        right-0
                                        top-9
                                        z-30
                                        w-44
                                        overflow-hidden
                                        rounded-xl
                                        border
                                        border-gray-200
                                        bg-white
                                        py-1
                                        shadow-xl
                                    "
                                >

                                    {/* EDIT DRAFT */}

                                    {isDraft && (
                                        <button
                                            type="button"
                                            className="
                                                flex
                                                w-full
                                                items-center
                                                gap-2
                                                px-3
                                                py-2
                                                text-left
                                                text-sm
                                                text-gray-600
                                                hover:bg-gray-50
                                            "
                                            onClick={() => {

                                                setShowMoreMenu(
                                                    false
                                                );

                                                handleEditDraft();
                                            }}
                                        >
                                            <Pencil
                                                size={15}
                                            />

                                            Edit draft
                                        </button>
                                    )}


                                    {/* SHOW DETAILS */}

                                    <button
                                        type="button"
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            gap-2
                                            px-3
                                            py-2
                                            text-left
                                            text-sm
                                            text-gray-600
                                            hover:bg-gray-50
                                        "
                                        onClick={() => {

                                            setShowDetails(
                                                true
                                            );

                                            setShowMoreMenu(
                                                false
                                            );
                                        }}
                                    >
                                        <Mail
                                            size={15}
                                        />

                                        Show details
                                    </button>

                                </div>
                            )}

                        </div>

                    </div>


                    {/* =================================================
                        TO / RECIPIENTS
                    ================================================= */}

                    <div
                        className="
                            border-t
                            border-gray-200
                            px-3
                            py-2.5
                        "
                    >

                        {renderRecipientSection(
                            "To",
                            toRecipients
                        )}

                    </div>


                    {/* =================================================
                        COLLAPSED DETAILS
                    ================================================= */}

                    {!showDetails && (
                        <div
                            className="
                                px-3
                                pb-3
                            "
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setShowDetails(
                                        true
                                    )
                                }
                                className="
                                    text-sm
                                    font-medium
                                    text-blue-600
                                    hover:text-blue-700
                                "
                            >
                                Show details
                            </button>

                        </div>
                    )}


                    {/* =================================================
                        EXPANDED DETAILS
                    ================================================= */}

                    {showDetails && (
                        <div
                            className="
                                space-y-2
                                border-t
                                border-gray-200
                                px-3
                                py-3
                            "
                        >

                            {renderRecipientSection(
                                "To",
                                toRecipients
                            )}


                            {renderRecipientSection(
                                "Cc",
                                ccRecipients
                            )}


                            {renderRecipientSection(
                                "Bcc",
                                bccRecipients
                            )}


                            <button
                                type="button"
                                onClick={() =>
                                    setShowDetails(
                                        false
                                    )
                                }
                                className="
                                    flex
                                    items-center
                                    gap-1
                                    pt-1
                                    text-sm
                                    font-medium
                                    text-blue-600
                                    hover:text-blue-700
                                "
                            >
                                Hide details

                                <ChevronUp
                                    size={15}
                                />
                            </button>

                        </div>
                    )}

                </div>


                {/* =================================================
                    ATTACHMENTS
                ================================================= */}

                {attachments.length > 0 && (
                    <div
                        className="
                            mt-3
                        "
                    >

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-3
                                md:grid-cols-2
                            "
                        >

                            {visibleAttachments.map(
                                (
                                    attachment,
                                    index
                                ) => {

                                    const filename =
                                        getAttachmentName(
                                            attachment,
                                            index
                                        );

                                    const fileSize =
                                        getAttachmentSize(
                                            attachment
                                        );

                                    const extension =
                                        getFileExtension(
                                            filename
                                        );

                                    const isDownloading =
                                        downloadingAttachment ===
                                        index;


                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() =>
                                                handleDownloadAttachment(
                                                    attachment,
                                                    index
                                                )
                                            }
                                            disabled={
                                                downloadingAttachment !==
                                                null
                                            }
                                            className="
                                                group
                                                flex
                                                min-w-0
                                                items-center
                                                gap-3
                                                rounded-lg
                                                bg-gray-200
                                                px-3
                                                py-3
                                                text-left
                                                transition
                                                hover:bg-gray-300
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                        >

                                            {/* FILE TYPE */}

                                            <div
                                                className="
                                                    flex
                                                    h-12
                                                    w-12
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-md
                                                    bg-yellow-400
                                                    text-sm
                                                    font-medium
                                                    text-white
                                                "
                                            >

                                                {isDownloading ? (
                                                    <Loader2
                                                        size={20}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    extension
                                                )}

                                            </div>


                                            {/* FILE INFO */}

                                            <div
                                                className="
                                                    min-w-0
                                                    flex-1
                                                "
                                            >

                                                <div
                                                    className="
                                                        truncate
                                                        text-sm
                                                        font-medium
                                                        text-gray-800
                                                    "
                                                    title={
                                                        filename
                                                    }
                                                >
                                                    {filename}
                                                </div>


                                                {fileSize && (
                                                    <div
                                                        className="
                                                            mt-1
                                                            text-xs
                                                            text-gray-500
                                                        "
                                                    >
                                                        {fileSize}
                                                    </div>
                                                )}

                                            </div>


                                            <Download
                                                size={17}
                                                className="
                                                    shrink-0
                                                    text-gray-500
                                                    opacity-0
                                                    transition
                                                    group-hover:opacity-100
                                                "
                                            />

                                        </button>
                                    );
                                }
                            )}

                        </div>


                        {/* ATTACHMENT ACTIONS */}

                        <div
                            className="
                                mt-3
                                flex
                                flex-wrap
                                items-center
                                gap-2
                            "
                        >

                            {attachments.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAllAttachments(
                                            (value) =>
                                                !value
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-1
                                        text-sm
                                        font-medium
                                        text-blue-600
                                        hover:text-blue-700
                                    "
                                >
                                    {showAllAttachments
                                        ? "Show fewer attachments"
                                        : `Show all ${attachments.length} attachments`}

                                    {showAllAttachments ? (
                                        <ChevronUp
                                            size={16}
                                        />
                                    ) : (
                                        <ChevronDown
                                            size={16}
                                        />
                                    )}
                                </button>
                            )}


                            <span
                                className="
                                    hidden
                                    text-gray-300
                                    sm:inline
                                "
                            >
                                |
                            </span>


                            <button
                                type="button"
                                onClick={
                                    handleDownloadAll
                                }
                                disabled={
                                    downloadingAttachment !==
                                    null
                                }
                                className="
                                    text-sm
                                    font-medium
                                    text-blue-600
                                    hover:text-blue-700
                                    disabled:opacity-50
                                "
                            >
                                Download all
                            </button>

                        </div>

                    </div>
                )}


                {/* =================================================
                    MESSAGE BODY
                ================================================= */}

                <div
                    className="
                        px-1
                        py-7
                    "
                >

                    <div
                        className="
                            whitespace-pre-wrap
                            break-words
                            text-sm
                            leading-7
                            text-gray-800
                        "
                    >
                        {message.body ||
                            "(No message content)"}
                    </div>

                </div>


                {/* =================================================
                    REPLY BOX
                   
                    IMPORTANT:
                    Draft messages NEVER show reply box.
                ================================================= */}

                {showReply &&
                    !isTrash &&
                    !isDraft && (
                        <div
                            className="
                                mb-4
                                rounded-xl
                                border
                                border-gray-200
                                bg-gray-50
                                p-4
                            "
                        >

                            <div
                                className="
                                    mb-3
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <Reply
                                        size={16}
                                        className="text-indigo-600"
                                    />

                                    <span
                                        className="
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        Reply
                                    </span>

                                </div>


                                <button
                                    type="button"
                                    onClick={() => {

                                        setShowReply(
                                            false
                                        );

                                        setReplyBody(
                                            ""
                                        );
                                    }}
                                    className="
                                        rounded-lg
                                        p-1.5
                                        text-gray-400
                                        hover:bg-gray-200
                                        hover:text-gray-600
                                    "
                                >
                                    <X size={16} />
                                </button>

                            </div>


                            <textarea
                                value={replyBody}
                                onChange={(event) =>
                                    setReplyBody(
                                        event.target.value
                                    )
                                }
                                rows={5}
                                placeholder="Write your reply..."
                                className="
                                    w-full
                                    resize-y
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    p-4
                                    text-sm
                                    text-gray-700
                                    outline-none
                                    focus:border-indigo-500
                                    focus:ring-2
                                    focus:ring-indigo-100
                                "
                            />


                            <div
                                className="
                                    mt-3
                                    flex
                                    justify-end
                                    gap-2
                                "
                            >

                                <button
                                    type="button"
                                    onClick={() => {

                                        setShowReply(
                                            false
                                        );

                                        setReplyBody(
                                            ""
                                        );
                                    }}
                                    className="
                                        rounded-lg
                                        px-4
                                        py-2
                                        text-sm
                                        text-gray-600
                                        hover:bg-gray-200
                                    "
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    disabled={
                                        actionLoading ||
                                        !replyBody.trim()
                                    }
                                    onClick={
                                        handleReply
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        rounded-lg
                                        bg-indigo-600
                                        px-4
                                        py-2
                                        text-sm
                                        font-semibold
                                        text-white
                                        hover:bg-indigo-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >

                                    {actionLoading ? (
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Send
                                            size={15}
                                        />
                                    )}

                                    Send Reply

                                </button>

                            </div>

                        </div>
                    )}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div
                className="
                    hidden
                    h-8
                    shrink-0
                    items-center
                    justify-between
                    border-t
                    border-gray-100
                    px-4
                    text-[11px]
                    text-gray-400
                    sm:flex
                "
            >

                <span>
                    {message.sentAt
                        ? formatDate(
                            message.sentAt
                        )
                        : ""}
                </span>


                <span
                    className="
                        flex
                        items-center
                        gap-1
                    "
                >
                    <Clock size={11} />
                    DarkMail
                </span>

            </div>

        </div>
    );
};


export default MessageViewer;