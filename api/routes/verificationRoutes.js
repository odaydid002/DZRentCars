const express = require("express");
const { sendCode, verifyCode } = require("../controllers/verificationController");

const router = express.Router();

router.post("/send-code", sendCode);
router.post("/verify-code", verifyCode);

module.exports = router;