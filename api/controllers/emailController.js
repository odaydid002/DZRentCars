const { pool } = require("../config/dbConfig")
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const sendEmail = async ({ to, subject = "", html = "Empty" }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
};

exports.sendEmail = sendEmail;

exports.sendMessage = async (req, res) => {
    const { to, subject = "DZRentCars", msg = "Empty" } = req.body;

    if (!to) return res.status(400).json({ error: "Email is required" });

    try {
        await sendEmail({ to: to, subject, html: msg });
        res.json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error.message);
        res.status(500).json({ error: "Failed to send email" });
    }
};

exports.sendLoginLink = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

        if (result.rows.length > 0) {
            return res.status(409).json({ error: "Email already exists" }); // 409 Conflict
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "30m" });
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        await pool.query(
            `INSERT INTO user_tokens (email, token, expires_at) VALUES ($1, $2, $3)`,
            [email, token, expiresAt]
        );

        const prodUrl = process.env.PROD_URL || `http://localhost:${process.env.PORT}`;
        const loginLink = `${prodUrl}/signup?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Login Link",
            html: `
                <h1>DZRentCars</h1>
                <img src="https://i.ibb.co/NnZVzj1T/logo.png" alt="Picture" width="100" />
                <p>This link will expire in 30 minutes for your security.</p>
                <a href="${loginLink}" style="padding: 0.5em 1em; background-color: orange; color: white; border-radius: 8px; text-decoration: none;">Click Here</a>
                <p style="color: red; font-size: 0.8rem;">Do not share this message with anyone.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Login link sent successfully" });

    } catch (error) {
        console.error("Error sending login link:", error.message);
        res.status(500).json({ error: "Failed to send login link" });
    }
};

exports.verifyToken = async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ error: "Token is required" });

    try {
        // Check if token exists in the database
        const result = await pool.query(
            `SELECT email, expires_at FROM user_tokens WHERE token = $1`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        const { email, expires_at } = result.rows[0];

        // Check if token is expired
        if (new Date() > new Date(expires_at)) {
            return res.status(400).json({ error: "Token expired" });
        }

        res.json({ message: "Token valid", email });

    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const deleteExpiredTokens = async () => {
    try {
        await pool.query(`DELETE FROM user_tokens WHERE expires_at < NOW()`);
        console.log("Expired tokens deleted");
    } catch (error) {
        console.error("Error deleting expired tokens:", error);
    }
};

setInterval(deleteExpiredTokens, 60 * 60 * 1000);
