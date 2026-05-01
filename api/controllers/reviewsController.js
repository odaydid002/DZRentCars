const { pool } = require("../config/dbConfig")

const getReviews = async (req, res) => {
  try {
    const { limit = 5, offset = 0, order = "id", dire = "DESC"} = req.query;

    const allowedOrders = ['id', 'created_at']; 
    const allowedDirections = ['ASC', 'DESC'];

    const safeOrder = allowedOrders.includes(order) ? order : 'id';
    const safeDire = allowedDirections.includes(dire.toUpperCase()) ? dire.toUpperCase() : 'DESC';

    const countResult = await pool.query(`
      SELECT  count(r.id)
      FROM
        reviews r
          JOIN users u ON u.id = r.user_id
          JOIN vehicles v ON v.id = r.vehicle_id
          JOIN brands b ON b.id = v.brand_id
          JOIN vehicle_stock vs ON vs.vehicle_id = v.id
          JOIN rentals l ON l.id = r.rental_id
    `);

    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(`
        SELECT  r.*,
            u.username,
            u.fname,
            u.lname,
            u.image,
            v.model, v.fab_year, v.image AS vimage,
            b.name AS brand_name
          FROM
            reviews r
            JOIN rentals l ON l.id = r.rental_id
            JOIN users u ON u.id = l.user_id
            JOIN vehicles v ON v.id = l.vehicle_id
            JOIN brands b ON b.id = v.brand_id
            JOIN vehicle_stock vs ON vs.vehicle_id = v.id
        ORDER BY r.${safeOrder} ${safeDire}
        LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    res.status(200).json({
      total,
      reviews: result.rows
    });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getReview = async (req, res) => {
  try {
    const { id } = req.params;

    if(!id) return res.status(400).json({message: "Review ID required"})

    const result = await pool.query(`
        SELECT  r.*,
            u.username,
            u.fname,
            u.lname,
            u.image,
            v.model, v.fab_year, v.image AS vimage, v.rental_type,
            b.name AS brand_name, b.logo
          FROM
            reviews r
            JOIN rentals l ON l.id = r.rental_id
            JOIN users u ON u.id = l.user_id
            JOIN vehicles v ON v.id = l.vehicle_id
            JOIN brands b ON b.id = v.brand_id
            JOIN vehicle_stock vs ON vs.vehicle_id = v.id
          WHERE r.id = $1
        LIMIT 1
    `, [id]);

    res.status(200).json({
      review: result.rows[0]
    });

  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const removeReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID required" });
    await pool.query(`DELETE FROM reviews WHERE id = $1`, [id]);
    res.json({ message: "Record deleted" });
  } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server Error");
  }
};

const report = async (req, res) => {
  try {
    const { uid = null, vid = null, prio = "normal", type= "general", desc = "" } = req.body;

    await pool.query(`
      INSERT INTO reports (user_id, vehicle_id, priority, type, description) 
      VALUES ($1, $2, $3, $4, $5)
    `, [uid, vid, prio, type, desc || "No description"]);

    res.status(200).json({
      message: "Report sent successfully"
    });

  } catch (error) {
    console.error("Error Reporting:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getReports = async (req, res) => {
  try {
    const { limit = 5, offset = 0, order = "id", dire = "DESC" } = req.query;

    const allowedOrders = ['id', 'created_at'];
    const allowedDirections = ['ASC', 'DESC'];

    const safeOrder = allowedOrders.includes(order) ? order : 'id';
    const safeDire = allowedDirections.includes(dire.toUpperCase()) ? dire.toUpperCase() : 'DESC';

    const limitNum = parseInt(limit, 10) || 5;
    const offsetNum = parseInt(offset, 10) || 0;

    const countResult = await pool.query(`SELECT count(r.id) FROM reports r`);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(`
      SELECT  
        r.priority,
        r.type,
        r.description,
        COALESCE(u.username, '') AS username,
        COALESCE(u.fname, 'Guest') AS fname,
        COALESCE(u.lname, '') AS lname,
        COALESCE(u.image, '/assets/images/user.jpg') AS image
      FROM reports r
      LEFT JOIN users u ON u.id = r.user_id
      ORDER BY r.${safeOrder} ${safeDire}
      LIMIT $1 OFFSET $2
    `, [limitNum, offsetNum]);

    res.status(200).json({
      total,
      reports: result.rows
    });

  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getStatics = async (req, res) => {
    try {
        const reportsCount = await pool.query(`SELECT count(r.id) FROM reports r WHERE 1=1`);
        const totalRep = parseInt(reportsCount.rows[0].count, 10);
        
        const reviewsNegCount = await pool.query(`SELECT count(r.id) FROM reviews r WHERE r.stars < 3`);
        const totalNegRev = parseInt(reviewsNegCount.rows[0].count, 10);

        const reviewsPosCount = await pool.query(`SELECT count(r.id) FROM reviews r WHERE r.stars >= 3`);
        const totalPosRev = parseInt(reviewsPosCount.rows[0].count, 10);

        res.status(200).json({
            reports: totalRep,
            positives: totalNegRev,
            negatives: totalPosRev
        });

    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getStaticsPY = async (req, res) => {
    try {
        const result = await pool.query(`
            WITH months AS (
                SELECT
                    TO_CHAR(date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' * i, 'Mon YY') AS month,
                    date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' * i AS month_start
                FROM generate_series(0, 11) AS i
            ),
            review_stats AS (
                SELECT
                    date_trunc('month', created_at) AS month_start,
                    COUNT(*) FILTER (WHERE stars >= 3) AS positives,
                    COUNT(*) FILTER (WHERE stars < 3) AS negatives
                FROM reviews
                WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 year'
                GROUP BY date_trunc('month', created_at)
            ),
            report_stats AS (
                SELECT
                    date_trunc('month', created_at) AS month_start,
                    COUNT(id) AS reports
                FROM reports
                WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 year'
                GROUP BY date_trunc('month', created_at)
            )
            SELECT
                m.month,
                COALESCE(rv.positives, 0) AS positives,
                COALESCE(rv.negatives, 0) AS negatives,
                COALESCE(rp.reports, 0) AS reports
            FROM months m
            LEFT JOIN review_stats rv ON m.month_start = rv.month_start
            LEFT JOIN report_stats rp ON m.month_start = rp.month_start
            ORDER BY m.month_start;
        `);

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error("Error fetching monthly stats:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
  
module.exports = {
    getReviews,
    getReview,
    removeReview,
    report,
    getStatics,
    getReports,
    getStaticsPY
};
  