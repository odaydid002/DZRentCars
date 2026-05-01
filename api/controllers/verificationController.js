process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = require("../config/twilioConfig");
const { pool } = require("../config/dbConfig")
const { storeCode, getCode } = require("../models/verificationModel");

/*
const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: process.env.VONAGE_KEY,
  apiSecret: process.env.VONAGE_AUTH
})

const sendCode = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    const code = Math.floor(100000 + Math.random() * 900000);
    storeCode(phone, code);

    try {
        await vonage.sms.send({
            to: phone,
            from: "VerifyApp",
            text: `Your verification code is: ${code}`
        });
        res.json({ message: "Verification code sent!" });
    } catch (error) {
        res.status(500).json({ message: "Failed to send SMS", error });
    }
};*/

const sendCode = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    const code = Math.floor(100000 + Math.random() * 900000);
    storeCode(phone, code);

    try {
        await client.messages.create({
            body: `Your verification code is: ${code}`,
            from: process.env.TWILIO_PHONE,
            to: phone,
        });
        res.json({ message: "Verification code sent!" });
    } catch (error) {
        res.status(500).json({ message: "Failed to send SMS", error });
    }
};

const  verifyCode = async (req, res) => {
    const { phone, code, id } = req.body;
    const storedCode = getCode(phone);

    if (storedCode && storedCode == code) {
        await pool.query(`UPDATE users SET phone_status = TRUE WHERE id = $1`, [id]);
        res.redirect(`/login`);
    } else {
        res.status(400).json({ message: "Invalid verification code" });
    }
};

module.exports = { sendCode, verifyCode };
