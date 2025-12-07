import { pool } from "../../config/database";

const createVehicle = async (payload: any) => {
  const { vehicle_name, type, registration_number, daily_rent_price } = payload;

  const result = await pool.query(
    `
    INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price,availability_status) VALUES
    ($1,$2,$3,$4,'available')
    `,
    [vehicle_name, type, registration_number, daily_rent_price]
  );

  return result;
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
  return result.rows[0];
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
