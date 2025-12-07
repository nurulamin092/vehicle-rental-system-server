import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
  connectionString: `${config.connect_str}`,
});

const initDb = async () => {
  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT  NOT NULL CHECK (LENGTH(password)>=6),
    phone VARCHAR(15) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK(role IN('admin','customer')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    )
    `
  );

  await pool.query(`
  CREATE TABLE IF NOT EXISTS vehicles(
  id SERIAL PRIMARY KEY,
  vehicle_name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK(type IN('car','bike','van','SUV')),
  registration_number VARCHAR (150) UNIQUE NOT NULL,
  daily_rent_price NUMERIC(10,2) NOT NULL CHECK (daily_rent_price>0),
  availability_status VARCHAR(100) NOT NULL CHECK(availability_status IN('available','booked')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW())  
 `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email))
    `);
};

export default initDb;
