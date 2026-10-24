const Message = require("../models/Message");

function getAuthenticatedUserId(req) {
  return req.user?._id || req.user?.id || req.user?.Id || null;
}

function getAuthenticatedEmail(req) {
  return String(req.user?.email || req.user?.Email || "")
    .trim()
    .toLowerCase();
}

function getReferenceId(value) {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || value.id || value.Id || "");
  }

  return String(value);
}

function matchesRecipient(recipient, userId, email) {
  if (!recipient) return false;

  if (typeof recipient === "string") {
    return recipient.toLowerCase() === email || recipient === userId;
  }

  if (typeof recipient === "object") {
    const recipientId = getReferenceId(recipient);

    const recipientEmail = String(recipient.email || recipient.Email || "")
      .trim()
      .toLowerCase();

    return recipientId === userId || (email && recipientEmail === email);
  }

  return false;
}

async function findAccessibleMessage(messageId, req) {
  const userId = String(getAuthenticatedUserId(req) || "");
  const email = getAuthenticatedEmail(req);

  if (!userId) {
    const error = new Error("Authentication required.");
    error.statusCode = 401;
    throw error;
  }

  const message = await Message.findById(messageId)
    .select("sender to cc bcc")
    .lean();

  if (!message) {
    const error = new Error("Message not found.");
    error.statusCode = 404;
    throw error;
  }

  const senderId = getReferenceId(message.sender);

  const isSender = senderId === userId;

  const recipientLists = [
    message.to || [],
    message.cc || [],
    message.bcc || [],
  ];

  const isRecipient = recipientLists.some((list) => {
    const recipients = Array.isArray(list) ? list : [list];

    return recipients.some((recipient) =>
      matchesRecipient(recipient, userId, email),
    );
  });

  if (!isSender && !isRecipient) {
    const error = new Error("You are not authorized to access this message.");

    error.statusCode = 403;
    throw error;
  }

  return message;
}

module.exports = {
  getAuthenticatedUserId,
  findAccessibleMessage,
};
