import { pool } from "../../config/database";

export interface CreateBookingPayload {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
}

const createBooking = async (payload: CreateBookingPayload) => {
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

const getBookingForUser = async (user: { id: number; role: string }) => {
  if (user.role === "admin") {
    const result = await pool.query(
      `
      SELECT 
      b.id,
      b.customer_id,
      b.vehicle_id,
      b.rent_start_date,
      b.rent_end_date,
      b.total_price,
      b.status,
      json_build_object
      ('name',u.name,'email',u.email) AS customer,
      json_build_object
      ('vehicle_name',v.vehicle_name,'registration_number',v.registration_number) 
      AS vehicles

      FROM bookings b
      JOIN users u ON u.id = b.customer_id
      JOIN vehicles v ON v.id = b.vehicle_id 
      ORDER BY b.id DESC

      `
    );

    return result.rows;
  } else {
    const result = await pool.query(
      `
      SELECT 
      b.id,
      b.customer_id,
      b.vehicle_id,
      b.rent_start_date,
      b.rent_end_date,
      b.total_price,
      b.status,
      json_build_object
      (
        'vehicle_name', v.vehicle_name,
        'registration_number',v.registration_number,
        'type',v.type
      ) AS vehicles 
       FROM bookings b
      JOIN vehicles v ON v.id = b.vehicle_id WHERE b.customer_id =$1  
      ORDER BY b.id DESC
  `,
      [user.id]
    );
    return result.rows;
  }
};

const updateBooking = async (
  bookingId: number,
  newStatus: "cancelled" | "returned",
  currentUser: { id: number; role: string }
) => {
  const client = await pool.connect();

  try {
    const bookingResult = await client.query(
      `
   SELECT 
   id,customer_id, vehicle_id, rent_start_date, 
    rent_end_date,total_price,status FROM bookings WHERE id=$1 FOR UPDATE
  `,
      [bookingId]
    );

    if (bookingResult.rowCount === 0) {
      const err: any = new Error("Booking not found");
      err.status = 404;
      throw err;
    }
    const booking = bookingResult.rows[0];

    if (booking.status !== "active") {
      const err: any = new Error("Only active booking can be updated ");
      err.status = 400;
      throw err;
    }

    const today = new Date();

    const rentStart = new Date(booking.rent_start_date);

    if (newStatus === "cancelled") {
      if (
        currentUser.role !== "admin" &&
        Number(currentUser.id) !== Number(booking.customer_id)
      ) {
        const err: any = new Error(
          "Forbidden: only  booking owner can be cancel "
        );
        err.status = 403;
        throw err;
      }

      if (today.getTime() >= rentStart.getTime()) {
        const err: any = new Error(
          " Can't cancel booking on or after rent_start_date "
        );
        err.status = 400;
        throw err;
      }
      await client.query(
        `
    UPDATE bookings SET status='cancelled', updated_at=NOW() WHERE id=$1`,
        [bookingId]
      );
      await pool.query(
        `
    UPDATE vehicles SET availability_status='available', updated_at = NOW() WHERE id=$1`,
        [booking.vehicle_id]
      );

      await client.query("COMMIT");

      const out = {
        id: booking.id,
        customer_id: booking.customer_id,
        vehicle_id: booking.vehicle_id,
        rent_start_date: booking.rent_start_date,
        rent_end_date: booking.rent_end_date,
        total_price: booking.total_price,
        status: "cancelled",
      };

      return out;
    }

    if (newStatus === "returned") {
      if (currentUser.role !== "admin") {
        const err: any = new Error(
          "Forbidden: only  admin  can mark returned "
        );
        err.status = 403;
        throw err;
      }

      await client.query(
        `
    UPDATE bookings SET status='cancelled', updated_at=NOW() WHERE id=$1`,
        [bookingId]
      );
      await pool.query(
        `
    UPDATE vehicles SET availability_status='available', updated_at = NOW() WHERE id=$1`,
        [booking.vehicle_id]
      );
      await client.query("COMMIT");

      const out = {
        id: booking.id,
        customer_id: booking.customer_id,
        vehicle_id: booking.vehicle_id,
        rent_start_date: booking.rent_start_date,
        rent_end_date: booking.rent_end_date,
        total_price: booking.total_price,
        status: "returned",
        vehicle: { availability_status: "available" },
      };

      return out;
    }

    throw Error("Unsupported status");
  } catch (err: any) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const autoReturnExpiredBookings = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(`
      SELECT id, vehicle_id FROM bookings WHERE
       status = 'active' AND rent_end_date < CURRENT_DATE FOR UPDATE`);
    for (const row of result.rows) {
      const bookingId = row.id;
      const vehicleId = row.vehicle_id;
      await client.query(
        `
    UPDATE bookings SET status='returned', updated_at=NOW() WHERE id=$1`,
        [bookingId]
      );
      await pool.query(
        `
    UPDATE vehicles SET availability_status='available', updated_at = NOW() WHERE id=$1`,
        [vehicleId]
      );
    }
    await client.query("COMMIT");
    return { updated: result.rowCount };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const bookingServices = {
  createBooking,
  getAllBookings,
  getBookingForUser,
  updateBooking,
  autoReturnExpiredBookings,
};
