const { json } = require("express");
const { pool } = require("../config/dbConfig")

const getCounts = async (req, res) => {
  try {

    const countResult = await pool.query(`
      SELECT  
        count(r.id)
      FROM 
        rentals r
    `);
    const pendingCount = await pool.query(`
      SELECT  count(r.id)
      FROM
        rentals r
      WHERE status = 'pending'
    `)
    const activeCount = await pool.query(`
      SELECT  count(r.id)
      FROM
        rentals r
      WHERE status = 'active'
    `)
    const completedCount = await pool.query(`
      SELECT  count(r.id)
      FROM
        rentals r
      WHERE status = 'completed'
    `)
    const canceledCount = await pool.query(`
      SELECT  count(r.id)
      FROM
        rentals r
      WHERE status = 'canceled'
    `)
    const approvedCount = await pool.query(`
      SELECT  count(r.id)
      FROM
        rentals r
      WHERE status = 'approved'
    `)
    const returningCount = await pool.query(`
      SELECT  count(r.id)
      FROM
        rentals r
      WHERE status = 'returning'
    `)

    res.status(200).json({
      total: parseInt(countResult.rows[0].count),
      pending: parseInt(pendingCount.rows[0].count),
      active: parseInt(activeCount.rows[0].count),
      completed: parseInt(completedCount.rows[0].count),
      approved: parseInt(approvedCount.rows[0].count),
      returning: parseInt(returningCount.rows[0].count),
      canceled: parseInt(canceledCount.rows[0].count)
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getOrders = async (req, res) => {
  try {
    const { limit = 5, offset = 0, order = "id", dire = "DESC", status="" } = req.query;

    const allowedOrders = ['id', 'created_at']; 
    const allowedDirections = ['ASC', 'DESC'];

    const safeOrder = allowedOrders.includes(order) ? order : 'id';
    const safeDire = allowedDirections.includes(dire.toUpperCase()) ? dire.toUpperCase() : 'DESC';

    const countResult = await pool.query(`
      SELECT  count(r.id)
      FROM
        rentals r
          JOIN users u ON u.id = r.user_id
          JOIN vehicles v ON v.id = r.vehicle_id
          JOIN brands b ON b.id = v.brand_id
          JOIN vehicle_stock vs ON vs.vehicle_id = v.id
          JOIN office o ON o.id = vs.office_id
    `);

    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(`
        SELECT  r.*,
            u.username,
            u.fname,
            u.lname,
            u.image,
            v.model, v.fab_year, v.image AS vimage, v.rental_type,
            b.name AS brand_name, b.logo,
            o.country, o.wilaya, o.city, o.address
          FROM
            rentals r
            JOIN users u ON u.id = r.user_id
            JOIN vehicles v ON v.id = r.vehicle_id
            JOIN brands b ON b.id = v.brand_id
            JOIN vehicle_stock vs ON vs.vehicle_id = v.id
            JOIN office o ON o.id = vs.office_id
          WHERE status LIKE '%${status}%'
        ORDER BY r.${safeOrder} ${safeDire}
        LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const pendingCount = await pool.query(`
      SELECT  count(r.id)
      FROM
        rentals r
      WHERE status = 'pending'
    `)
    const activeCount = await pool.query(`
      SELECT  count(r.id)
      FROM
        rentals r
      WHERE status = 'active'
    `)
    const completedCount = await pool.query(`
      SELECT  count(r.id)
      FROM
        rentals r
      WHERE status = 'completed'
    `)

    res.status(200).json({
      total,
      pending: parseInt(pendingCount.rows[0].count),
      active: parseInt(activeCount.rows[0].count),
      completed: parseInt(completedCount.rows[0].count),
      orders: result.rows
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getInvoice = async (req, res) => {
  try {

    const { rid } = req.params

    if(!rid) return res.status(400).json({error: "ID REQUIRED"})

    const result = await pool.query(`
      SELECT
        rentals.id AS rental_id,
        rentals.start_date,
        rentals.end_date,
        rentals.total_price,
        rentals.insurance,
        rentals.fees,
        rentals.paid,
        rentals.status,
        rentals.created_at AS rental_created_at,

        users.id AS user_id,
        users.fname,
        users.lname,
        users.email,
        users.phone,

        vehicles.id AS vehicle_id,
        vehicles.model,
        vehicles.color,
        vehicles.fab_year,
        vehicles.price AS vehicle_price,

        brands.name AS brand_name,

        invoice.bill_id,
        invoice.payment_methode,
        invoice.discounts,
        invoice.additions,
        invoice.created_at AS invoice_created_at

      FROM rentals
        JOIN users ON rentals.user_id = users.id
        JOIN vehicles ON rentals.vehicle_id = vehicles.id
        JOIN brands ON vehicles.brand_id = brands.id
        LEFT JOIN invoice ON invoice.rental_id = rentals.id
      WHERE rentals.id = $1
      ORDER BY rentals.created_at DESC;

    `, [rid]);

    res.status(200).json({
      result: result.rows[0]
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getOrder = async (req, res) => {
  try {
    const { rid } = req.query;

    if(!rid) return res.status(400).json({message: "Rental ID required"})

    const result = await pool.query(`
        SELECT  
            r.id,
            r.status,
            r.start_date,
            r.end_date,
            r.total_price,
            u.username,
            u.fname,
            u.lname,
            u.image AS user_image,
            v.model, v.fab_year, v.image AS car_image,
            b.name AS brand_name, b.logo AS brand_logo
          FROM
            rentals r
            JOIN users u ON u.id = r.user_id
            JOIN vehicles v ON v.id = r.vehicle_id
            JOIN brands b ON b.id = v.brand_id
            JOIN vehicle_stock vs ON vs.vehicle_id = v.id
          WHERE r.id = $1
      `,
      [rid]
    );

    res.status(200).json({
      order: result.rows
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getOrdersbyOffice = async (req, res) => {
  try {
    const { limit = 5, offset = 0, order = "id", dire = "DESC" } = req.query;
    const { office } = req.params;

    if(!office) return res.status(400).json({ error: "Office ID is required" });

    const allowedOrders = ['id', 'created_at']; 
    const allowedDirections = ['ASC', 'DESC'];

    const safeOrder = allowedOrders.includes(order) ? order : 'id';
    const safeDire = allowedDirections.includes(dire.toUpperCase()) ? dire.toUpperCase() : 'DESC';

    const countResult = await pool.query(`
      SELECT  count(r.id)
      FROM
        rentals r
          JOIN users u ON u.id = r.user_id
          JOIN vehicles v ON v.id = r.vehicle_id
          JOIN brands b ON b.id = v.brand_id
          JOIN vehicle_stock vs ON vs.vehicle_id = v.id
          JOIN office o ON o.id = vs.office_id
    `);

    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(`
        SELECT  r.*,
            u.username,
            u.fname,
            u.lname,
            v.model, v.fab_year,
            b.name AS brand_name,
            o.country, o.wilaya, o.city, o.address
          FROM
            rentals r
            JOIN users u ON u.id = r.user_id
            JOIN vehicles v ON v.id = r.vehicle_id
            JOIN brands b ON b.id = v.brand_id
            JOIN vehicle_stock vs ON vs.vehicle_id = v.id
            JOIN office o ON o.id = vs.office_id
          WHERE vs.office_id = $3
          ORDER BY r.${safeOrder} ${safeDire}
          LIMIT $1 OFFSET $2
      `,
      [limit, offset, office]
    );

    res.status(200).json({
      total,
      orders: result.rows
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const changeStat = async (req, res) => {
  try {
    const { rid, status } = req.body;

    if (!rid) return res.status(400).json({ error: "ID required" });

    await pool.query(`UPDATE rentals SET status = $2 WHERE id = $1;`, [ rid, status]);

    res.json({ message: "Record status updated" });
} catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
}
}

const removeOrder = async (req, res) => {
  try {
    const { rid } = req.body;
    if (!rid) return res.status(400).json({ error: "ID required" });
    await pool.query(`DELETE FROM rentals WHERE id = $1`, [rid]);
    res.json({ message: "Record deleted" });
  } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
  }
};

const getStats = async (req, res) => {
  try {

    const { period = 30, office = null } = req.query

    if(!office){
      const result = await pool.query(`
        SELECT 
          COUNT(r.id) AS returns,
          SUM(r.insurance) AS insurance,
          SUM(r.fees) AS fees,
          SUM(r.total_price) - SUM(r.insurance) AS icomme
        FROM
          rentals r
        WHERE 
          r.status = 'completed'
          AND r.created_at >= CURRENT_DATE - INTERVAL '${period} days'
      `);      
      const result2 = await pool.query(`
          SELECT count(r.id) AS total FROM rentals r WHERE  r.created_at >= CURRENT_DATE - INTERVAL '${period} days'
        `
      );
      res.status(200).json({
        stats: result.rows[0],
        total:result2.rows[0]
      });
    }else{
      const result = await pool.query(`
        SELECT 
          COUNT(r.id) AS returns,
          SUM(r.insurance) AS insurance,
          SUM(r.fees) AS fees,
          SUM(r.total_price) - SUM(r.insurance) AS icomme
        FROM (
          SELECT r.*
          FROM rentals r
          INNER JOIN vehicle_stock vs ON vs.vehicle_id = r.vehicle_id
          WHERE 
            vs.office_id = $1
            AND r.status = 'completed'
            AND r.created_at >= CURRENT_DATE - INTERVAL '${period} days'
        ) r
      `, [office]);

      const result2 = await pool.query(`
        SELECT COUNT(*) AS total
        FROM rentals r
        INNER JOIN vehicle_stock vs ON vs.vehicle_id = r.vehicle_id
        WHERE vs.office_id = $1 AND  r.created_at >= CURRENT_DATE - INTERVAL '${period} days'
      `, [office]);
      
      res.status(200).json({
        stats: result.rows[0],
        total:result2.rows[0]
      });
    }

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const getStatsDaily = async (req, res) => {
  try {

    const { period = 7, office = null } = req.query

    if(!office){
      const result = await pool.query(`
        WITH days AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '${period} days', 
            CURRENT_DATE,
            INTERVAL '1 day'
          )::date AS rental_day
        )
        SELECT 
          d.rental_day AS day,
          TO_CHAR(d.rental_day, 'Dy') AS day_name, -- ADD THIS for day name (Sun, Mon, etc)
          COALESCE(SUM(r.total_price + r.insurance + r.fees), 0) AS income,
          COUNT(r.id) AS rentals
        FROM 
          days d
        LEFT JOIN 
          rentals r 
          ON DATE(r.created_at) = d.rental_day 
          AND r.paid = TRUE 
          AND r.status = 'completed'
        GROUP BY 
          d.rental_day
        ORDER BY 
          d.rental_day;
      `);
      res.status(200).json({
        stats: result.rows
      });
    }else{
      const result = await pool.query(`
        WITH days AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '${period} days', 
            CURRENT_DATE,
            INTERVAL '1 day'
          )::date AS rental_day
        )
        SELECT 
          d.rental_day AS day,
          TO_CHAR(d.rental_day, 'Dy') AS day_name,  -- Add day name (Sun, Mon, etc)
          COALESCE(SUM(r.total_price + r.insurance + r.fees), 0) AS income,
          COUNT(r.id) AS rentals
        FROM 
          days d
        LEFT JOIN (
          SELECT r.*
          FROM rentals r
          INNER JOIN vehicle_stock vs ON vs.vehicle_id = r.vehicle_id
          WHERE 
            vs.office_id = $1
            AND r.paid = TRUE
            AND r.status = 'completed'
        ) r
        ON DATE(r.created_at) = d.rental_day
        GROUP BY 
          d.rental_day
        ORDER BY 
          d.rental_day;
      `, [office]);
      res.status(200).json({
        stats: result.rows
      });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const getStatsMonthly = async (req, res) => {
  try {

    const { period = 5, office = null } = req.query

    if(!office){
      const result = await pool.query(`
        WITH months AS (
          SELECT generate_series(
            DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${period} months',
            DATE_TRUNC('month', CURRENT_DATE),
            INTERVAL '1 month'
          )::date AS month_start
        )
        SELECT 
          EXTRACT(MONTH FROM m.month_start)::int AS month_number,
          TO_CHAR(m.month_start, 'Mon') AS month_name,
          COALESCE(SUM(r.total_price + r.insurance + r.fees), 0) AS income,
          COUNT(r.id) AS rentals
        FROM 
          months m
        LEFT JOIN 
          rentals r 
        ON 
          DATE_TRUNC('month', r.created_at) = m.month_start 
          AND r.paid = TRUE 
          AND r.status = 'completed'
        GROUP BY 
          m.month_start
        ORDER BY 
          m.month_start;
      `
      );
      res.status(200).json({
        stats: result.rows
      });
    }else{
      const result = await pool.query(`
        WITH months AS (
          SELECT generate_series(
            DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${period} months',
            DATE_TRUNC('month', CURRENT_DATE),
            INTERVAL '1 month'
          )::date AS month_start
        )
        SELECT 
          EXTRACT(MONTH FROM m.month_start)::int AS month_number,
          TO_CHAR(m.month_start, 'Mon') AS month_name,
          COALESCE(SUM(r.total_price + r.insurance + r.fees), 0) AS income,
          COUNT(r.id) AS rentals
        FROM 
          months m
        LEFT JOIN (
          SELECT r.*
          FROM rentals r
          INNER JOIN vehicle_stock vs ON vs.vehicle_id = r.vehicle_id
          WHERE 
            vs.office_id = $1
            AND r.paid = TRUE 
            AND r.status = 'completed'
        ) r
        ON DATE_TRUNC('month', r.created_at) = m.month_start
        GROUP BY 
          m.month_start
        ORDER BY 
          m.month_start;
      `, [period]);   
      res.status(200).json({
        stats: result.rows
      });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const getProfit = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT 
          o.wilaya AS office_wilaya,
          SUM(CASE 
              WHEN EXTRACT(YEAR FROM r.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
              THEN r.total_price + r.insurance + r.fees
              ELSE 0 
          END) AS this_year_profit,
          SUM(CASE 
              WHEN EXTRACT(YEAR FROM r.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) - 1
              THEN r.total_price + r.insurance + r.fees
              ELSE 0 
          END) AS last_year_profit

        FROM rentals r
        JOIN vehicles v ON r.vehicle_id = v.id
        JOIN vehicle_stock vs ON v.id = vs.vehicle_id
        JOIN office o ON vs.office_id = o.id

        GROUP BY o.wilaya
        ORDER BY o.wilaya;
      `
    );

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const rent = async (req, res) => {
  try {
      const { uid, vid, pd, rd, amount, isure, fees, bid, discounts, additions, paycard = null, paymeth } = req.body;
      const rental = await pool.query(
          `INSERT INTO rentals (user_id, vehicle_id, start_date, end_date, total_price, insurance, fees)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [uid, vid, pd, rd, amount, isure, fees]
      );

      const rid = rental.rows[0].id

      await pool.query(`
        INSERT INTO invoice (bill_id, rental_id, discounts, additions, paycard_id, payment_methode) 
          VALUES ($1, $2, $3, $4, $5, $6)
      `,[bid, rid, discounts, additions, paycard, paymeth])

      res.status(200).json({ message: "Rental Added!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteOrder = async (req, res) => {

  const oid = req.params.oid;

  try {
    const result = await pool.query("DELETE FROM rentals WHERE id = $1", [oid]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Rental not found" });
    }

    res.status(200).json({ message: "Rental deleted successfully" });

  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
  
const returnOrder = async (req, res) => {

  const oid = req.params.oid;

  try {
    
    if (!oid) return res.status(400).json({error: "ID REQUIRED"})
    
    await pool.query("INSERT INTO returns (rental_id) VALUES ($1)", [oid]);
    await pool.query(`UPDATE rentals SET status = 'completed' WHERE id = $1`, [oid])

    res.status(200).json({ message: "Rental completed!" });


  } catch (error) {
    console.error("Error returning order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
  
module.exports = {
  getOrders,
  getOrder,
  getOrdersbyOffice,
  getStats,
  getProfit,
  deleteOrder,
  getCounts,
  getStatsDaily,
  rent,
  getStatsMonthly,
  changeStat,
  removeOrder,
  returnOrder,
  getInvoice
};
  