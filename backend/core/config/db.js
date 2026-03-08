const mysql = require("mysql2");
const config = require("./env");

const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  port: config.database.port,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

async function testConnection() {
  const connection = await db.getConnection();
  console.log("✅ MySQL database connected successfully");
  connection.release();
}

module.exports = {
  db,
  pool,
  testConnection
};