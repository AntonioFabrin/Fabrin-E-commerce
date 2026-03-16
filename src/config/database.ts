import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();


const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "ecommerce",
    waitForConnections: true,
    connectionLimit:10,
    queueLimit: 0
});

console.log("Pool de conexões MySQL configurado!");

export default pool;