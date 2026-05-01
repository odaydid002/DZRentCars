const express = require("express");
const router = express.Router();
const vehiclesController = require("../controllers/vehiclesController");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../cloudinaryConfig");
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "vehicles",
        public_id: (req, file) => file.fieldname + "-" + Date.now(),
    },
});

const upload = multer({ storage: storage });

router.get("/delete/:id", vehiclesController.deleteVehicle);
router.get("/all", vehiclesController.getVehicles);
router.get("/getStatics", vehiclesController.getStatics);
router.get("/getCarStatics", vehiclesController.getCarsStatics);
router.get("/brands", vehiclesController.getBrands);
router.get("/brands/models/:brand_id", vehiclesController.getBrandVehicles);
router.get("/check/available", vehiclesController.checkAvailability);
router.get("/get/:id/:uid", vehiclesController.getVehicle);
router.get("/update/:id", vehiclesController.updateVehicle);
router.post("/upload", upload.single("image"), vehiclesController.uploadImage);
module.exports = router;
