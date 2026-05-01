const express = require("express");
const multer = require('multer');
const upload = multer()
const router = express.Router();
const {
    getOrders,
    getOrdersbyOffice,
    getStats,
    getCounts,
    getStatsDaily,
    getStatsMonthly,
    getOrder,
    getProfit,
    changeStat,
    deleteOrder,
    rent,
    returnOrder,
    removeOrder,
    getInvoice
} = require("../controllers/orderesController");

router.get("/invoice/:rid", getInvoice);
router.get("/stats", getStats);
router.get("/counts", getCounts);
router.get("/stats/daily", getStatsDaily);
router.get("/stats/monthly", getStatsMonthly);
router.get("/getOrders", getOrders);
router.get("/getOrder", getOrder);
router.get("/getProfit", getProfit);
router.get("/getOrders/:office", getOrdersbyOffice);
router.post("/status", changeStat);
router.post("/delete", removeOrder);
router.get("/remove/:oid", deleteOrder);
router.get("/return/:oid", returnOrder);
router.post("/add", upload.none(), rent);

module.exports = router;
