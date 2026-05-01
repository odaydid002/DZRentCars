const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();
const discountsController = require("../controllers/discountsController");

router.get("/coupon/use", discountsController.useCoupon);
router.get("/coupon/check", discountsController.checkCoupon);
router.get("/coupon/info", discountsController.getCouponInfo);
router.get("/coupon/:id", discountsController.getCoupon);
router.get("/discount/:id", discountsController.getDiscount);
router.get("/coupons/all", discountsController.getCoupons);
router.get("/discounts/all", discountsController.getDiscounts);
router.get("/all", discountsController.getAll);
router.post("/add/discount",upload.none(), discountsController.addDiscount);
router.post("/add/coupon",upload.none(), discountsController.addCoupon);
router.get("/delete/coupon/:id", discountsController.removeCoupon);
router.get("/delete/discount/:id", discountsController.removeDiscount);
module.exports = router;
