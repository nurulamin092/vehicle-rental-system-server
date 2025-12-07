import bcrypt from "bcryptjs";
import { pool } from "../../config/database";

const createUser = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  if (!password || (password as string).length < 6) {
    throw new Error("Password must be 6 character long...");
  }
  const hasPassword = await bcrypt.hash(password as string, 10);

  const emailToLowerCase = (email as string).toLowerCase();

  const result = await pool.query(
    `
    INSERT INTO users (name,email,password,phone,role) VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [name, emailToLowerCase, hasPassword, phone, role]
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

const getSingleUser = async (id: string) => {
  const result = await pool.query(
    `
  SELECT * FROM users WHERE id=$1
  `,
    [id]
  );
  return result;
};

const updatedUser = async (id: string, payload: any) => {
  const fields = [];

  const values: any[] = [];

  let index = 1;

  if (payload.password) {
    if (payload.password.length < 6) {
      throw new Error("password must be 6 characters.");
    }
    payload.password = await bcrypt.hash(payload.password, 10);
  }

  if (payload.email) {
    payload.email = payload.email.toLowerCase();
  }

  for (const key in payload) {
    fields.push(`${key}=$${index}`);
    values.push(payload[key]);
    index++;
  }

  fields.push(`updated_at = NOW()`);

  values.push(id);

  const result = await pool.query(
    `
    UPDATE users SET ${fields.join(", ")}
    WHERE id = $${index} RETURNING *
    `,
    values
  );

  return result;
};

const deleteUser = async (id: string) => {
  const result = await pool.query(
    `
  DELETE FROM users WHERE id=$1`,
    [id]
  );

  return result;
};
export const userServices = {
  createUser,
  getAllUser,
  getSingleUser,
  updatedUser,
  deleteUser,
};
