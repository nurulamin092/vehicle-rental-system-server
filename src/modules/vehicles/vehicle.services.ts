import { pool } from "../../config/database";

const allowedTypes = ["car", "bike", "van", "suv"];

const createVehicle = async (payload: any) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  const errors: string[] = [];

  if (!vehicle_name) errors.push("vehicle_name is required");

  if (!type) {
    errors.push("type is required");
  } else if (!allowedTypes.includes(String(type).toLowerCase())) {
    errors.push("type must be one of: car, bike, van, suv");
  }

  if (!registration_number) errors.push("registration_number is required ");

  const registerNumber = String(registration_number).toLowerCase().trim();

  if (daily_rent_price === undefined || daily_rent_price === null) {
    errors.push("daily_rent_price is required");
  } else if (isNaN(Number(daily_rent_price))) {
    errors.push("daily_rent_price must be a valid number");
  } else if (Number(daily_rent_price) <= 0) {
    errors.push("daily rent_price must be a positive number");
  }

  const avail = availability_status
    ? String(availability_status).toLowerCase()
    : "available";

  if (!["available", "booked"].includes(avail)) {
    errors.push("available_status must be 'available' or 'booked'");
  }

  if (errors.length) {
    const err: any = new Error(errors.join(", "));
    err.status = 400;
    throw err;
  }
  try {
    const result = await pool.query(
      `
    INSERT INTO vehicles
     (vehicle_name, type, registration_number, daily_rent_price,availability_status) VALUES
    ($1,$2,$3,$4,$5) RETURNING id, vehicle_name, type, registration_number, daily_rent_price,availability_status
    `,
      [
        vehicle_name.trim(),
        type.toLowerCase(),
        registerNumber,
        Number(daily_rent_price),
        avail,
      ]
    );
    return result.rows[0];
  } catch (err: any) {
    if (err.code === "23505") {
      const e: any = new Error("Registration_number already exists");
      e.status = 409;
      throw e;
    }
    throw err;
  }
};

const getAllVehicle = async () => {
  const result = await pool.query(
    `
    SELECT * FROM vehicles 
    `
  );
  return result;
};

const getSingleVehicle = async (id: string) => {
  const result = await pool.query(
    `
    SELECT * FROM vehicles WHERE id=$1`,
    [id]
  );

  return result;
};

const updatedVehicle = async (id: string, payload: any) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in payload) {
    fields.push(`${key}= $${index}`);
    values.push(payload[key]);
    index++;
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `
    UPDATE vehicles SET ${fields.join(", ")}
    WHERE id=$${index} RETURNING *

    `,
    values
  );
  return result;
};

const deleteVehicle = async (id: string) => {
  const result = await pool.query(
    `
    DELETE FROM vehicles WHERE id=$1`,
    [id]
  );
  return result;
};
export const vehicleServices = {
  createVehicle,
  getAllVehicle,
  getSingleVehicle,
  updatedVehicle,
  deleteVehicle,
};
