import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Max connections
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false, // 🔒 important for Render/PlanetScale
  },
  connectTimeout: 10000, // 10s to avoid ETIMEDOUT
});

export default pool;
