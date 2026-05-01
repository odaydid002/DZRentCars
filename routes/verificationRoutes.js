const express = require("express");
const { sendCode, verifyCode } = require("../api/controllers/verificationController");

const router = express.Router();

router.post("/send-code", sendCode);
router.post("/verify-code", verifyCode);

module.exports = router;