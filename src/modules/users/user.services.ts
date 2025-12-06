import bcrypt from "bcryptjs";
import { pool } from "../../config/database";

const createUser = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  if (!password || (password as string).length < 6) {
    throw new Error("Password must be 6 character long...");
  }
  const hasPassword = await bcrypt.hash(password as string, 10);

  const result = await pool.query(
    `
    INSERT INTO users (name,email,password,phone,role) VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [name, email, hasPassword, phone, role]
  );

  return result;
};

const getAllUser = async () => {
  const result = await pool.query(
    `
    SELECT * FROM users
    `
  );
  return result;
};

export const userServices = {
  createUser,
  getAllUser,
};
