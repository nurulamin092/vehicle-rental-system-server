import bcrypt from "bcryptjs";
import { pool } from "../../config/database";
import jwt from "jsonwebtoken";
import config from "../../config";
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

const signin = async (payload: any) => {
  const { email, password } = payload;
  const emailToLowerCase = (email as string).toLowerCase();
  const result = await pool.query(
    `
    SELECT id,name,email,password,role FROM users WHERE LOWER(email) =$1
    `,
    [emailToLowerCase]
  );

  if (result.rowCount === 0) {
    throw new Error("Invalid user email");
  }

  const user = result.rows[0];

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Password not matched");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    config.jwt_secret as string,
    {
      expiresIn: "7d",
    }
  );

  return { token, user: { id: user.id, email: user.email, role: user.role } };
};

export const authServices = {
  signup,
  signin,
};
