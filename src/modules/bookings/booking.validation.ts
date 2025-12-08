const validateCreateBooking = (payload: any) => {
  const errors: string[] = [];

  if (!payload) {
    errors.push("Request body is required");
    return { valid: false, errors };
  }

  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  if (!customer_id) errors.push("customer_id is required");
  if (!vehicle_id) errors.push("vehicle_id is required");
  if (!rent_start_date) errors.push("rent_start_date is required");
  if (!rent_end_date) errors.push("rent_end_date is required");

  const start = rent_start_date ? new Date(rent_start_date) : null;
  const end = rent_end_date ? new Date(rent_end_date) : null;

  if (start && isNaN(start.getTime()))
    errors.push("rent_start_date is not a valid date");

  if (end && isNaN(end.getTime()))
    errors.push("rent_end_date is not a valid date");

  if (start && end && end.getTime() <= start.getTime())
    errors.push("rent_end_date must be after rent_start_date");

  return { valid: errors.length === 0, errors, start, end };
};

const validateUpdateBooking = async (payload: any) => {
  const errors: string[] = [];
  if (!payload || (!payload.status && payload.status !== "")) {
    errors.push("status is required");
  } else {
    const allowed = ["cancelled", "returned"];

    if (!allowed.includes(payload.status))
      errors.push("status must be canceled or returned");
  }

  return { valid: errors.length === 0, errors };
};

export const bookingValidation = {
  validateCreateBooking,
  validateUpdateBooking,
};
