export const idOf = (m) =>
  m?.Id ?? m?.id ?? m?._id ?? m?.MessageId ?? m?.messageId ?? "";
export const subjectOf = (m) => m?.Subject ?? m?.subject ?? "(No subject)";
export const bodyOf = (m) => m?.Body ?? m?.body ?? "";
export const senderNameOf = (m) =>
  m?.SenderName ??
  m?.senderName ??
  m?.sender?.Name ??
  m?.sender?.name ??
  m?.SenderEmail ??
  m?.sender?.email ??
  "Unknown sender";
export const senderEmailOf = (m) =>
  m?.SenderEmail ??
  m?.senderEmail ??
  m?.sender?.Email ??
  m?.sender?.email ??
  "";
export const dateOf = (m) =>
  m?.SentAt ??
  m?.sentAt ??
  m?.CreatedAt ??
  m?.createdAt ??
  m?.UpdatedAt ??
  m?.updatedAt;
export const attachmentsOf = (m) => m?.attachments ?? m?.Attachments ?? [];
export const formatTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
};
export const formatFullDate = (value) => {
  if (!value) return "Date unavailable";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Date unavailable" : d.toLocaleString();
};
export const initialOf = (name) =>
  String(name || "?")
    .trim()
    .charAt(0)
    .toUpperCase() || "?";
export const normalizeListResponse = (data) => {
  const raw =
    data?.messages ?? data?.data?.messages ?? data?.items ?? data?.data ?? data;
  return Array.isArray(raw) ? raw : [];
};
