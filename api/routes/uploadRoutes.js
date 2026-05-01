const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/:type", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // Construct the full URL for the uploaded image
    const imageUrl = `${req.protocol}://${req.get("host")}/assets/${req.params.type}/${req.file.filename}`;

    res.status(200).json({
        message: "File uploaded successfully",
        src: imageUrl
    });
});

module.exports = router;
