const { pool } = require("../config/dbConfig")

// Get All Documents
const getDocs = async (req, res) => {
    try {
        const users = await pool.query("SELECT * FROM users_documents");
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Add New Document
const addDocs = async (req, res) => {
    try {
        const { user_id, image_front, image_back, upload_datetime } = req.body;

        // Store Data in Database
        const newDoc = await pool.query(
            `INSERT INTO users_documents ( user_id, image_front, image_back, upload_datetime ) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [ user_id, image_front, image_back, upload_datetime ]
        );

        res.json(newDoc.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

const getReq = async (req, res) => {
    try {
        const { rid } = req.query
        if (!rid) return res.status(400).json({ error: "Request ID is required" });
    
        result = await pool.query(`
            SELECT 
                r.*,
                u.fname, u.lname, u.sexe, u.email, u.phone, u.image, u.username, DATE_PART('year', AGE(CURRENT_DATE, birthdate)) AS age, u.wilaya, u.city, u.address,
                d.image_front, d.image_back
            FROM 
                users_verification r
                JOIN users u ON u.id = r.user_id
                JOIN users_documents d ON d.id = r.user_doc
            WHERE r.id = $1 LIMIT 1
        `, [rid])

        res.json({ data:result.rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { getDocs, addDocs, getReq };
