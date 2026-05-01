const { pool } = require("../config/dbConfig");

const useCoupon = async (req, res) => {
    try {
        const { cid, uid } = req.body

        if (!cid || !uid) return res.status(400).json({error: "ID REQUIRED!"})

        await pool.query(`
            INSERT INTO coupons_use (coupon_id, user_id) VALUES ($1, $2)
        `, [cid, uid])
        res.status(200).json({
            message: "Coupon Used Successfully!"
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getCouponInfo = async (req, res) => {
    try {
        const { code } = req.query

        if (!code) return res.status(400).json({error: "Code REQUIRED!"})

        const coupon = await pool.query(`
            SELECT * FROM coupons
            WHERE code = $1
        `, [code])

        if(coupon.rows.length == 0) return res.status(400).json({message: "Coupon not found"})

        res.status(200).json({
            result: coupon.rows[0]
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getCoupon = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) return res.status(400).json({error: "ID REQUIRED!"})

        const discounts = await pool.query(`
            SELECT * FROM coupons
            WHERE id = $1
        `, [id])
        res.status(200).json({
            data: discounts.rows[0]
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getDiscount = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) return res.status(400).json({error: "ID REQUIRED!"})

        const discounts = await pool.query(`
            SELECT * FROM coupons
            WHERE id = $1
        `, [id])
        res.status(200).json({
            data: discounts.rows[0]
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getCoupons = async (req, res) => {
    try {
        const {limit = 5, offset = 0, order = "created_at" } = req.query

        const discounts = await pool.query(`
            SELECT * FROM coupons
            WHERE 1=1
            ORDER BY $3 DESC LIMIT $1 OFFSET $2
        `, [limit, offset, order])

        const total = await pool.query(`
            SELECT count(id) FROM coupons WHERE 1=1
        `)

        res.status(200).json({
            data: discounts.rows,
            total: total.rows[0]
            
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getDiscounts = async (req, res) => {
    try {
        const {limit = 5, offset = 0, order = "created_at" } = req.query

        const discounts = await pool.query(`
            SELECT * FROM promo
            WHERE 1=1
            ORDER BY $3 DESC LIMIT $1 OFFSET $2
        `, [limit, offset, order])

        const total = await pool.query(`
            SELECT count(id) FROM promo WHERE 1=1
        `)

        res.status(200).json({
            data: discounts.rows,
            total: total.rows[0]
            
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getAll = async (req, res) => {
    try {
        const { limit = 5, offset = 0, order = "created_at" } = req.query;

        const discounts = await pool.query(`
            SELECT * FROM (
                SELECT
                    'Coupon' AS type,
                    c.id,
                    c.name,
                    c.expires_at AS expire_on,
                    CASE 
                        WHEN c.expires_at IS NULL OR c.expires_at > NOW() THEN 'active'
                        ELSE 'expired'
                    END AS status,
                    c.code,
                    c.value AS discount,
                    COALESCE(c.usage_limit, 0) AS usage_limit,
                    c.created_at,
                    COALESCE(cu.uses, 0) AS uses
                FROM coupons c
                LEFT JOIN (
                    SELECT coupon_id, COUNT(*) AS uses
                    FROM coupons_use
                    GROUP BY coupon_id
                ) cu ON cu.coupon_id = c.id

                UNION ALL

                SELECT
                    'Discount' AS type,
                    p.id,
                    p.name,
                    p.expires_at AS expire_on,
                    CASE 
                        WHEN p.expires_at IS NULL OR p.expires_at > NOW() THEN 'active'
                        ELSE 'expired'
                    END AS status,
                    '' AS code,
                    p.value AS discount,
                    0 AS usage_limit,
                    p.created_at,
                    0 AS uses
                FROM promo p
            ) AS combined
            ORDER BY ${order} DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const totalCoupons = await pool.query(`SELECT count(id) FROM coupons`);
        const totalDiscounts = await pool.query(`SELECT count(id) FROM promo`);

        res.status(200).json({
            discounts: discounts.rows,
            total: parseInt(totalCoupons.rows[0].count) + parseInt(totalDiscounts.rows[0].count)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const addDiscount = async (req, res) => {
    try {
        const { expire, val, name, desc } = req.body;

        if (!expire || !val || !name || !desc) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const numericVal = parseFloat(val);
        if (isNaN(numericVal)) {
            return res.status(400).json({ error: "Value must be a number." });
        }

        const expiryDate = new Date(expire);
        if (isNaN(expiryDate)) {
            return res.status(400).json({ error: "Invalid expiry date." });
        }

        await pool.query(`
            INSERT INTO promo (name, value, expires_at, description) 
            VALUES ($1, $2, $3, $4)
        `, [name, numericVal, expiryDate, desc]);

        res.status(200).json({ message: "Discount Added!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const addCoupon = async (req, res) => {
    try {
        const { expire, val, code, limit, name, desc } = req.body;

        if (!expire || !val || !code || !limit || !name || !desc) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const numericVal = parseFloat(val);
        const numericLimit = parseInt(limit, 10);
        const expiryDate = new Date(expire);

        if (isNaN(numericVal) || isNaN(numericLimit)) {
            return res.status(400).json({ error: "Value and limit must be numbers." });
        }

        if (isNaN(expiryDate.getTime())) {
            return res.status(400).json({ error: "Invalid expiration date." });
        }

        // Check if coupon code or name already exists
        const duplicateCheck = await pool.query(
            `SELECT * FROM coupons WHERE code = $1 OR name = $2`,
            [code, name]
        );

        if (duplicateCheck.rows.length > 0) {
            return res.status(409).json({ error: "Coupon with the same code or name already exists." });
        }

        await pool.query(
            `INSERT INTO coupons (name, code, value, usage_limit, expires_at, description)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [name, code, numericVal, numericLimit, expiryDate, desc]
        );

        res.status(200).json({ message: "Coupon Added!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const removeCoupon = async (req, res) => {
    try {
        const {id} = req.params
        if (!id) return res.status(400).json({error: "ID Required!"})

        await pool.query(`
            DELETE FROM coupons WHERE id = $1
        `,[id])

        res.status(200).json({message: "Coupon deleted"})
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const removeDiscount = async (req, res) => {
    try {
        const {id} = req.params
        if (!id) return res.status(400).json({error: "ID Required!"})

        await pool.query(`
            DELETE FROM promo WHERE id = $1
        `,[id])

        res.status(200).json({message: "Discount deleted"})
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const checkCoupon = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ message: "Code is required!" });
        }

        const test = await pool.query(`
            SELECT 
                CASE 
                    WHEN c.id IS NOT NULL 
                    AND (cu.usage_count IS NULL OR cu.usage_count < c.usage_limit)
                    AND (c.expires_at IS NULL OR c.expires_at > CURRENT_TIMESTAMP)
                    THEN true 
                    ELSE false 
                END AS is_valid
            FROM coupons c
            LEFT JOIN (
                SELECT coupon_id, COUNT(*) AS usage_count
                FROM coupons_use
                GROUP BY coupon_id
            ) cu ON cu.coupon_id = c.id
            WHERE c.code = $1;
        `, [code]);

        if (test.rows.length === 0) {
            return res.status(400).json({ message: "Coupon code not found!" });
        }

        res.status(200).json({
            result: test.rows[0].is_valid
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { 
    useCoupon,
    getCoupon,
    getCouponInfo,
    getDiscount,
    getCoupons,
    getDiscounts,
    getAll,
    addDiscount,
    addCoupon,
    removeCoupon,
    checkCoupon,
    removeDiscount
};