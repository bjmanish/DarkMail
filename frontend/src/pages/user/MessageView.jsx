import React, { useState } from "react";

import {
    ArrowLeft,
    Reply,
    Trash2,
    RotateCcw,
    Paperclip,
    Download,
    Calendar,
    Clock,
    Loader2,
} from "lucide-react";

import {
    moveMessageToTrashApi,
    restoreMessageApi,
    permanentlyDeleteMessageApi,
    replyToMessageApi,
    downloadAttachmentApi,
} from "../../api/messageApi";


const MessageView = ({
    message,
    onClose,
    onMessageDeleted,
    onMessageUpdated,
    showCloseButton = false,
}) => {

    /* =====================================================
       STATE
    ===================================================== */

    const [actionLoading, setActionLoading] =
        useState(false);

    const [showReply, setShowReply] =
        useState(false);

    const [replyBody, setReplyBody] =
        useState("");

    /*
     * Index of attachment currently downloading.
     *
     * null  = nothing downloading
     * 0     = first attachment
     * 1     = second attachment
     */

    const [downloadingAttachment, setDownloadingAttachment] =
        useState(null);


    /* =====================================================
       NO MESSAGE SELECTED
    ===================================================== */

    if (!message) {

        return (
            <div className="flex h-full min-h-[500px] items-center justify-center bg-white">

                <div className="px-6 text-center">

                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">

                        <svg
                            width="38"
                            height="38"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-indigo-500"
                        >

                            <path
                                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                            />

                            <polyline points="22,6 12,13 2,6" />

                        </svg>

                    </div>


                    <h2 className="text-lg font-semibold text-gray-700">
                        Select a message
                    </h2>


                    <p className="mt-2 max-w-sm text-sm text-gray-400">
                        Select an email from the list to view the message here.
                    </p>

                </div>

            </div>
        );
    }


    /* =====================================================
       PERSON HELPERS
    ===================================================== */

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


    /* =====================================================
       RECIPIENTS
    ===================================================== */

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


    /* =====================================================
       DATE
    ===================================================== */

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


    /* =====================================================
       ATTACHMENTS
    ===================================================== */

    const attachments =
        Array.isArray(message.attachments)
            ? message.attachments
            : [];


    /* =====================================================
       DOWNLOAD ATTACHMENT
    ===================================================== */

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


            /*
             * Prevent another attachment from being
             * downloaded while one is already downloading.
             */

            if (
                downloadingAttachment !== null
            ) {
                return;
            }


            setDownloadingAttachment(
                index
            );


            const filename =
                attachment?.filename ||
                attachment?.originalname ||
                attachment?.originalName ||
                attachment?.name ||
                `Attachment ${index + 1}`;


            console.log(
                "Downloading attachment:",
                {
                    messageId: message._id,
                    attachmentIndex: index,
                    filename,
                }
            );


            /*
             * IMPORTANT:
             *
             * Do NOT use:
             *
             * window.open()
             * <a href="...">
             * window.location.href
             *
             * The request must go through Axios so that
             * axios.js adds:
             *
             * Authorization: Bearer <JWT>
             */

            const response =
                await downloadAttachmentApi(
                    message._id,
                    index
                );


            console.log(
                "Attachment response:",
                {
                    status: response?.status,
                    contentType:
                        response?.headers?.[
                            "content-type"
                        ],
                }
            );


            /*
             * Convert response into Blob.
             */

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


            /*
             * Create temporary browser URL.
             */

            const downloadUrl =
                window.URL.createObjectURL(
                    blob
                );


            /*
             * Create temporary download element.
             *
             * This is SAFE because this link points to
             * the locally-created Blob URL, NOT the
             * protected backend URL.
             */

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


            /*
             * Start browser download.
             */

            link.click();


            /*
             * Cleanup.
             */

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


            console.error(
                "Attachment download status:",
                error?.response?.status
            );


            let errorMessage =
                "Unable to download attachment.";


            /*
             * Because the request uses:
             *
             * responseType: "blob"
             *
             * backend JSON errors may also arrive
             * as Blob.
             */

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
                    "Attachment error parsing failed:",
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


    /* =====================================================
       CHECK TRASH
    ===================================================== */

    const isTrash =
        Array.isArray(message.deletedBy) &&
        message.deletedBy.length > 0;


    /* =====================================================
       MOVE TO TRASH
    ===================================================== */

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


    /* =====================================================
       RESTORE
    ===================================================== */

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


    /* =====================================================
       PERMANENT DELETE
    ===================================================== */

    const handlePermanentDelete = async () => {

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


    /* =====================================================
       REPLY
    ===================================================== */

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


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="flex h-full min-h-0 flex-col bg-white">

            {/* =================================================
                MESSAGE HEADER
            ================================================= */}

            <div className="
                shrink-0
                border-b
                border-gray-200
                px-4
                py-3
            ">

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                ">

                    <div className="
                        flex
                        items-center
                        gap-2
                    ">

                        {showCloseButton && (

                            <button
                                type="button"
                                onClick={onClose}
                                className="
                                    rounded-lg
                                    p-2
                                    text-gray-500
                                    hover:bg-gray-100
                                "
                                title="Close"
                            >

                                <ArrowLeft
                                    size={19}
                                />

                            </button>

                        )}


                        <h2 className="
                            text-sm
                            font-semibold
                            text-gray-700
                        ">
                            Message
                        </h2>

                    </div>


                    <div className="
                        flex
                        items-center
                        gap-1
                    ">

                        {!isTrash && (

                            <button
                                type="button"
                                onClick={() =>
                                    setShowReply(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                className="
                                    rounded-lg
                                    p-2
                                    text-gray-500
                                    hover:bg-indigo-50
                                    hover:text-indigo-600
                                "
                                title="Reply"
                            >

                                <Reply
                                    size={18}
                                />

                            </button>

                        )}


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
                                        p-2
                                        text-gray-500
                                        hover:bg-green-50
                                        hover:text-green-600
                                        disabled:opacity-50
                                    "
                                    title="Restore"
                                >

                                    <RotateCcw
                                        size={18}
                                    />

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
                                        p-2
                                        text-gray-500
                                        hover:bg-red-50
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
                                    p-2
                                    text-gray-500
                                    hover:bg-red-50
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

                    </div>

                </div>

            </div>


            {/* =================================================
                MESSAGE CONTENT
            ================================================= */}

            <div className="
                min-h-0
                flex-1
                overflow-y-auto
            ">

                {/* SUBJECT */}

                <div className="
                    border-b
                    border-gray-100
                    px-5
                    py-5
                ">

                    <h1 className="
                        break-words
                        text-xl
                        font-bold
                        text-gray-900
                    ">

                        {message.subject ||
                            "(No Subject)"}

                    </h1>


                    <div className="
                        mt-2
                        flex
                        flex-wrap
                        items-center
                        gap-3
                        text-xs
                        text-gray-400"
                    >
                        <span className="
                            flex
                            items-center
                            gap-1"
                        >

                            <Calendar
                                size={13}
                            />

                            {formatDate(
                                message.sentAt ||
                                message.createdAt
                            )}

                        </span>


                        {message.status && (

                            <span className="
                                rounded-full
                                bg-gray-100
                                px-2
                                py-1
                                font-medium
                                uppercase
                            ">

                                {message.status}

                            </span>

                        )}

                    </div>

                </div>


                {/* SENDER */}

                <div className="
                    border-b
                    border-gray-100
                    px-5
                    py-4
                ">

                    <div className="
                        flex
                        items-start
                        gap-3
                    ">

                        <div className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-indigo-600
                            font-semibold
                            text-white
                        ">

                            {getInitial(
                                message.sender
                            )}

                        </div>


                        <div className="
                            min-w-0
                            flex-1
                        ">

                            <div className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                            ">

                                <span className="
                                    font-semibold
                                    text-gray-900
                                ">

                                    {getPersonName(
                                        message.sender
                                    )}

                                </span>


                                {getPersonEmail(
                                    message.sender
                                ) && (

                                    <span className="
                                        break-all
                                        text-xs
                                        text-gray-400
                                    ">

                                        &lt;

                                        {getPersonEmail(
                                            message.sender
                                        )}

                                        &gt;

                                    </span>

                                )}

                            </div>


                            {/* TO */}

                            {toRecipients.length > 0 && (

                                <div className="
                                    mt-1
                                    text-xs
                                    text-gray-500
                                ">

                                    <span className="
                                        font-medium
                                    ">
                                        To:
                                    </span>{" "}

                                    {toRecipients
                                        .map(
                                            (person) =>
                                                getPersonEmail(
                                                    person
                                                ) ||
                                                getPersonName(
                                                    person
                                                )
                                        )
                                        .join(", ")}

                                </div>

                            )}


                            {/* CC */}

                            {ccRecipients.length > 0 && (

                                <div className="
                                    mt-1
                                    text-xs
                                    text-gray-500
                                ">

                                    <span className="
                                        font-medium
                                    ">
                                        Cc:
                                    </span>{" "}

                                    {ccRecipients
                                        .map(
                                            (person) =>
                                                getPersonEmail(
                                                    person
                                                ) ||
                                                getPersonName(
                                                    person
                                                )
                                        )
                                        .join(", ")}

                                </div>

                            )}


                            {/* BCC */}

                            {bccRecipients.length > 0 && (

                                <div className="
                                    mt-1
                                    text-xs
                                    text-gray-500
                                ">

                                    <span className="
                                        font-medium
                                    ">
                                        Bcc:
                                    </span>{" "}

                                    {bccRecipients
                                        .map(
                                            (person) =>
                                                getPersonEmail(
                                                    person
                                                ) ||
                                                getPersonName(
                                                    person
                                                )
                                        )
                                        .join(", ")}

                                </div>

                            )}

                        </div>

                    </div>

                </div>


                {/* BODY */}

                <div className="
                    px-5
                    py-6
                ">

                    <div className="
                        whitespace-pre-wrap
                        break-words
                        text-sm
                        leading-7
                        text-gray-800
                    ">

                        {message.body ||
                            "(No message content)"}

                    </div>

                </div>


                {/* =================================================
                    ATTACHMENTS
                ================================================= */}

                {attachments.length > 0 && (

                    <div className="
                        border-t
                        border-gray-100
                        px-5
                        py-5
                    ">

                        <div className="
                            mb-3
                            flex
                            items-center
                            gap-2
                        ">

                            <Paperclip
                                size={17}
                                className="
                                    text-gray-500
                                "
                            />


                            <h3 className="
                                text-sm
                                font-semibold
                                text-gray-800
                            ">

                                Attachments (
                                {attachments.length}
                                )

                            </h3>

                        </div>


                        <div className="
                            space-y-2
                        ">

                            {attachments.map(
                                (
                                    attachment,
                                    index
                                ) => {

                                    const filename =
                                        attachment?.filename ||
                                        attachment?.originalname ||
                                        attachment?.originalName ||
                                        attachment?.name ||
                                        `Attachment ${
                                            index + 1
                                        }`;


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
                                                flex
                                                w-full
                                                items-center
                                                gap-3
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-gray-50
                                                p-3
                                                text-left
                                                transition
                                                hover:border-indigo-200
                                                hover:bg-indigo-50
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                            title={
                                                isDownloading
                                                    ? "Downloading..."
                                                    : `Download ${filename}`
                                            }
                                        >

                                            {/* ATTACHMENT ICON */}

                                            <div className="
                                                flex
                                                h-9
                                                w-9
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-lg
                                                bg-white
                                                text-indigo-600
                                                shadow-sm
                                            ">

                                                {isDownloading ? (

                                                    <Loader2
                                                        size={17}
                                                        className="
                                                            animate-spin
                                                        "
                                                    />

                                                ) : (

                                                    <Paperclip
                                                        size={17}
                                                    />

                                                )}

                                            </div>


                                            {/* FILE NAME */}

                                            <span className="
                                                min-w-0
                                                flex-1
                                                truncate
                                                text-left
                                                text-sm
                                                text-gray-700
                                            ">

                                                {filename}

                                            </span>


                                            {/* DOWNLOAD ICON / STATUS */}

                                            {isDownloading ? (

                                                <span className="
                                                    shrink-0
                                                    text-xs
                                                    font-medium
                                                    text-indigo-600
                                                ">
                                                    Downloading...
                                                </span>

                                            ) : (

                                                <Download
                                                    size={16}
                                                    className="
                                                        shrink-0
                                                        text-gray-400
                                                    "
                                                />

                                            )}

                                        </button>

                                    );
                                }
                            )}

                        </div>

                    </div>

                )}


                {/* =================================================
                    REPLY
                ================================================= */}

                {showReply && !isTrash && (

                    <div className="
                        border-t
                        border-gray-200
                        bg-gray-50
                        px-5
                        py-5
                    ">

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
                                outline-none
                                focus:border-indigo-500
                                focus:ring-2
                                focus:ring-indigo-100
                            "
                        />


                        <div className="
                            mt-3
                            flex
                            justify-end
                            gap-2
                        ">

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

                                {actionLoading && (

                                    <Loader2
                                        size={15}
                                        className="
                                            animate-spin
                                        "
                                    />

                                )}


                                <Reply
                                    size={15}
                                />

                                Send Reply

                            </button>

                        </div>

                    </div>

                )}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="
                hidden
                shrink-0
                border-t
                border-gray-100
                px-5
                py-2
                text-xs
                text-gray-400
                sm:flex
                sm:items-center
                sm:justify-between
            ">

                <span>

                    {message.sentAt
                        ? formatDate(
                            message.sentAt
                        )
                        : ""}

                </span>


                <span className="
                    flex
                    items-center
                    gap-1
                ">

                    <Clock
                        size={12}
                    />

                    DarkMail

                </span>

            </div>

        </div>
    );
};


export default MessageView;