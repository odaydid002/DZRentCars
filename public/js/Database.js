const { Pool } = require("pg");

const pool = new Pool({
  user: "root",      
  host: "localhost",        
  database: "projet_fin_etude", 
  password:"",   
  port: 5432,                
});


pool.connect()
  .then(() => console.log("connect succesfully"))
  .catch((err) => console.error("connect failed", err));

module.exports = pool;
