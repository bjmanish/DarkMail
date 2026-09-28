const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDirectory = path.join(
    __dirname,
    "../uploads/messages"
);


if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}


const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",

    "application/pdf",

    "text/plain",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-excel",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    "application/vnd.ms-powerpoint",

    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    "application/zip"
]);


const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(file.originalname);

        const uniqueName =
            `${Date.now()}-${crypto.randomUUID()}${extension}`;

        cb(null, uniqueName);
    }
});


const fileFilter = (req, file, cb) => {

    if (!allowedMimeTypes.has(file.mimetype)) {

        return cb(
            new Error(
                `File type not allowed: ${file.mimetype}`
            )
        );
    }

    cb(null, true);
};


const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10
    }
});


module.exports = upload;