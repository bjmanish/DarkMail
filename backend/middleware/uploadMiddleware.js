const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Detect Vercel deployment
const isVercel = Boolean(process.env.VERCEL);

// Local development: backend/uploads/messages
// Vercel: /tmp/uploads/messages
const uploadDir = isVercel
  ? "/tmp/uploads/messages"
  : path.join(__dirname, "..", "uploads", "messages");

// Create the directory if it does not exist.
// recursive: true also creates missing parent directories.
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (error) {
  console.error("Failed to create upload directory:", error);
  throw error;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    const ext = path.extname(file.originalname);

    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Adjust these types to match your application's requirements.
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/zip",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error("File type is not allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
  },
});

module.exports = upload;
