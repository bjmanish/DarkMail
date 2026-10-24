const mongoose = require("mongoose");

const messageAttachmentSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    storedFileName: {
      type: String,
      required: true,
      unique: true,
    },

    contentType: {
      type: String,
      required: true,
      maxlength: 150,
    },

    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },

    storagePath: {
      type: String,
      required: true,
    },

    storageProvider: {
      type: String,
      enum: ["local"],
      default: "local",
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

messageAttachmentSchema.index({
  messageId: 1,
  isDeleted: 1,
  createdAt: 1,
});

messageAttachmentSchema.index({
  senderId: 1,
  createdAt: -1,
});

module.exports = mongoose.model("MessageAttachment", messageAttachmentSchema);
