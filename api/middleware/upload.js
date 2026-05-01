const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// ✅ Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const { type } = req.params; // e.g., "users", "cars"
        return {
            folder: `uploads/${type}`, // Save in Cloudinary folder based on type
            allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
            public_id: Date.now() + "-" + Math.round(Math.random() * 1e9),
        };
    },
});

// ✅ File Filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// ✅ Upload Middleware
const upload = multer({ storage, fileFilter });

module.exports = upload;
