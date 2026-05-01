const { pool } = require("../config/dbConfig");

/**
 * Use a coupon code for a rental
 */
const useCoupon = async (req, res) => {
    try {
        const { code, rental_id } = req.query;

        if (!code || !rental_id) {
            return res.status(400).json({ error: "Code and rental_id are required" });
        }

        const coupon = await pool.query(
            `SELECT * FROM coupons WHERE code = $1 AND is_active = true AND expires_at > NOW()`,
            [code]
        );

        if (coupon.rows.length === 0) {
            return res.status(400).json({ error: "Invalid or expired coupon" });
        }

        // Apply coupon to rental
        await pool.query(
            `UPDATE rentals SET coupon_id = $1 WHERE id = $2`,
            [coupon.rows[0].id, rental_id]
        );

        res.json({ message: "Coupon applied successfully", coupon: coupon.rows[0] });
    } catch (error) {
        console.error("Error using coupon:", error);
        res.status(500).json({ error: "Failed to apply coupon" });
    }
};

/**
 * Check if a coupon is valid
 */
const checkCoupon = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ error: "Code is required" });
        }

        const coupon = await pool.query(
            `SELECT id, code, discount_type, discount_value, is_active, expires_at FROM coupons WHERE code = $1`,
            [code]
        );

        if (coupon.rows.length === 0) {
            return res.status(400).json({ error: "Coupon not found" });
        }

        const c = coupon.rows[0];

        if (!c.is_active || new Date() > new Date(c.expires_at)) {
            return res.status(400).json({ error: "Coupon is expired or inactive" });
        }

        res.json({ valid: true, coupon: c });
    } catch (error) {
        console.error("Error checking coupon:", error);
        res.status(500).json({ error: "Failed to check coupon" });
    }
};

/**
 * Get coupon information
 */
const getCouponInfo = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ error: "Code is required" });
        }

        const coupon = await pool.query(
            `SELECT * FROM coupons WHERE code = $1`,
            [code]
        );

        if (coupon.rows.length === 0) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        res.json(coupon.rows[0]);
    } catch (error) {
        console.error("Error getting coupon info:", error);
        res.status(500).json({ error: "Failed to get coupon info" });
    }
};

/**
 * Get coupon by ID
 */
const getCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await pool.query(
            `SELECT * FROM coupons WHERE id = $1`,
            [id]
        );

        if (coupon.rows.length === 0) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        res.json(coupon.rows[0]);
    } catch (error) {
        console.error("Error getting coupon:", error);
        res.status(500).json({ error: "Failed to get coupon" });
    }
};

/**
 * Get discount by ID
 */
const getDiscount = async (req, res) => {
    try {
        const { id } = req.params;

        const discount = await pool.query(
            `SELECT * FROM discounts WHERE id = $1`,
            [id]
        );

        if (discount.rows.length === 0) {
            return res.status(404).json({ error: "Discount not found" });
        }

        res.json(discount.rows[0]);
    } catch (error) {
        console.error("Error getting discount:", error);
        res.status(500).json({ error: "Failed to get discount" });
    }
};

/**
 * Get all coupons
 */
const getCoupons = async (req, res) => {
    try {
        const coupons = await pool.query(
            `SELECT * FROM coupons WHERE is_active = true ORDER BY created_at DESC`
        );

        res.json(coupons.rows);
    } catch (error) {
        console.error("Error getting coupons:", error);
        res.status(500).json({ error: "Failed to get coupons" });
    }
};

/**
 * Get all discounts
 */
const getDiscounts = async (req, res) => {
    try {
        const discounts = await pool.query(
            `SELECT * FROM discounts WHERE is_active = true ORDER BY created_at DESC`
        );

        res.json(discounts.rows);
    } catch (error) {
        console.error("Error getting discounts:", error);
        res.status(500).json({ error: "Failed to get discounts" });
    }
};

/**
 * Get all coupons and discounts
 */
const getAll = async (req, res) => {
    try {
        const [couponsResult, discountsResult] = await Promise.all([
            pool.query(`SELECT * FROM coupons WHERE is_active = true ORDER BY created_at DESC`),
            pool.query(`SELECT * FROM discounts WHERE is_active = true ORDER BY created_at DESC`)
        ]);

        res.json({
            coupons: couponsResult.rows,
            discounts: discountsResult.rows
        });
    } catch (error) {
        console.error("Error getting all promotions:", error);
        res.status(500).json({ error: "Failed to get promotions" });
    }
};

/**
 * Add a new discount
 */
const addDiscount = async (req, res) => {
    try {
        const { name, description, discount_type, discount_value, start_date, end_date, is_active } = req.body;

        if (!name || !discount_type || discount_value === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await pool.query(
            `INSERT INTO discounts (name, description, discount_type, discount_value, start_date, end_date, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [name, description || null, discount_type, discount_value, start_date || null, end_date || null, is_active !== false]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding discount:", error);
        res.status(500).json({ error: "Failed to add discount" });
    }
};

/**
 * Add a new coupon
 */
const addCoupon = async (req, res) => {
    try {
        const { code, discount_type, discount_value, expires_at, max_uses, is_active } = req.body;

        if (!code || !discount_type || discount_value === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await pool.query(
            `INSERT INTO coupons (code, discount_type, discount_value, expires_at, max_uses, is_active)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [code.toUpperCase(), discount_type, discount_value, expires_at || null, max_uses || null, is_active !== false]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding coupon:", error);
        res.status(500).json({ error: "Failed to add coupon" });
    }
};

/**
 * Remove a coupon (soft delete)
 */
const removeCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            `UPDATE coupons SET is_active = false WHERE id = $1`,
            [id]
        );

        res.json({ message: "Coupon removed successfully" });
    } catch (error) {
        console.error("Error removing coupon:", error);
        res.status(500).json({ error: "Failed to remove coupon" });
    }
};

/**
 * Remove a discount (soft delete)
 */
const removeDiscount = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            `UPDATE discounts SET is_active = false WHERE id = $1`,
            [id]
        );

        res.json({ message: "Discount removed successfully" });
    } catch (error) {
        console.error("Error removing discount:", error);
        res.status(500).json({ error: "Failed to remove discount" });
    }
};

module.exports = {
    useCoupon,
    checkCoupon,
    getCouponInfo,
    getCoupon,
    getDiscount,
    getCoupons,
    getDiscounts,
    getAll,
    addDiscount,
    addCoupon,
    removeCoupon,
    removeDiscount
};
