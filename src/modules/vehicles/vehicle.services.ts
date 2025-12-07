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

export const vehicleServices = {
  createVehicle,
};
