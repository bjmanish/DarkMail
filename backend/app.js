const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const messageRoutes = require("./routes/messages");
const attachmentRoutes = require("./routes/attachments");

const app = express();

/* =========================================================
   CORS CONFIGURATION
========================================================= */

const allowedOrigins = [
  process.env.CLIENT_URL,

  // Local development
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  // Local LAN frontend
  "http://172.16.21.189:5173",

  // Vercel frontend
  "https://dark-mail.vercel.app",
].filter(Boolean);

/* =========================================================
   CHECK WHETHER ORIGIN IS ALLOWED
========================================================= */

const isAllowedOrigin = (origin) => {
  // Allow requests without an Origin header.
  // Examples: Postman and server-to-server requests.
  if (!origin) {
    return true;
  }

  // Exact allowed origins
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow localhost on any port
  if (/^https?:\/\/localhost:\d+$/.test(origin)) {
    return true;
  }

  // Allow 127.0.0.1 on any port
  if (/^https?:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
    return true;
  }

  // Allow 192.168.x.x on any port
  if (/^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(origin)) {
    return true;
  }

  // Allow 172.16.x.x through 172.31.x.x on any port
  if (
    /^https?:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/.test(origin)
  ) {
    return true;
  }

  // Allow 10.x.x.x on any port
  if (/^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(origin)) {
    return true;
  }

  return false;
};

/* =========================================================
   CORS MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.warn("CORS blocked origin:", origin);

      return callback(new Error(`CORS policy blocked origin: ${origin}`));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],

    exposedHeaders: ["Content-Disposition"],
  }),
);

/* =========================================================
   BODY PARSERS
========================================================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/* =========================================================
   API TEST
========================================================= */

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DarkMail API is running",
  });
});

/* =========================================================
   AUTH ROUTES
========================================================= */

app.use("/api/auth", authRoutes);

/* =========================================================
   EMPLOYEE ROUTES
========================================================= */

app.use("/api/employees", employeeRoutes);

/* =========================================================
   MESSAGE ROUTES
========================================================= */

app.use("/api/messages", messageRoutes);

/* =========================================================
   ATTACHMENT ROUTES
========================================================= */

// Upload multiple files, list message attachments,
// download individual attachments, and delete attachments.
app.use("/api/attachments", attachmentRoutes);

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("API Error:", err.message);

  // CORS error
  if (err.message && err.message.startsWith("CORS policy blocked origin:")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  // Multer upload errors
  if (err.name === "MulterError") {
    let message = "File upload failed.";

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Each file must be 10 MB or smaller.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "You can upload a maximum of 10 files.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field. Use the field name 'files'.";
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Invalid file type
  if (err.message && err.message.startsWith("File type is not allowed:")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode < 500 || process.env.NODE_ENV !== "production"
        ? err.message
        : "Internal server error",
  });
});

/* =========================================================
   EXPORT APP
========================================================= */

module.exports = app;
