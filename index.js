process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/*---------------------------------------------------------*/

var path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const { pool } = require("./dbConfig")
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig");
const passport = require("passport")
const jwt = require("jsonwebtoken");
const initializePassport = require("./passportConfig.js")
const userRoutes = require("./api/routes/users");
const verificationRoutes = require("./api/routes/verificationRoutes");
const emailRoutes = require('./api/routes/emailRoutes');
const docRoutes = require('./api/routes/documentsRoutes.js');
const orders = require("./api/routes/orderRoutes");
const reviews = require("./api/routes/reviewRoutes");
const vehicles = require("./api/routes/vehiclesRoutes");
const discountsRoutes = require("./api/routes/discountsRoutes");
const { sendEmail } = require('./api/controllers/emailController');
const { v4: uuidv4 } = require('uuid');


/*---------------------------------------------------------*/

require("dotenv").config();
initializePassport(passport);
const PORT = process.env.PORT || 4000;

/*---------------------------------------------------------*/

app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', "ejs");
app.use(express.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5000", "https://pfe-server-sandy.vercel.app", "https://pjr.vercel.app"],
    credentials: true
}));

app.use(flash());

/*---------------------------------------------------------*/

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "profile_images",
        public_id: (req, file) => file.fieldname + "-" + Date.now(),
    },
});
const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "vehicles",
      use_filename: true,
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
};
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only .png, .jpg and .jpeg formats are allowed!'), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

/*---------------------------------------------------------*/

function checkAuth(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/home")
    }
    next();
}

function checkNotAuth(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login")
}

async function updateRentalStatuses() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Set status to 'active' if approved and start date is now or past
    await client.query(`
      UPDATE rentals
      SET status = 'active'
      WHERE status = 'approved'
        AND start_date <= NOW();
    `);

    // Set status to 'returning' if currently active but past the end date
    await client.query(`
      UPDATE rentals
      SET status = 'returning'
      WHERE status = 'active'
        AND end_date < NOW();
    `);

    // Set status to 'canceled' if still pending and past the end date
    await client.query(`
      UPDATE rentals
      SET status = 'canceled'
      WHERE status = 'pending'
        AND end_date < NOW();
    `);

    await client.query('COMMIT');
    console.log(`[${new Date().toISOString()}] Rental statuses updated.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating rental statuses:', err);
  } finally {
    client.release();
  }
}


setInterval(updateRentalStatuses, 60 * 60 * 1000);

updateRentalStatuses();

/*---------------------------------------------------------*/

app.use("/api/users", userRoutes);
app.use('/api/email', emailRoutes);
app.use("/api/sms", verificationRoutes);
app.use('/api/orders', orders);
app.use('/api/feedback', reviews);
app.use('/api/vehicles', vehicles);
app.use('/api/docs', docRoutes);
app.use('/api/discounts', discountsRoutes);

/*---------------------------------------------------------*/

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("p404");
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
});

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg') || "";
    res.locals.error_msg = req.flash('error_msg') || "";
    res.locals.info_msg = req.flash('info_msg') || "";
    next();
});

app.get("/", async (req, res) => {
    try{
        const officeRows = await pool.query(`
            SELECT * FROM office WHERE 1 = 1
        `)
        offices = officeRows.rows.length === 0?null:officeRows.rows
        res.render("index", {offices:offices});
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get("/p404", (req, res) => {
    res.render("p404");
})

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }

    return res.status(200).json({ imageUrl: req.file.path });
});

/*---------------------------------------------------------*/

app.get("/home", async (req, res) => {
    try {

        const userId = req.user ? req.user.id : null;

        const brandsResult = await pool.query("SELECT * FROM brands ORDER BY id ASC");
        const brands = brandsResult.rows;

        const reviewsResult = await pool.query(`
            SELECT reviews.stars, reviews.review, reviews.created_at AS cdate,
            users.username AS username, users.lname AS lname, users.fname AS fname, users.image AS image,
            vehicles.model, vehicles.fab_year,
            brands.name AS brand
                FROM reviews
                JOIN users ON reviews.user_id = users.id
                JOIN vehicles ON reviews.vehicle_id = vehicles.id
                JOIN brands ON vehicles.brand_id = brands.id
                ORDER BY reviews.created_at LIMIT 10;
        `);
        const reviews = reviewsResult.rows;

        const officesResult = await pool.query("SELECT * FROM office ORDER BY id ASC");
        const offices = officesResult.rows;

        const userNewbie = await pool.query("SELECT * FROM newbie WHERE user_id = $1", [userId]);
        const newbie = userNewbie.rows[0];

        const vehiclePromises = brands.map(async (b) => {
            const vehiclesResult = await pool.query(`
                SELECT vehicles.*, brands.name AS brand_name, brands.id AS brand_id, brands.logo AS logo
                FROM vehicles
                JOIN brands ON vehicles.brand_id = brands.id
                WHERE brands.id = $1
                ORDER BY vehicles.id ASC LIMIT 5;
            `, [b.id]);

            return vehiclesResult.rows.length > 0 ? [vehiclesResult.rows, b] : null;
        });

        const popular = await pool.query(`
            SELECT 
                v.*, 
                b.name AS brand, 
                b.logo AS logo, 
                COUNT(r.id) AS total_rentals
            FROM vehicles v
                JOIN rentals r ON v.id = r.vehicle_id
                JOIN brands b ON v.brand_id = b.id
            GROUP BY v.id, b.name, b.logo, v.model, v.color, v.price
            ORDER BY total_rentals DESC
            LIMIT 3;

        `)
        popCars = popular.rows

        const vehicles = (await Promise.all(vehiclePromises)).filter(v => v !== null);

        res.render("home", { 
            user: req.user,
            brands: brands,
            reviews:reviews,
            vehicles: vehicles,
            offices: offices,
            newbie: newbie,
            popCars: popCars,
            section: "home"
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).render("p404");
    }
});

app.get("/cars", async (req, res) => {
  try {
    const {
      search,
      brand,
      rtype,
      trans,
      capacity,
      body,
      fuel,
      availability,
      pricem,
      priceM,
      pickupdate,
      returndate,
      location,
      limit = 15,
      offset = 0
    } = req.query;

    const userId = req.user ? req.user.id : null;
    const newbie = userId
      ? (await pool.query("SELECT * FROM newbie WHERE user_id = $1", [userId])).rows[0]
      : null;

    const pickupDate = pickupdate ? new Date(pickupdate) : null;
    const returnDate = returndate ? new Date(returndate) : null;

    // Main and count parameter arrays
    let values = [pickupDate, returnDate];
    let countValues = [pickupDate, returnDate];

    // Next placeholder indexes
    let index = 3;
    let countIndex = 3;

    // Base queries
    let query = `
      SELECT
        vs.*,
        v.*,
        b.name AS brand_name,
        b.logo AS brand_logo,
        o.wilaya,
        COALESCE(r.stars,0) AS stars,
        COALESCE(r.reviews,0) AS reviews,
        COALESCE(rn.orders,0) AS orders,
        CASE WHEN f.vehicle_id IS NOT NULL THEN true ELSE false END AS is_favorite,
        CASE
          WHEN vs.units - COALESCE((
            SELECT COUNT(*) FROM rentals r
            WHERE r.vehicle_id = vs.vehicle_id
              AND (r.status='active' OR r.status='pending')
              AND (r.start_date < $2::timestamp AND r.end_date > $1::timestamp)
          ),0) > 0 THEN true ELSE false
        END AS is_available
      FROM vehicle_stock vs
      JOIN vehicles v ON v.id=vs.vehicle_id
      JOIN brands b ON v.brand_id=b.id
      JOIN office o ON vs.office_id=o.id
      LEFT JOIN (
        SELECT vehicle_id, ROUND(AVG(stars),1) AS stars, COUNT(*) AS reviews
        FROM reviews GROUP BY vehicle_id
      ) r ON v.id=r.vehicle_id
      LEFT JOIN (
        SELECT vehicle_id, COUNT(*) AS orders
        FROM rentals GROUP BY vehicle_id
      ) rn ON v.id=rn.vehicle_id
    `;

    // Favorites join
    if (userId) {
      query += ` LEFT JOIN favorites f ON f.user_id=$${index} AND f.vehicle_id=v.id`;
      values.push(userId);
      index++;
    } else {
      query += ` LEFT JOIN (SELECT NULL::int AS user_id, NULL::int AS vehicle_id) f ON false`;
    }

    query += ` WHERE 1=1`;

    let countQuery = `
      SELECT COUNT(*) FROM vehicle_stock vs
      JOIN vehicles v ON v.id=vs.vehicle_id
      JOIN brands b ON v.brand_id=b.id
      JOIN office o ON vs.office_id=o.id
      WHERE 1=1
      AND vs.units - COALESCE((
        SELECT COUNT(*) FROM rentals r
        WHERE r.vehicle_id = vs.vehicle_id
          AND (r.status='active' OR r.status='pending')
          AND (r.start_date < $2::timestamp AND r.end_date > $1::timestamp)
      ), 0) >= 0
    `;

    // ——————————————————————————————————
    // ——— Dynamic Filters Section ———
    // ——————————————————————————————————

    // Text search
    if (search) {
      const v = `%${search.toLowerCase()}%`;
      query += ` AND (LOWER(b.name) LIKE $${index} OR LOWER(v.model) LIKE $${index})`;
      countQuery += ` AND (LOWER(b.name) LIKE $${countIndex} OR LOWER(v.model) LIKE $${countIndex})`;
      values.push(v);
      countValues.push(v);
      index++;
      countIndex++;
    }

    // Location (wilaya)
    if (location) {
      const locs = location.toLowerCase().split(" ").filter(Boolean);
      if (locs.length) {
        const ph = locs.map(() => `$${index++}`);
        const cph = locs.map(() => `$${countIndex++}`);
        query += ` AND LOWER(o.wilaya) IN (${ph.join(",")})`;
        countQuery += ` AND LOWER(o.wilaya) IN (${cph.join(",")})`;
        values.push(...locs);
        countValues.push(...locs);
      }
    }

    // Brand IN (...)
    if (brand) {
      const brands = Array.isArray(brand) ? brand : brand.split(",");
      if (brands.length) {
        const ph = brands.map(() => `$${index++}`);
        const cph = brands.map(() => `$${countIndex++}`);
        query += ` AND LOWER(b.name) IN (${ph.join(",")})`;
        countQuery += ` AND LOWER(b.name) IN (${cph.join(",")})`;
        values.push(...brands.map(b => b.toLowerCase()));
        countValues.push(...brands.map(b => b.toLowerCase()));
      }
    }

    // Simple scalar filters
    const simpleFilters = [
      [rtype,   "v.rental_type ="],
      [trans,   "LOWER(v.transmission::TEXT) ="],
      [pricem,  "v.price >="],
      [priceM,  "v.price <="]
    ];
    simpleFilters.forEach(([val, col]) => {
      if (val !== undefined) {
        const fv = isNaN(val) ? val.toLowerCase() : parseFloat(val);
        query += ` AND ${col} $${index}`;
        countQuery += ` AND ${col} $${countIndex}`;
        values.push(fv);
        countValues.push(fv);
        index++; countIndex++;
      }
    });

    // Availability (uses the same is_available logic)
    if (availability !== undefined) {
      const av = availability === "true";
      query += ` AND (
        vs.units - COALESCE((
          SELECT COUNT(*) FROM rentals r
          WHERE r.vehicle_id=vs.vehicle_id
            AND (r.status='active' OR r.status='pending')
            AND (r.start_date < $2::timestamp AND r.end_date > $1::timestamp)
        ),0) > 0
      ) = $${index}`;
      values.push(av);
      // We DO NOT push to countValues because countQuery does not include this availability equality filter
      index++;
    }

    // Capacity filter
    if (capacity) {
      const cap = parseInt(capacity);
      if (!isNaN(cap)) {
        const op = cap > 4 ? ">" : "=";
        query += ` AND v.capacity ${op} $${index}`;
        countQuery += ` AND v.capacity ${op} $${countIndex}`;
        values.push(cap);
        countValues.push(cap);
        index++; countIndex++;
      }
    }

    // body_type and fuel_type arrays
    [[body, "v.body::TEXT"], [fuel, "v.fuel::TEXT"]].forEach(([val, col]) => {
      if (val) {
        const list = Array.isArray(val) ? val : val.split(",");
        const ph = list.map(() => `$${index++}`);
        const cph = list.map(() => `$${countIndex++}`);
        query += ` AND LOWER(${col}) IN (${ph.join(",")})`;
        countQuery += ` AND LOWER(${col}) IN (${cph.join(",")})`;
        values.push(...list.map(x => x.toLowerCase()));
        countValues.push(...list.map(x => x.toLowerCase()));
      }
    });

    // Pagination placeholders
    query += ` ORDER BY stars DESC LIMIT $${index} OFFSET $${index + 1}`;
    values.push(parseInt(limit), parseInt(offset));

    // ——————————————————————————————————
    // ——— DEBUG LOGGING ———
    /* ——————————————————————————————————
    console.log("===== MAIN QUERY =====");
    console.log(query.trim());
    console.log("Values:", values);
    console.log("===== COUNT QUERY =====");
    console.log(countQuery.trim());
    console.log("CountValues:", countValues);
    */
    // ——————————————————————————————————
    // ——— Execute Queries ———
    // ——————————————————————————————————
    const [carsResult, countResult] = await Promise.all([
      pool.query(query, values),
      countValues.length > 0
        ? pool.query(countQuery, countValues)
        : pool.query(countQuery)
    ]);

    const cars = carsResult.rows.length ? carsResult.rows : null;
    const totalCars = parseInt(countResult.rows[0].count || 0);

    // Fetch filter options
    const [
      brandsResult,
      fuelResult,
      bodyResult,
      transResult,
      wilayasRes
    ] = await Promise.all([
      pool.query(`SELECT * FROM brands`),
      pool.query(`SELECT unnest(enum_range(NULL::fuel_type))`),
      pool.query(`SELECT unnest(enum_range(NULL::body_type))`),
      pool.query(`SELECT unnest(enum_range(NULL::transmission_type))`),
      pool.query(`SELECT * FROM wilaya`)
    ]);

    res.render("home", {
      user: req.user,
      cars,
      newbie,
      brands: brandsResult.rows,
      fuelTypes: fuelResult.rows,
      bodyTypes: bodyResult.rows,
      transTypes: transResult.rows,
      wilayas: wilayasRes.rows,
      filters: req.query,
      section: "cars",
      pagination: {
        total: totalCars,
        limit: parseInt(limit),
        offset: parseInt(offset),
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCars / limit)
      }
    });
  } catch (error) {
    console.error("Route /cars error:", error);
    res.status(500).render("p404");
  }
});

app.get("/car/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : null;
        
        const carResult = await pool.query(`
            SELECT 
                vehicle_stock.stock_id,
                vehicle_stock.units,
                vehicle_stock.office_id,
                vehicles.*, 
                brands.name AS brand_name, 
                brands.logo, 
                office.country, 
                office.wilaya,  
                office.address, 
                office.city,
                office.latitude,
                office.longitude,
                ROUND(COALESCE(AVG(reviews.stars), 0), 1) AS stars,
                COUNT(DISTINCT reviews.id) AS reviews,
                COUNT(DISTINCT rentals.id) AS orders,
                COUNT(reviews.id) FILTER (WHERE reviews.stars = 1) AS s1,
                COUNT(reviews.id) FILTER (WHERE reviews.stars = 2) AS s2,
                COUNT(reviews.id) FILTER (WHERE reviews.stars = 3) AS s3,
                COUNT(reviews.id) FILTER (WHERE reviews.stars = 4) AS s4,
                COUNT(reviews.id) FILTER (WHERE reviews.stars = 5) AS s5,
                CASE WHEN COUNT(f.vehicle_id) > 0 THEN true ELSE false END AS is_favorite
            FROM 
                vehicle_stock
            JOIN 
                vehicles ON vehicles.id = vehicle_stock.vehicle_id
            JOIN
                brands ON vehicles.brand_id = brands.id
            JOIN 
                office ON vehicle_stock.office_id = office.id
            LEFT JOIN 
                reviews ON vehicles.id = reviews.vehicle_id
            LEFT JOIN 
                rentals ON vehicles.id = rentals.vehicle_id
            LEFT JOIN 
                favorites f ON f.user_id = $1 AND f.vehicle_id = vehicles.id
            WHERE 
                vehicle_stock.vehicle_id = $2
            GROUP BY 
                vehicle_stock.stock_id, vehicles.id, brands.id, office.id
            LIMIT 1;
        `, [userId, id]);

        const carReviews = await pool.query(`
            SELECT 
                reviews.*,
                users.id AS user_id, users.fname, users.lname, users.username, users.image,
                rentals.id AS rental_id, rentals.total_price
            FROM reviews
            JOIN users ON reviews.user_id = users.id
            JOIN rentals ON reviews.rental_id = rentals.id
            WHERE reviews.vehicle_id = $1
        `, [id]);

        if (carResult.rows.length === 0) {
            return res.status(404).render("p404");
        } else {
            const car = carResult.rows[0];
            const reviews = carReviews.rows;
            res.render("home", { car: car, reviews: reviews, user: req.user, section: "detail" });
        }

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).render("p404");
    }
});

app.get("/city/:wilaya", async (req, res) => {
    const { wilaya } = req.params;
    const citiesL = await pool.query(`
        SELECT city.*,
                wilaya.name AS wilaya
        FROM city 
        JOIN wilaya ON city.wilaya_id = wilaya.id
        WHERE LOWER(wilaya.name) = $1`
         , [wilaya.toLocaleLowerCase()]);
    const cities = citiesL.rows;
    res.json(cities)
})

app.get("/rentals", checkNotAuth, async (req, res) => {
    try {
        const {
            search,
            start_date,
            end_date,
            status,
            ody
        } = req.query;

        const values = [req.user.id];
        const conditions = ["user_id = $1"];
        let index = values.length + 1;
        const userId = req.user ? req.user.id : null;
        const userNewbie = await pool.query("SELECT * FROM newbie WHERE user_id = $1", [userId]);
        const newbie = userNewbie.rows[0];

        if (search) {
            conditions.push(`(
                brands.name ILIKE $${index} OR
                vehicles.model ILIKE $${index} OR
                CAST(vehicles.fab_year AS TEXT) ILIKE $${index}
            )`);
            values.push(`%${search}%`);
            index++;
        }

        if (start_date) {
            conditions.push(`rentals.start_date >= $${index++}`);
            values.push(start_date);
        }

        if (end_date) {
            conditions.push(`rentals.end_date <= $${index++}`);
            values.push(end_date);
        }

        if (status) {
            conditions.push(`rentals.status = $${index++}`);
            values.push(status);
        }

        const whereClause = `WHERE ${conditions.join(" AND ")}`;

        let orderByClause = `ORDER BY rentals.created_at DESC`; // default
        if (ody === "price") {
            orderByClause = `ORDER BY rentals.total_price DESC`;
        } else if (ody === "date") {
            orderByClause = `ORDER BY rentals.created_at DESC`;
        }

        const rentalsResult = await pool.query(`
            SELECT rentals.*,
                   vehicles.model, vehicles.fab_year, vehicles.rental_type,
                   brands.name AS brand_name
            FROM rentals 
            JOIN vehicles ON vehicles.id = rentals.vehicle_id
            JOIN brands ON vehicles.brand_id = brands.id
            ${whereClause}
            ${orderByClause}
        `, values);

        const rentals = rentalsResult.rows.length > 0 ? rentalsResult.rows : null;

        res.render("home", {
            user: req.user,
            newbie: newbie,
            section: "rentals",
            filters: req.query,
            rentals
        });
    } catch (error) {
        console.error(error);
        res.status(500).render("p404");
    }
});

app.get("/fav",checkNotAuth, async (req, res) => {
    try{
        const favCarsRows = await pool.query(`
            SELECT favorites.*,
                vehicles.*,
                vehicle_stock.units AS units,
                office.wilaya, office.city, office.address,
                brands.name AS brand_name, brands.logo AS brand_logo
            FROM favorites
                JOIN vehicles ON vehicles.id = favorites.vehicle_id
                JOIN vehicle_stock ON vehicles.id = vehicle_stock.vehicle_id
                JOIN office ON office.id = vehicle_stock.office_id
                JOIN brands ON brands.id = vehicles.brand_id
            WHERE favorites.user_id = $1 
        `,[req.user.id])
        favCars = favCarsRows.rows
        res.render("home", { user: req.user, section : "fav", favCars:favCars });
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get("/docs",checkNotAuth, async (req, res) => {
    try{
        const userId = req.user ? req.user.id : null;
        const userNewbie = await pool.query("SELECT * FROM newbie WHERE user_id = $1", [userId]);
        const newbie = userNewbie.rows[0];
        const wilayas = await pool.query("SELECT * FROM wilaya WHERE 1=1");
        const wilaya = wilayas.rows;
        res.render("home", { user: req.user, newbie:newbie, wilaya:wilaya, section : "docs" });
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.post('/updocs', upload.fields([
    { name: "image_front", maxCount: 1 },
    { name: "image_back", maxCount: 1 },
]), async (req, res) => {
    try {
        if (!req.user) {
            req.flash('error_msg', 'Unauthorized');
            return res.redirect('/login');
        }

        const image_front = req.files?.["image_front"]
            ? await uploadImage(req.files["image_front"][0])
            : "/assets/images/idfront.png";

        const image_back = req.files?.["image_back"]
            ? await uploadImage(req.files["image_back"][0])
            : "/assets/images/idback.png";

        const docResult = await pool.query(`
            INSERT INTO users_documents (user_id, image_front, image_back)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [req.user.id, image_front, image_back]);

        await pool.query(`
            INSERT INTO users_verification (user_id, user_doc, status)
            VALUES ($1, $2, $3)
        `, [req.user.id, docResult.rows[0].id, "pending"]);

        req.flash('success_msg', 'Documents uploaded successfully!');
        req.flash('info_msg', 'A verification request has been sent');
        res.redirect('/docs');
    } catch (error) {
        console.error("Upload Error:", error);
        req.flash('error_msg', 'Failed to upload documents. Please try again.');
        res.redirect('/docs');
    }
});

app.get("/help", (req, res) => {
    try{
        res.render("home", { user: req.user, section : "help" });
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get("/rent/:vid", checkNotAuth, async (req, res) => {
    try {
        const { vid } = req.params;
        const userId = req.user ? req.user.id : null;
        
        const carResult = await pool.query(`
            SELECT 
                vehicle_stock.stock_id,
                vehicle_stock.units,
                vehicle_stock.office_id,
                vehicles.*, 
                brands.name AS brand_name, 
                brands.logo, 
                office.country, 
                office.wilaya,  
                office.address, 
                office.city,
                office.latitude,
                office.longitude,
                ROUND(COALESCE(AVG(reviews.stars), 0), 1) AS stars,
                COUNT(DISTINCT reviews.id) AS reviews,
                COUNT(DISTINCT rentals.id) AS orders,
                COUNT(reviews.id) FILTER (WHERE reviews.stars = 1) AS s1,
                COUNT(reviews.id) FILTER (WHERE reviews.stars = 2) AS s2,
                COUNT(reviews.id) FILTER (WHERE reviews.stars = 3) AS s3,
                COUNT(reviews.id) FILTER (WHERE reviews.stars = 4) AS s4,
                COUNT(reviews.id) FILTER (WHERE reviews.stars = 5) AS s5,
                CASE WHEN COUNT(f.vehicle_id) > 0 THEN true ELSE false END AS is_favorite
            FROM 
                vehicle_stock
            JOIN 
                vehicles ON vehicles.id = vehicle_stock.vehicle_id
            JOIN
                brands ON vehicles.brand_id = brands.id
            JOIN 
                office ON vehicle_stock.office_id = office.id
            LEFT JOIN 
                reviews ON vehicles.id = reviews.vehicle_id
            LEFT JOIN 
                rentals ON vehicles.id = rentals.vehicle_id
            LEFT JOIN 
                favorites f ON f.user_id = $1 AND f.vehicle_id = vehicles.id
            WHERE 
                vehicle_stock.vehicle_id = $2
            GROUP BY 
                vehicle_stock.stock_id, vehicles.id, brands.id, office.id
            LIMIT 1;
        `, [userId, vid]);

        const carReviews = await pool.query(`
            SELECT 
                reviews.*,
                users.id AS user_id, users.fname, users.lname, users.username, users.image,
                rentals.id AS rental_id, rentals.total_price
            FROM reviews
            JOIN users ON reviews.user_id = users.id
            JOIN rentals ON reviews.rental_id = rentals.id
            WHERE reviews.vehicle_id = $1
        `, [vid]);

        const discounts = await pool.query(`
            SELECT * FROM promo WHERE expires_at > CURRENT_TIMESTAMP
        `,);

        const rent_id = uuidv4();

        if (carResult.rows.length === 0) {
            return res.status(404).render("p404");
        } else {
            const car = carResult.rows[0];
            const reviews = carReviews.rows;
            const dis = discounts.rows
            res.render("rent", { car: car, reviews: reviews, discounts:dis, user: req.user, rent_id:rent_id });
        }

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).render("p404");
    }
})

/*---------------------------------------------------------*/

app.get('/rental/list', checkNotAuth, (req, res) => {
    try{
    res.render("dashboard",{user: req.user, section:"rental", subsection:"listrental"})
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get('/rental/orders', checkNotAuth, (req, res) => {
    try{
    res.render("dashboard",{user: req.user, section:"rental", subsection:"ordersrentals"})
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get('/rental/return', checkNotAuth, (req, res) => {
    try{
    res.render("dashboard",{user: req.user, section:"rental", subsection:"returnrentals"})
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get('/report', checkNotAuth, (req, res) => {
    try{
    res.render("dashboard",{user: req.user, section:"report", subsection:"report"})
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get("/settings", checkNotAuth, async (req, res) => {
    res.render("dashboard", {section:"settings"})
})

app.get('/dbm', checkNotAuth, async (req, res) => {
    try{
        res.render("dashboard",{user: req.user, section:"dbm", subsection:""})
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get("/dashboard", checkNotAuth, async (req, res) => {
    res.render("dashboard", {section:"dashboard", subsection:"dashoverview", user:req.user})
})

app.get("/dashboard/overview", checkNotAuth, async (req, res) => {
    res.render("dashboard", {section:"dashboard", subsection:"dashoverview", user:req.user})
})

app.get("/dashboard/rentals", checkNotAuth, async (req, res) => {
    res.render("dashboard", {section:"dashboard", subsection:"rentals", user:req.user})
})

app.get("/dashboard/clients", checkNotAuth, async (req, res) => {
    res.render("dashboard", {section:"dashboard", subsection:"dashboardclients", user:req.user})
})

app.get("/dashboard/vehicles", checkNotAuth, async (req, res) => {
    res.render("dashboard", {section:"dashboard", subsection:"dashboardvehicles", user:req.user})
})

app.get('/vehicles', checkNotAuth, async (req, res) => {
    try{
        res.render("dashboard",{user: req.user, 
            section:"vehicles", 
            subsection:"listvehicles"
        })
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get('/vehicles/add', checkNotAuth, async (req, res) => {
    try{
        const fuelResult = await pool.query(`SELECT unnest(enum_range(NULL::fuel_type))`);
        const fuelTypes = fuelResult.rows.length > 0 ? fuelResult.rows : null;

        const bodyResult = await pool.query(`SELECT unnest(enum_range(NULL::body_type))`);
        const bodyTypes = bodyResult.rows.length > 0 ? bodyResult.rows : null;

        const transResult = await pool.query(`SELECT unnest(enum_range(NULL::transmission_type))`);
        const transTypes = transResult.rows.length > 0 ? transResult.rows : null;

        const colorsResult = await pool.query(`SELECT unnest(enum_range(NULL::css_color))`);
        const colors = colorsResult.rows.length > 0 ? colorsResult.rows : null;

        const brandsResult = await pool.query(`SELECT * FROM brands`);
        const brandsList = brandsResult.rows.length > 0 ? brandsResult.rows : null;

        const officeRows = await pool.query(`
            SELECT * FROM office WHERE 1 = 1
        `)
        offices = officeRows.rows.length === 0?null:officeRows.rows

        res.render("dashboard",{user: req.user, 
            section:"vehicles", 
            fuelTypes:fuelTypes, 
            bodyTypes:bodyTypes, 
            transTypes:transTypes,
            brands:brandsList,
            colors:colors,
            subsection:"addvehicle",
            offices:offices
        })
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.post("/addvehicle", 
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "prevImage1", maxCount: 1 },
        { name: "prevImage2", maxCount: 1 },
        { name: "prevImage3", maxCount: 1 }
    ])
    ,async (req, res) => {
    try {
        const {
            brand_id,
            model,
            color,
            capacity,
            fuel,
            transmission,
            body,
            price,
            location,
            units,
            speed,
            horsepower,
            engine_type,
            rental_type,
            description
        } = req.body;

        // Defaults
        const vehicleUnits = units || 0;
        const vehicleSpeed = speed || 0;
        const vehicleHorsepower = horsepower || 0;
        const vehicleEngineType = engine_type || 'unknown';
        const vehicleRentalType = rental_type || 'h';
        const vehicleTransmission = transmission || 'Manual';

        // Upload images (assuming uploadImage is a working function)
        const mainImage = req.files?.["image"] ? await uploadImage(req.files["image"][0]) : "/assets/cars/default.png";
        const prevImage1 = req.files?.["prevImage1"] ? await uploadImage(req.files["prevImage1"][0]) : "/assets/cars/default_prev.png";
        const prevImage2 = req.files?.["prevImage2"] ? await uploadImage(req.files["prevImage2"][0]) : "/assets/cars/default_prev.png";
        const prevImage3 = req.files?.["prevImage3"] ? await uploadImage(req.files["prevImage3"][0]) : "/assets/cars/default_prev.png";

        const query = `
            INSERT INTO vehicles (
                brand_id, model, color, capacity, fuel, transmission, body, price,
                image, prevImage1, prevImage2, prevImage3, speed, horsepower, engine_type, rental_type, description
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                    $11, $12, $13, $14, $15, $16, $17)
            RETURNING *;
        `;

        const values = [
            brand_id,
            model,
            color,
            capacity,
            fuel,
            vehicleTransmission,
            body,
            price,
            mainImage,
            prevImage1,
            prevImage2,
            prevImage3,
            vehicleSpeed,
            vehicleHorsepower,
            vehicleEngineType,
            vehicleRentalType,
            description?description:"No description"
        ];

        const result = await pool.query(query, values);

        await pool.query(`
            INSERT INTO vehicle_stock (
                vehicle_id, office_id, units
            )
            VALUES ($1, $2, $3);
        `,[result.rows[0].id, location, vehicleUnits])
        res.redirect('/vehicles/list');

    } catch (error) {
        console.error("Error adding vehicle:", error);
        res.status(500).render("p404")
    }
});

app.get('/vehicles/list', checkNotAuth, async (req, res) => {
    try{
        const fuelResult = await pool.query(`SELECT unnest(enum_range(NULL::fuel_type))`);
        const fuelTypes = fuelResult.rows.length > 0 ? fuelResult.rows : null;

        const bodyResult = await pool.query(`SELECT unnest(enum_range(NULL::body_type))`);
        const bodyTypes = bodyResult.rows.length > 0 ? bodyResult.rows : null;

        const transResult = await pool.query(`SELECT unnest(enum_range(NULL::transmission_type))`);
        const transTypes = transResult.rows.length > 0 ? transResult.rows : null;

        res.render("dashboard",{
            user: req.user, 
            section:"vehicles",
            subsection:"listvehicles",
            fuelTypes:fuelTypes, 
            bodyTypes:bodyTypes, 
            transTypes:transTypes
        })
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get('/vehicles/brands/add', checkNotAuth, async (req, res) => {
    try{
        res.render("dashboard",{user: req.user, 
            section:"vehicles", 
            subsection:"addbrand"
        })
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get('/vehicles/types/add', checkNotAuth, async (req, res) => {
    try{
        res.render("dashboard",{user: req.user, 
            section:"vehicles", 
            subsection:"addtype"
        })
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get('/discounts', checkNotAuth, (req, res) => {
    try{
      res.render("dashboard",{user: req.user, section:"discounts", subsection:""})
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get('/clients', checkNotAuth, (req, res) => {
    try{
      res.render("dashboard",{user: req.user, section:"clients", subsection:""})
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get('/clients/list', checkNotAuth, async (req, res) => {
    try{
        const wilayas = await pool.query("SELECT * FROM wilaya WHERE 1=1")
        res.render("dashboard",{user: req.user, section:"clients", subsection:"listclients", wilayas: wilayas.rows})
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get('/clients/verification', checkNotAuth, (req, res) => {
    try{
      res.render("dashboard",{user: req.user, section:"clients", subsection:"listverification"})
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

/*-------------------------------------------------------------*/ 

app.get("/signup",checkAuth, async (req, res) => {
    const wilayas = await pool.query("SELECT * FROM wilaya WHERE 1=1");
    const wilaya = wilayas.rows;
    res.render("signup", {wilaya:wilaya})
})

app.post('/reg', upload.single("image"), async (req, res) => {
    try {
        const { fname, lname, email, address, country, wilaya, city, zipcode, phone, phone_country_code, birthdate, username, password, sexe } = req.body;
        const role = "Client";

        // Get Cloudinary Image URL
        const imageUrl = req.file ? req.file.path : "./assets/images/user.jpg";

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Store Data in Database
        const newUser = await pool.query(
            `INSERT INTO users (fname, lname, sexe, image, email, address, country, wilaya, city, zipcode, phone, birthdate, username, password, role) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
             RETURNING id, email, fname, lname, role, image`,
            [fname, lname, sexe, imageUrl, email, address, country, wilaya, city, zipcode, `+${phone_country_code}${phone}`, birthdate, username, hashedPassword, role]
        );

        // Delete the used token from the database
        await pool.query(`DELETE FROM user_tokens WHERE email = $1`, [email]);

        console.log("User registered successfully & token deleted.");
        
        req.flash("success_msg", "Registered successfully! Please log in.");
        res.redirect('/login');

    } catch (err) {
        console.error(err.message);
        res.status(500).render("p404");
    }
});

app.get("/login",checkAuth, (req, res) => {
    res.render("login")
})

app.post('/login', async (req, res, next) => {
    const { email, userplatdesc } = req.body;
    const prodUrl = process.env.PROD_URL || `http://localhost:${process.env.PORT}`;

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "30m" });
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await pool.query(
        `INSERT INTO user_tokens (email, token, expires_at) VALUES ($1, $2, $3)`,
        [email, token, expiresAt]
    );

    passport.authenticate('local', async (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            // Flash a message and redirect to login
            req.flash('error', info?.message || 'Invalid email or password.');

            // Send failed login email
            sendEmail({
                to: email,
                subject: "Login Attempt",
                html: `
                <p>There was a failed login attempt from: <strong>${userplatdesc}</strong>.</p>`
            }).catch(console.error);

            try {
                await pool.query(`
                    INSERT INTO log_login (email, status, platform) VALUES ($1, $2, $3)
                `, [email, false, userplatdesc]);
            } catch (error) {
                console.error(error);
            }

            return res.redirect('/login');
        }

        req.logIn(user, async (err) => {
            if (err) return next(err);

            sendEmail({
                to: email,
                subject: "Login Successful",
                html: `
                    <p>Successful login from platform: <strong>${userplatdesc}</strong>.</p>
                    <br> 
                    <a style="color: red;" href="${prodUrl}/recover?t=${token}">Not you?</a>
                `
            }).catch(console.error);

            try {
                await pool.query(`
                    INSERT INTO log_login (email, status, platform) VALUES ($1, $2, $3)
                `, [email, true, userplatdesc]);
            } catch (error) {
                console.error(error);
            }

            return res.redirect('/home');
        });
    })(req, res, next);
});

app.get("/recover",checkNotAuth, async (req, res) => {
    try{
        const { t } = req.query;

        if (!t) res.status(500).render("p404");
        const result = await pool.query(
            `SELECT email, expires_at FROM user_tokens WHERE token = $1`,
            [t]
        );

        if (result.rows.length === 0) {
            res.status(500).render("p404");
        }

        const { email, expires_at } = result.rows[0];

        if (new Date() > new Date(expires_at)) {
            res.status(500).render("p404");
        }

        res.render("recover", {email:email});
    }catch(error){
        console.error(error);
        res.status(500).render("p404");
    }
})

app.get("/logout", (req, res, next) => {
    try{
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash("info_msg", "You have logged out");
            res.redirect("/login");
        });
    }catch(error){
            console.error(error);
            res.status(500).render("p404");
        }
});

/*---------------------------------------------------------*/

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});