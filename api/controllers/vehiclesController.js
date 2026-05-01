const { Query } = require("pg");
const { pool } = require("../config/dbConfig");

// Get all brands
const getBrands = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM brands ORDER BY name ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all cars of a specific brand
const getBrandVehicles = async (req, res) => {
  const { brand_id } = req.params;

  if (!brand_id) {
    return res.status(400).json({ error: "Brand ID is required" });
  }

  try {
    const result = await pool.query(
      "SELECT model FROM vehicles WHERE brand_id = $1",
      [parseInt(brand_id)]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching brand's cars:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all vehicles
const getVehicles = async (req, res) => {
  try {
    const { limit = 5, offset = 0, order = "id", dire = "DESC" } = req.query;

    const allowedOrders = ['id', 'created_at']; 
    const allowedDirections = ['ASC', 'DESC'];

    const safeOrder = allowedOrders.includes(order) ? order : 'id';
    const safeDire = allowedDirections.includes(dire.toUpperCase()) ? dire.toUpperCase() : 'DESC';

    // Get the total count (without limit/offset)
    const countResult = await pool.query(`
      SELECT COUNT(*) FROM vehicle_stock vs
      JOIN vehicles v ON v.id = vs.vehicle_id
    `);

    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated data
    const result = await pool.query(
      `
      SELECT  vs.units,
              v.*,
              b.name AS brand_name, b.logo AS brand_logo,
              o.country, o.wilaya, o.city, o.address
      FROM
          vehicle_stock vs
          JOIN vehicles v ON v.id = vs.vehicle_id
          JOIN brands b ON b.id = v.brand_id
          JOIN office o ON o.id = vs.office_id
      ORDER BY v.${safeOrder} ${safeDire}
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    res.status(200).json({
      total,
      vehicles: result.rows
    });

  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get one vehicle by id
const getVehicle = async (req, res) => {
  try {
    const { id, uid } = req.params;
    const hasUser = parseInt(uid) > 0;

    const query = `
      SELECT 
        v.id,
        v.model,
        v.price,
        v.rental_type,
        v.transmission,
        v.capacity,
        v.fuel,
        v.body,
        v.image,
        v.prevImage1,
        v.prevImage2,
        v.prevImage3,
        v.description,
        v.color,
        v.fab_year,
        v.doors,
        v.speed,
        v.horsepower,
        v.engine_type,
        v.created_at,

        vs.units AS units,

        b.name AS brand_name,
        b.logo,

        o.id AS office_id,
        o.country,
        o.wilaya,
        o.city,
        o.address,
        o.latitude,
        o.longitude,

        ROUND(COALESCE(AVG(r.stars), 0), 1) AS stars,
        COUNT(DISTINCT r.id) AS reviews,
        COUNT(DISTINCT rent.id) AS orders
        ${hasUser ? ", CASE WHEN COUNT(f.vehicle_id) > 0 THEN true ELSE false END AS is_favorite" : ""}
      FROM vehicles v
      JOIN brands b ON v.brand_id = b.id
      JOIN vehicle_stock vs ON vs.vehicle_id = v.id
      JOIN office o ON vs.office_id = o.id
      LEFT JOIN reviews r ON v.id = r.vehicle_id
      LEFT JOIN rentals rent ON v.id = rent.vehicle_id
      ${hasUser ? "LEFT JOIN favorites f ON f.user_id = $2 AND f.vehicle_id = v.id" : ""}
      WHERE v.id = $1
      GROUP BY 
        v.id, v.model, v.price, v.rental_type, v.transmission, 
        vs.stock_id,
        v.capacity, v.fuel, v.body,
        v.image, v.prevImage1, v.prevImage2, v.prevImage3, 
        v.description, v.color, v.fab_year, v.doors, v.speed, 
        v.horsepower, v.engine_type, v.created_at,
        b.id,
        o.id
      LIMIT 1;
    `;

    const values = hasUser ? [id, uid] : [id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "No Vehicle Found!" });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteVehicle = async (req, res) => {

  const vid = req.params.id;

  try {
    const result = await pool.query("DELETE FROM vehicles WHERE id = $1", [vid]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ message: "Vehicle deleted successfully" });

  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateVehicle = async (req, res) => {
  const vid = req.params.id;
  if(!vid) return res.status(400).json({ message: "Vehicle ID is required" });

  const {
    model,
    fab_year,
    units,
    price,
    rental_type,
    body,
    color,
    engine_type,
    horsepower,
    speed,
    capacity,
    doors,
    fuel,
    transmission,
    description,
    image,
    previmage1,
    previmage2,
    previmage3
  } = req.query
  try {
    
    await pool.query(`
      UPDATE 
        vehicles 
      SET
        model = $1,
        fab_year = $2,
        price = $3,
        rental_type = $4,
        body = $5,
        color = $6,
        engine_type = $7,
        horsepower = $8,
        speed = $9,
        capacity = $10,
        doors = $11,
        fuel = $12,
        transmission = $13,
        description = $14,
        image = $15,
        previmage1 = $16,
        previmage2 = $17,
        previmage3 = $18
      WHERE 
        id = $19
    `
    ,[
      model,
      fab_year,
      price,
      rental_type,
      body,
      color,
      engine_type,
      horsepower,
      speed,
      capacity,
      doors,
      fuel,
      transmission,
      description,
      image,
      previmage1,
      previmage2,
      previmage3,
      vid
    ])

    await pool.query(`
      UPDATE 
        vehicle_stock 
      SET units = $1
      WHERE 
        vehicle_id = $2`
    ,[units, vid])

    res.status(200).json({ message: "Vehicle updated successfully" });

  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const checkAvailability = async (req, res) => {
  const { vid, start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ message: "Start date and end date are required." });
  }

  try {
    const query = `
      WITH stock AS (
        SELECT units
        FROM vehicle_stock
        WHERE vehicle_id = $1
        LIMIT 1
      ),
      conflicting_rentals AS (
        SELECT COUNT(*) AS conflict_count
        FROM rentals
        WHERE vehicle_id = $1
          AND status IN ('active', 'pending')
          AND NOT (
            $3 < start_date OR $2 > end_date
          )
      )
      SELECT 
        CASE 
          WHEN stock.units > conflicting_rentals.conflict_count THEN TRUE 
          ELSE FALSE 
        END AS is_available
      FROM stock, conflicting_rentals;
    `;

    const result = await pool.query(query, [vid, start_date, end_date]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No availability data found." });
    }

    res.status(200).json({ availability: result.rows[0].is_available });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    return res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: req.file.path,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({ message: "Image upload failed" });
  }
};

const getStatics = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT
          (SELECT SUM(units) FROM vehicle_stock) AS total_vehicle_stock,
          (SELECT SUM(disabled) FROM vehicle_stock) AS disabled_vehicle_stock,
          (SELECT COALESCE(SUM(total_price + insurance + fees), 0) FROM rentals WHERE paid = TRUE) AS total_profit,
          (SELECT COALESCE(SUM(total_price + insurance + fees), 0) FROM rentals WHERE paid = TRUE AND DATE(created_at) = CURRENT_DATE) AS today_profit,
          (SELECT COUNT(*) FROM users) AS total_clients,
          (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS new_clients_last_7_days,
          (SELECT COUNT(*) FROM rentals WHERE status = 'active') AS total_active_rentals,
          (SELECT COUNT(*) FROM rentals WHERE DATE(start_date) = CURRENT_DATE AND status = 'pending') AS rentals_starting_today;
      `
    );

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching Statics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const getCarsStatics = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT
          (SELECT count(id) FROM brands) AS total_brands,
          (SELECT SUM(units) FROM vehicle_stock) AS total_vehicle_stock,
          (SELECT SUM(disabled) FROM vehicle_stock) AS disabled_vehicle_stock,
          (SELECT COUNT(*) FROM rentals WHERE status = 'active') AS total_active_rentals,
          (SELECT SUM(units) FROM vehicle_stock JOIN vehicles ON vehicle_stock.vehicle_id = vehicles.id WHERE vehicles.body = 'Coupe') AS total_coupe,
          (SELECT SUM(units) FROM vehicle_stock JOIN vehicles ON vehicle_stock.vehicle_id = vehicles.id WHERE vehicles.body = 'Sport') AS total_sport,
          (SELECT SUM(units) FROM vehicle_stock JOIN vehicles ON vehicle_stock.vehicle_id = vehicles.id WHERE vehicles.body = 'Sedan') AS total_sedan,
          (SELECT SUM(units) FROM vehicle_stock JOIN vehicles ON vehicle_stock.vehicle_id = vehicles.id WHERE vehicles.body = 'SUV') AS total_suv,
          (SELECT SUM(units) FROM vehicle_stock JOIN vehicles ON vehicle_stock.vehicle_id = vehicles.id WHERE vehicles.body = 'Hatchback') AS total_hatchback,
          (SELECT SUM(units) FROM vehicle_stock JOIN vehicles ON vehicle_stock.vehicle_id = vehicles.id WHERE vehicles.body = 'Off-Road') AS total_offroad,
          (SELECT SUM(units) FROM vehicle_stock JOIN vehicles ON vehicle_stock.vehicle_id = vehicles.id WHERE vehicles.body = 'Truck') AS total_truck,
          (SELECT SUM(units) FROM vehicle_stock JOIN vehicles ON vehicle_stock.vehicle_id = vehicles.id WHERE vehicles.body = 'Van') AS total_van;
      `
    );

    const result2 = await pool.query(`
      WITH months AS (
        SELECT 
          TO_CHAR(DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' * generate_series(0, 11), 'YYYY-MM') AS year_month,
          TO_CHAR(DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' * generate_series(0, 11), 'Mon YY') AS month,
          DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' * generate_series(0, 11) AS month_start
      ),
      rental_stats AS (
        SELECT 
          TO_CHAR(DATE_TRUNC('month', start_date), 'YYYY-MM') AS year_month,
          COUNT(*) FILTER (WHERE status IN ('pending', 'approved', 'completed')) AS rentals,
          COUNT(*) FILTER (WHERE status = 'completed') AS returns
        FROM rentals
        WHERE start_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
        GROUP BY 1
      )
      SELECT
        m.month,
        COALESCE(rs.rentals, 0) AS rentals,
        COALESCE(rs.returns, 0) AS returns
      FROM months m
      LEFT JOIN rental_stats rs ON m.year_month = rs.year_month
      ORDER BY m.month_start;


    `)

    res.status(200).json({
      data: result.rows,
      chartData: result2.rows
    });

  } catch (error) {
    console.error("Error fetching Statics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getVehicles,
  getVehicle,
  getCarsStatics,
  getStatics,
  deleteVehicle,
  checkAvailability,
  getBrands,
  getBrandVehicles,
  updateVehicle,
  uploadImage
};
