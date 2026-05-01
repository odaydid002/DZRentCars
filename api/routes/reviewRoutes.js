const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviewsController");


router.get("/reviews", reviewsController.getReviews);
router.get("/review/:id", reviewsController.getReview);
router.get("/reports", reviewsController.getReports);
router.get("/statics", reviewsController.getStatics);
router.get("/statics/year", reviewsController.getStaticsPY);
router.post("/report", reviewsController.report);
router.delete("/delete/review/:id", reviewsController.removeReview);
module.exports = router;
