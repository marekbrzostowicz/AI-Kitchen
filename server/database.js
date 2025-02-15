const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "haslo",
  database: "my_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


db.getConnection((err, connection) => {
  if (err) {
    console.error("Błąd połączenia z MySQL:", err);
  } else {
    console.log("Połączono z bazą MySQL!");
    connection.release();
  }
});

module.exports = db;
