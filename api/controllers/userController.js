const { pool } = require("../config/dbConfig");

// Update phone status
const confirmPhone = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) return res.status(400).json({ error: "User ID is required" });

        await pool.query(`UPDATE users SET phone_status = TRUE WHERE id = $1;`, [id]);

        res.redirect(`/home`);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Update account status
const confirmAccount = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) return res.status(400).json({ error: "User ID is required" });

        await pool.query(`UPDATE users SET account_status = TRUE WHERE id = $1;`, [id]);

        res.json({ message: "Account Verified" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Check phone
const checkPhone = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) return res.status(400).json({ error: "User ID is required" });

        const users = await pool.query("SELECT phone_status FROM users WHERE id = $1", [id]);

        if (users.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ phone_status: users.rows[0].phone_status });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Check AccountStat
const checkAccountStat = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) return res.status(400).json({ error: "User ID is required" });

        const users = await pool.query("SELECT account_status FROM users WHERE id = $1", [id]);

        if (users.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ account_status: users.rows[0].account_status });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Get All Users
const getUsers = async (req, res) => {
    try {
        const users = await pool.query("SELECT * FROM users");
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Add a vehicle to user favorite
const addFav = async (req, res) => {
    try {
        const { u, v } = req.body;

        if (!u || !v) {
            return res.status(400).json({ error: "Missing user id or vehicle id" });
        }

        // Check if the favorite already exists
        const result = await pool.query(
            "SELECT * FROM favorites WHERE user_id = $1 AND vehicle_id = $2", 
            [parseInt(u), parseInt(v)]
        );

        if (result.rows.length > 0) {
            // If a favorite already exists, return a duplicate message
            return res.status(409).json({ message: "This vehicle is already in the favorites" });
        }

        // Insert the new favorite
        await pool.query(
            "INSERT INTO favorites (user_id, vehicle_id) VALUES ($1, $2)", 
            [parseInt(u), parseInt(v)]
        );
        res.json({ message: "Vehicle added to favorite" });

    } catch (error) {
        console.error("Error adding vehicle:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const updateUser = async (req, res) => {
  const {
    uid,
    fname,
    lname,
    phone,
    wilaya,
    city,
    address,
    username
  } = req.query
  try {
    
    await pool.query(`
      UPDATE 
        users 
      SET
        fname = $2,
        lname = $3,
        phone = $4,
        wilaya = $5,
        city = $6,
        address = $7,
        username = $8
      WHERE 
        id = $1
    `
    ,[
        uid,
        fname,
        lname,
        phone,
        wilaya,
        city,
        address,
        username
    ])

    res.status(200).json({ message: "Updated successfully" });

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
 
const getRentals = async (req, res) => {
    try {
        const {
            id,
            search,
            start_date,
            end_date,
            status,
            ody,
            limit = 10, // default limit is 10
            offset = 0  // default offset is 0
        } = req.query;

        if (id) {
            const values = [id];
            const conditions = ["user_id = $1"];
            let index = values.length + 1;

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

            let orderByClause = `ORDER BY rentals.created_at DESC`; // default order
            if (ody === "price") {
                orderByClause = `ORDER BY rentals.total_price DESC`;
            } else if (ody === "date") {
                orderByClause = `ORDER BY rentals.created_at DESC`;
            }

            // Query to get the total count of rentals matching the filters
            const countResult = await pool.query(`
                SELECT COUNT(*) AS total_count
                FROM rentals 
                JOIN vehicles ON vehicles.id = rentals.vehicle_id
                JOIN brands ON vehicles.brand_id = brands.id
                ${whereClause}
            `, values);

            const total = countResult.rows[0].total_count; // Total number of rentals

            // Query to get the paginated results
            const rentalsResult = await pool.query(`
                SELECT rentals.*,
                    vehicles.model, vehicles.fab_year, vehicles.rental_type,
                    brands.name AS brand_name
                FROM rentals 
                JOIN vehicles ON vehicles.id = rentals.vehicle_id
                JOIN brands ON vehicles.brand_id = brands.id
                ${whereClause}
                ${orderByClause}
                LIMIT $${index++} OFFSET $${index++}  -- Adding limit and offset
            `, [...values, limit, offset]);

            res.json({
                total,
                rentals: rentalsResult.rows
            });
        } else {
            return res.status(404).json({ error: "Something went wrong!" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

const deleteuser = async (req, res) => {
    const userId = req.params.id;
  
    try {
      const resultuser = await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  
      if (resultuser.rowCount === 0) {
        return res.status(404).json({ message: "user not found" });
      }
  
      res.status(200).json({ message: "user deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
};

const getClients = async (req, res) => {
    try {
        const { 
            limit = 5, 
            offset = 0, 
            order = "id", 
            dire = "DESC", 
            search = "", 
            sexe = "any", 
            wilaya = "any" 
        } = req.query;

        const sanitizedSearch = search.replace(/\s/g, '%');

        const allowedOrders = ['id', 'created_at']; 
        const allowedDirections = ['ASC', 'DESC'];

        const safeOrder = allowedOrders.includes(order) ? order : 'id';
        const safeDire = allowedDirections.includes(dire.toUpperCase()) ? dire.toUpperCase() : 'DESC';

        // Base WHERE clause and parameters
        let whereClauses = [`u.role = 'Client'`];
        let params = [];
        let paramIndex = 1;

        if (sanitizedSearch.trim() !== '') {
            whereClauses.push(`(u.fname ILIKE $${paramIndex} OR u.lname ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
            params.push(`%${sanitizedSearch}%`);
            paramIndex++;
        }

        if (sexe !== "any") {
            whereClauses.push(`lower(u.sexe) = $${paramIndex}`);
            params.push(sexe.toLowerCase());
            paramIndex++;
        }

        if (wilaya !== "any") {
            whereClauses.push(`lower(u.wilaya) = $${paramIndex}`);
            params.push(wilaya.toLowerCase());
            paramIndex++;
        }

        const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : '';

        // Get total count with same filters
        const countQuery = `SELECT COUNT(u.id) FROM users u ${whereSQL}`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);

        // Add LIMIT and OFFSET to params
        params.push(limit);
        params.push(offset);

        const query = `
            SELECT 
                u.*, 
                DATE_PART('year', AGE(CURRENT_DATE, u.birthdate)) AS age,
                CASE 
                    WHEN b.id IS NOT NULL AND b.is_active = true THEN true 
                    ELSE false 
                END AS is_banned
            FROM users u
            LEFT JOIN banned_users b ON b.user_id = u.id AND b.is_active = true
            ${whereSQL}
            ORDER BY u.${safeOrder} ${safeDire}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const result = await pool.query(query, params);

        res.status(200).json({
            total,
            clients: result.rows
        });

    } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getEmployees = async (req, res) => {
    try {
        const { limit = 5, offset = 0, order = "id", dire = "DESC" } = req.query;
    
        const allowedOrders = ['id', 'created_at']; 
        const allowedDirections = ['ASC', 'DESC'];
    
        const safeOrder = allowedOrders.includes(order) ? order : 'id';
        const safeDire = allowedDirections.includes(dire.toUpperCase()) ? dire.toUpperCase() : 'DESC';
    
        const countResult = await pool.query(`
            SELECT 
                count(u.id)
            FROM 
                users u
                JOIN office o ON o.id = u.office_id
            WHERE role = 'Employe' 
        `);
    
        const total = parseInt(countResult.rows[0].count, 10);
    
        const result = await pool.query(`
            SELECT 
                u.*,
                o.country AS office_country, o.wilaya AS office_wilaya, o.city AS office_city, o.address AS office_address
            FROM 
                users u
                JOIN office o ON o.id = u.office_id
            WHERE role = 'Employe'
            ORDER BY u.${safeOrder} ${safeDire}
            LIMIT $1 OFFSET $2
          `,
          [limit, offset]
        );
    
        res.status(200).json({
          total,
          employees: result.rows
        });
    
      } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
};

const newbie = async (req, res) => {
    const { page, user_id } = req.body;
    const allowedPages = ["navbar", "home", "orders", "profile", "vehicles"]

    if (!user_id || !allowedPages.includes(page)) {
        return res.status(400).json({ error: "Somthing went wrong!" });
    }

    try {
        const result = await pool.query(`SELECT ${page} FROM newbie WHERE user_id = $1`, [user_id])
        if(!JSON.parse(result.rows[0][page])){
            await pool.query(`UPDATE newbie SET ${page}=TRUE WHERE user_id = $1`, [user_id])
            return res.status(200).json({message: "Updated succesfully"})
        }else{
            return res.status(200).json({message: "Already updated!"})
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const verifications = async (req, res) => {
    try {
        const {limit = 5, offset = 0, orderby = 'created_at'} = req.query
    
        const usersPending = await pool.query(`
            SELECT  
                uv.id AS uvid, uv.created_at AS date,
                u.*,
                ud.image_front AS front,
                ud.image_back AS back
            FROM
                users_verification uv
                JOIN users u ON uv.user_id = u.id
                JOIN users_documents ud ON ud.id = uv.user_doc
            WHERE status = 'pending'
            ORDER BY $1 DESC
            LIMIT $2
            OFFSET $3
        `, [orderby, limit, offset])
    
        const approvedCount = await pool.query(`
            SELECT  
                count(uv.id)
            FROM
                users_verification uv
            WHERE uv.status = 'approved'
        `)
    
        const pendingCount = await pool.query(`
            SELECT  
                count(uv.id)
            FROM
                users_verification uv
            WHERE uv.status = 'pending'
        `)
    
        const rejectedCount = await pool.query(`
            SELECT  
                count(uv.id)
            FROM
                users_verification uv
            WHERE uv.status = 'rejected'
        `)
    
        const total = await pool.query(`
            SELECT  
                count(uv.id)
            FROM
                users_verification uv
        `)

        res.status(200).json({
            data: usersPending.rows,
            approved: approvedCount.rows[0].count,
            pending: pendingCount.rows[0].count,
            rejected: rejectedCount.rows[0].count,
            total: total.rows[0].count,
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const updateStat = async (req, res) => {
    try {
        const { uid, stat='pending', reason = null } = req.body;

        if (!uid) return res.status(400).json({ error: "User ID is required" });

        user_id = await pool.query(`UPDATE users_verification SET status = $2 WHERE id = $1 RETURNING users_verification.user_id`, [uid, stat]);
        
        if(stat === "approved"){
            await pool.query(`UPDATE users SET account_status = TRUE WHERE id = $1;`, [user_id.rows[0].user_id]);
            await pool.query(`DELETE FROM users_verification WHERE user_id = $1 AND status != 'approved' ;`, [user_id.rows[0].user_id]);
        }
        
        if(stat === "rejected" && reason){
            user_id = await pool.query(`UPDATE users_verification SET reason = $2 WHERE id = $1 RETURNING users_verification.user_id`, [uid, reason]);
        }

        res.json({ message: "Request status updated" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
}

const getStatics = async (req, res) => {
    try {

        const total = await pool.query(`
            SELECT count(u.id) FROM users u WHERE u.role = 'Client'
        `)

        const verified = await pool.query(`
            SELECT count(u.id) FROM users u WHERE u.role = 'Client' AND u.account_status = TRUE
        `)

        const newClients = await pool.query(`
            SELECT count(u.id) FROM users u WHERE u.role = 'Client' AND u.created_at >= NOW() - INTERVAL '7 DAYS'
        `)

        const population = await pool.query(`
            SELECT w.id, w.name AS wilaya, COUNT(u.id) AS user_count
            FROM wilaya w
            LEFT JOIN users u ON u.wilaya = w.name
            GROUP BY w.id, w.name
            ORDER BY w.id;
        `)

        const genders = await pool.query(`
            SELECT 
                sexe AS gender, COUNT(*) AS count
            FROM users
            GROUP BY sexe;
        `)

        const ages = await pool.query(`
            WITH age_ranges AS (
                SELECT '19-29' AS age_range, 19 AS min_age, 29 AS max_age
                UNION ALL
                SELECT '30-39', 30, 39
                UNION ALL
                SELECT '40-49', 40, 49
                UNION ALL
                SELECT '50-59', 50, 59
                UNION ALL
                SELECT '60-69', 60, 69
                UNION ALL
                SELECT '70-80', 70, 80
            )
            SELECT
                ar.age_range,
                COALESCE(COUNT(u.id), 0) AS count
            FROM age_ranges ar
                LEFT JOIN users u
                ON EXTRACT(YEAR FROM AGE(NOW(), u.birthdate)) BETWEEN ar.min_age AND ar.max_age
                AND u.role = 'Client' -- Assuming you want to count clients, otherwise remove this line
            GROUP BY ar.age_range, ar.min_age
            ORDER BY ar.min_age;
        `)

        res.status(200).json({
            total: total.rows[0],
            verified: verified.rows[0],
            newC: newClients.rows[0],
            population: population.rows,
            genders: genders.rows[0],
            ages: ages.rows
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getVerClients = async (req, res) => {
    try {
        const {limit = 5, offset = 0, order = "created_at" } = req.query

        const clients = await pool.query(`
            SELECT
                u.fname, u.lname, DATE_PART('year', AGE(CURRENT_DATE, u.birthdate)) AS age,
                u.image, u.username, u.sexe, u.wilaya, u.city, u.address, u.email, u.phone,
                u.created_at, u.id
            FROM 
                users u 
            WHERE u.role = 'Client' AND u.account_status = TRUE
            ORDER BY $3
            LIMIT $1
            OFFSET $2
        `, [limit, offset, order])

        const total = await pool.query(`
            SELECT count(u.id) FROM users u WHERE u.role = 'Client' AND u.account_status = TRUE
        `)

        res.status(200).json({
            data: clients.rows,
            total: total.rows[0]
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const banUser = async (req, res) => {
    try {
1
        const {uid} = req.params
        const {period = 30, reason = ""} = req.query

        const today = new Date();
        const expd = new Date(today);
        expd.setDate(today.getDate() + parseInt(period));

        if (!uid) return res.status(400).json({error: "ID Required!"})

        await pool.query(`
            INSERT INTO 
                banned_users (user_id, reason, expires_at) 
            VALUES ($1, $2, $3)
        `,[uid, reason, expd])

        res.status(200).json({message: "User Banned!"})
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const unbanUser = async (req, res) => {
    try {
1
        const {uid} = req.params
        if (!uid) return res.status(400).json({error: "ID Required!"})

        await pool.query(`
            DELETE FROM banned_users WHERE user_id = $1
        `,[uid])

        res.status(200).json({message: "User unbanned"})
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { 
    getUsers,
    banUser,
    unbanUser,
    confirmPhone, 
    checkPhone,
    checkAccountStat,
    confirmAccount,
    getRentals,
    addFav,
    deleteuser,
    getClients,
    getEmployees,
    newbie,
    verifications,
    getStatics,
    updateStat,
    getVerClients,
    updateUser
};