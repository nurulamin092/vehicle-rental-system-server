import bcrypt from "bcryptjs";
import { pool } from "../../config/database";

const getAllUser = async () => {
  const result = await pool.query(
    `
    SELECT id, name,email,phone,role,created_at,updated_at FROM users
    `
  );
  return result;
};

const getSingleUser = async (id: string) => {
  const result = await pool.query(
    `
  SELECT id, name,email,phone,role,created_at,updated_at FROM users WHERE id=$1
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

  if (fields.length === 0) {
    const existing = await getSingleUser(id);
    return existing;
  }
  fields.push(`updated_at = NOW()`);

  values.push(id);

  const result = await pool.query(
    `
    UPDATE users SET ${fields.join(", ")}
    WHERE id = $${index} 
    RETURNING id, name,email,phone,role,created_at,updated_at
    `,
    values
  );

  return result;
};

const deleteUser = async (id: string) => {
  const active = await pool.query(
    `
    SELECT 1 FROM bookings WHERE customer_id =$1 AND status='active'
    `,
    [id]
  );

  if (active.rowCount! > 0) {
    const err: any = new Error("User has active bookings");

    err.code = "ACTIVE_BOOKINGS";
    throw err;
  }
  const result = await pool.query(
    `
  DELETE FROM users WHERE id=$1`,
    [id]
  );

  return result;
};
export const userServices = {
  getAllUser,
  getSingleUser,
  updatedUser,
  deleteUser,
};
