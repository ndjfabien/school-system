const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_root,
  password: process.env.DB_,
  database: process.env.DB_school_db,
  port: process.env.DB_3000
});

module.exports = db;