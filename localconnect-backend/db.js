const mysql = require("mysql2/promise");

// Create a pool of connections
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost", // e.g., 'localhost'
  user: process.env.DB_USER || "harsharavuri", // e.g., 'myding_user'
  password: process.env.DB_PASSWORD || "password", // Your secure password
  database: process.env.DB_NAME || "localconnect", // e.g., 'my db name'
  port: process.env.DB_PORT || 3306, // Default MariaDB/MySQL port
  waitForConnections: true, // Enable connection pooling
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0, // No limit for queued requests
});

// Example to test the connection
async function testConnection() {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();
    console.log("Connected to the database!");
    
    // Don't forget to release the connection when done
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

// Test the database connection
testConnection();

module.exports = pool;
