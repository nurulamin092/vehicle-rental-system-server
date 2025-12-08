import { pool } from "../../config/database";

export interface CreateBookingPayload {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
}

const createBooing = async (payload: CreateBookingPayload) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  const start = new Date(rent_start_date);

  const end = new Date(rent_end_date);

  const msPerDay = 1000 * 60 * 60 * 24;

  const days = Math.round((end.getTime() - start.getTime()) / msPerDay);

  if (days <= 0) {
    const err: any = new Error("End date must be after start date");
    err.status = 400;
    throw err;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const vehicleRegistrationNumber = await client.query(
      `
      SELECT id ,vehicle_name , daily_rent_price,availability_status FROM vehicles WHERE id=$1 FOR UPDATE
      `,
      [vehicle_id]
    );

    if (vehicleRegistrationNumber.rowCount === 0) {
      const err: any = new Error("Vehicle not found");
      err.status = 404;
      throw err;
    }

    const vehicle = vehicleRegistrationNumber.rows[0];

    if (vehicle.availability_status !== "available") {
      const err: any = new Error("Vehicle not available to booking");
      err.status = 400;
      throw err;
    }

    const daily_price = Number(vehicle.daily_rent_price);

    const total_price = (daily_price * days).toFixed(2);

    const result = await client.query(
      `
    INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date,total_price,status)
    VALUES ($1, $2, $3, $4, $5, 'active') RETURNING id, customer_id, vehicle_id, rent_start_date, 
    rent_end_date,total_price,status`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );

    await client.query(
      `
    UPDATE vehicles SET availability_status='booked', updated_at = NOW() WHERE id=$1
    `,
      [vehicle_id]
    );

    await client.query("COMMIT");

    const booking = result.rows[0];

    booking.vehicle = {
      vehicle_name: vehicle.vehicle_name,
      daily_rent_price: Number(vehicle.daily_rent_price),
    };
    return booking;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getAllBookings = async () => {
  const result = await pool.query(`
  SELECT * FROM bookings 
  `);
  return result;
};

const updateBooking = async (bookingId: string) => {
  const booking = await pool.query(
    `
  SELECT * FROM bookings WHERE id=$1
  `,
    [bookingId]
  );

  if (booking.rows.length === 0) {
    throw new Error("Booking not found");
  }
  const vehicleId = booking.rows[0].vehicle_id;

  await pool.query(
    `
    UPDATE bookings SET status='returned' WHERE id=$1`,
    [bookingId]
  );

  await pool.query(
    `
    UPDATE vehicles SET availability_status='available' WHERE id=$1`,
    [vehicleId]
  );
  return booking;
};

export const bookingServices = {
  createBooing,
  getAllBookings,
  updateBooking,
};
