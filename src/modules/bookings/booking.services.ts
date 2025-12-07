import { pool } from "../../config/database";

const createBooing = async (payload: any) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  const vehicle = await pool.query(
    `
    SELECT * FROM vehicles WHERE id=$1 AND  availability_status ='available'
    `,
    [vehicle_id]
  );

  if (vehicle.rows.length === 0) {
    throw new Error("Vehicle not available to booking");
  }

  const daily_price = Number(vehicle.rows[0].daily_rent_price);

  const days =
    (new Date(rent_end_date).getTime() - new Date(rent_start_date).getTime()) /
    (1000 * 60 * 60 * 24);

  if (days <= 0) {
    throw new Error("End date must be after start date");
  }

  const total_price = days * daily_price;

  const result = await pool.query(
    `
    INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date,total_price,status)
    VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *
    `,
    [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
  );

  await pool.query(
    `
    UPDATE vehicles SET availability_status='booked' WHERE id=$1
    `,
    [vehicle_id]
  );

  return result;
};

const getAllBookings = async () => {
  const result = await pool.query(`
  SELECT * FROM bookings 
  `);
  return result;
};

export const bookingServices = {
  createBooing,
  getAllBookings,
};
