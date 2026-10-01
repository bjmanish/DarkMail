import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Reply,
  Forward,
  Trash2,
  RotateCcw,
  Mail,
  Paperclip,
  Download,
  User,
  Clock,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getMessageByIdApi,
  markMessageAsReadApi,
  moveMessageToTrashApi,
  restoreMessageApi,
  permanentlyDeleteMessageApi,
  replyToMessageApi,
} from "../../api/messageApi";

const MessageView = () => {
  const { messageId } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");

  /* =====================================================
     LOAD MESSAGE
  ===================================================== */

  const loadMessage = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMessageByIdApi(messageId);

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to load message"
        );
      }

      const data = response?.data || response?.message;

      setMessage(data);

      // Mark as read
      try {
        await markMessageAsReadApi(messageId);
      } catch (readError) {
        console.warn(
          "Unable to mark message as read:",
          readError
        );
      }
    } catch (err) {
      console.error("Load message error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load message."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messageId) {
      loadMessage();
    }
  }, [messageId]);

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =====================================================
     GET USER NAME
  ===================================================== */

  const getPersonName = (person) => {
    if (!person) return "Unknown User";

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

  /* =====================================================
     GET EMAIL
  ===================================================== */

  const getPersonEmail = (person) => {
    if (!person) return "";

    if (typeof person === "string") {
      return person;
    }

    return person.email || person.emailAddress || "";
  };

  /* =====================================================
     GET INITIAL
  ===================================================== */

  const getInitial = (person) => {
    return (
      getPersonName(person)
        ?.charAt(0)
        ?.toUpperCase() || "U"
    );
  };

  /* =====================================================
     NORMALIZE RECIPIENTS
  ===================================================== */

  const normalizeRecipients = (recipients) => {
    if (!recipients) return [];

    if (Array.isArray(recipients)) {
      return recipients;
    }

    return [recipients];
  };

  /* =====================================================
     ATTACHMENTS
  ===================================================== */

  const getAttachmentUrl = (index) => {
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      "http://localhost:3000/api";

    return `${baseUrl}/messages/${messageId}/attachments/${index}`;
  };

  /* =====================================================
     MOVE TO TRASH
  ===================================================== */

  const handleTrash = async () => {
    if (!messageId) return;

    try {
      setActionLoading(true);

      const response =
        await moveMessageToTrashApi(messageId);

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to move message to trash."
        );
      }

      navigate(-1);
    } catch (err) {
      console.error("Trash error:", err);

      alert(
        err?.response?.data?.message ||
          err?.message ||
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
    if (!messageId) return;

    try {
      setActionLoading(true);

      const response =
        await restoreMessageApi(messageId);

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to restore message."
        );
      }

      await loadMessage();
    } catch (err) {
      console.error("Restore error:", err);

      alert(
        err?.response?.data?.message ||
          err?.message ||
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
    if (!messageId) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this message?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const response =
        await permanentlyDeleteMessageApi(messageId);

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to permanently delete message."
        );
      }

      navigate("/user/trash");
    } catch (err) {
      console.error("Permanent delete error:", err);

      alert(
        err?.response?.data?.message ||
          err?.message ||
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

      const response = await replyToMessageApi(
        messageId,
        replyBody.trim()
      );

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to send reply."
        );
      }

      setReplyBody("");
      setShowReply(false);

      alert("Reply sent successfully.");

      await loadMessage();
    } catch (err) {
      console.error("Reply error:", err);

      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to send reply."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={34}
            className="animate-spin text-indigo-600"
          />

          <p className="text-sm text-gray-500">
            Loading message...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !message) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle size={28} />
          </div>

          <h2 className="text-lg font-bold text-gray-900">
            Message not found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || "This message could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <ArrowLeft size={17} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     MESSAGE DATA
  ===================================================== */

  const sender = message.sender;

  const toRecipients = normalizeRecipients(message.to);
  const ccRecipients = normalizeRecipients(message.cc);
  const bccRecipients = normalizeRecipients(message.bcc);

  const attachments = Array.isArray(message.attachments)
    ? message.attachments
    : [];

  const isTrash =
    message.deletedBy &&
    Array.isArray(message.deletedBy) &&
    message.deletedBy.length > 0;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* =================================================
          TOP TOOLBAR
      ================================================= */}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              px-3
              py-2
              text-sm
              font-medium
              text-gray-600
              hover:bg-gray-100
            "
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">
              Back
            </span>
          </button>

          <div className="h-6 w-px bg-gray-200" />

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Mail size={19} />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Reply */}
          {!isTrash && (
            <button
              type="button"
              onClick={() => setShowReply((prev) => !prev)}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                px-3
                py-2
                text-sm
                font-medium
                text-gray-600
                hover:bg-gray-100
              "
            >
              <Reply size={18} />

              <span className="hidden sm:inline">
                Reply
              </span>
            </button>
          )}

          {/* Restore */}
          {isTrash && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRestore}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                px-3
                py-2
                text-sm
                font-medium
                text-indigo-600
                hover:bg-indigo-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RotateCcw size={18} />

              <span className="hidden sm:inline">
                Restore
              </span>
            </button>
          )}

          {/* Trash */}
          {!isTrash && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleTrash}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                px-3
                py-2
                text-sm
                font-medium
                text-red-600
                hover:bg-red-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Trash2 size={18} />

              <span className="hidden sm:inline">
                Trash
              </span>
            </button>
          )}

          {/* Permanent delete */}
          {isTrash && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handlePermanentDelete}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                px-3
                py-2
                text-sm
                font-medium
                text-red-600
                hover:bg-red-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Trash2 size={18} />

              <span className="hidden sm:inline">
                Delete Permanently
              </span>
            </button>
          )}
        </div>
      </div>

      {/* =================================================
          MESSAGE CARD
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* -------------------------------------------------
            SUBJECT
        ------------------------------------------------- */}

        <div className="border-b border-gray-200 px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Mail size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="break-words text-xl font-bold text-gray-900 sm:text-2xl">
                {message.subject || "(No Subject)"}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(
                    message.sentAt ||
                      message.createdAt
                  )}
                </span>

                {message.status && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium uppercase">
                    {message.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------
            SENDER
        ------------------------------------------------- */}

        <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
              {getInitial(sender)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2">
                <span className="font-semibold text-gray-900">
                  {getPersonName(sender)}
                </span>

                {getPersonEmail(sender) && (
                  <span className="break-all text-sm text-gray-500">
                    &lt;{getPersonEmail(sender)}&gt;
                  </span>
                )}
              </div>

              {/* TO */}
              {toRecipients.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 text-sm text-gray-500">
                  <span className="font-medium">
                    To:
                  </span>

                  {toRecipients.map((person, index) => (
                    <span key={index}>
                      {getPersonEmail(person) ||
                        getPersonName(person)}
                      {index <
                      toRecipients.length - 1
                        ? ","
                        : ""}
                    </span>
                  ))}
                </div>
              )}

              {/* CC */}
              {ccRecipients.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1 text-sm text-gray-500">
                  <span className="font-medium">
                    Cc:
                  </span>

                  {ccRecipients.map((person, index) => (
                    <span key={index}>
                      {getPersonEmail(person) ||
                        getPersonName(person)}
                      {index <
                      ccRecipients.length - 1
                        ? ","
                        : ""}
                    </span>
                  ))}
                </div>
              )}

              {/* BCC */}
              {bccRecipients.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1 text-sm text-gray-500">
                  <span className="font-medium">
                    Bcc:
                  </span>

                  {bccRecipients.map((person, index) => (
                    <span key={index}>
                      {getPersonEmail(person) ||
                        getPersonName(person)}
                      {index <
                      bccRecipients.length - 1
                        ? ","
                        : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden items-center gap-1 text-xs text-gray-400 sm:flex">
              <Clock size={14} />
              {formatDate(
                message.sentAt ||
                  message.createdAt
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------
            MESSAGE BODY
        ------------------------------------------------- */}

        <div className="px-5 py-7 sm:px-7">
          <div
            className="
              max-w-none
              whitespace-pre-wrap
              break-words
              text-sm
              leading-7
              text-gray-800
              sm:text-base
            "
          >
            {message.body || "(No message content)"}
          </div>
        </div>

        {/* -------------------------------------------------
            ATTACHMENTS
        ------------------------------------------------- */}

        {attachments.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-5 sm:px-7">
            <div className="mb-4 flex items-center gap-2">
              <Paperclip
                size={18}
                className="text-gray-500"
              />

              <h3 className="text-sm font-semibold text-gray-900">
                Attachments ({attachments.length})
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {attachments.map((attachment, index) => {
                const filename =
                  attachment?.filename ||
                  attachment?.originalname ||
                  attachment?.name ||
                  `Attachment ${index + 1}`;

                const size =
                  attachment?.size || 0;

                return (
                  <a
                    key={index}
                    href={getAttachmentUrl(index)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50
                      p-3
                      transition
                      hover:border-indigo-200
                      hover:bg-indigo-50
                    "
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                      <Paperclip size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {filename}
                      </p>

                      {size > 0 && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {formatFileSize(size)}
                        </p>
                      )}
                    </div>

                    <Download
                      size={17}
                      className="shrink-0 text-gray-400"
                    />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------------------------------------
            REPLY BOX
        ------------------------------------------------- */}

        {showReply && !isTrash && (
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-5 sm:px-7">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Reply
                  size={18}
                  className="text-indigo-600"
                />

                <h3 className="text-sm font-semibold text-gray-900">
                  Reply to {getPersonName(sender)}
                </h3>
              </div>

              <textarea
                value={replyBody}
                onChange={(e) =>
                  setReplyBody(e.target.value)
                }
                placeholder="Write your reply..."
                rows={6}
                className="
                  w-full
                  resize-y
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  p-4
                  text-sm
                  text-gray-800
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-indigo-500
                  focus:bg-white
                  focus:ring-2
                  focus:ring-indigo-100
                "
              />

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReply(false);
                    setReplyBody("");
                  }}
                  className="
                    rounded-xl
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-600
                    hover:bg-gray-100
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
                  onClick={handleReply}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-indigo-600
                    px-5
                    py-2.5
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
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  <Reply size={16} />

                  Send Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------
            BOTTOM ACTIONS
        ------------------------------------------------- */}

        {!isTrash && (
          <div className="border-t border-gray-200 px-5 py-4 sm:px-7">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowReply(true)
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-gray-200
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                "
              >
                <Reply size={17} />
                Reply
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleTrash}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-red-200
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-red-600
                  hover:bg-red-50
                "
              >
                <Trash2 size={17} />
                Move to Trash
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================
   FILE SIZE FORMAT
======================================================== */

const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) {
    return "";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  const unitIndex = Math.min(
    index,
    units.length - 1
  );

  const value =
    bytes / Math.pow(1024, unitIndex);

  return `${value.toFixed(
    unitIndex === 0 ? 0 : 1
  )} ${units[unitIndex]}`;
};

export default MessageView;