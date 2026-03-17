const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "", // shyiraho password yawe ya local MySQL
    database: "school_db",
    port: 3306
});

module.exports = db;