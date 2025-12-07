import bcrypt from "bcryptjs";
import { pool } from "../../config/database";
const signup = async (payload: any) => {
  const { name, email, password, phone, role } = payload;
  if (!password || (password as string).length < 6) {
    throw new Error("Password must be 6 character long...");
  }
  const hasPassword = await bcrypt.hash(password as string, 10);
  const emailToLowerCase = (email as string).toLowerCase();

  try {
    const result = await pool.query(
      `
        INSERT INTO users (name,email,password,phone,role) VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [name, emailToLowerCase, hasPassword, phone, role || "customer"]
    );
    return result.rows[0];
  } catch (err: any) {
    if (err.code === "23505") {
      throw new Error("Email already exist");
    }
    throw err;
  }
};

export const authServices = {
  signup,
};
