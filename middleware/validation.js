/**
 * Request validation middleware
 * Validates request body, params, and queries
 */

// Validate required fields
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = [];

    fields.forEach(field => {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
};

// ✅ FIX: Validate room creation - Return proper middleware
const validateRoomCreate = (req, res, next) => {
  const { number, type, price, capacity } = req.body;

  if (!number || !type || price === undefined || !capacity) {
    return res.status(400).json({
      success: false,
      message: 'Please provide number, type, price, and capacity',
    });
  }

  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a positive number',
    });
  }

  if (typeof capacity !== 'number' || capacity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Capacity must be a positive number',
    });
  }

  if (!['single', 'double', 'deluxe', 'suite'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Type must be one of: single, double, deluxe, suite',
    });
  }

  next();
};

// ✅ FIX: Validate room update
const validateRoomUpdate = (req, res, next) => {
  const { price, capacity, type, status } = req.body;

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a positive number',
    });
  }

  if (capacity !== undefined && (typeof capacity !== 'number' || capacity < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Capacity must be a positive number',
    });
  }

  if (type && !['single', 'double', 'deluxe', 'suite'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Type must be one of: single, double, deluxe, suite',
    });
  }

  if (status && !['available', 'occupied', 'maintenance'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be one of: available, occupied, maintenance',
    });
  }

  next();
};

// ✅ FIX: Validate guest creation
const validateGuestCreate = (req, res, next) => {
  const { name, email, phone, address } = req.body;

  if (!name || !email || !phone || !address) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, phone, and address',
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address',
    });
  }

  // Name validation
  if (name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name must be at least 2 characters',
    });
  }

  next();
};

// ✅ FIX: Validate guest update
const validateGuestUpdate = (req, res, next) => {
  const { email, name } = req.body;

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }
  }

  if (name && name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name must be at least 2 characters',
    });
  }

  next();
};

// ✅ FIX: Validate booking creation
const validateBookingCreate = (req, res, next) => {
  const { guestId, roomId, checkIn, checkOut, totalPrice } = req.body;

  if (!guestId || !roomId || !checkIn || !checkOut || totalPrice === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide guestId, roomId, checkIn, checkOut, and totalPrice',
    });
  }

  // Validate dates
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Use YYYY-MM-DD',
    });
  }

  if (checkOutDate <= checkInDate) {
    return res.status(400).json({
      success: false,
      message: 'Check-out date must be after check-in date',
    });
  }

  // Validate price
  if (typeof totalPrice !== 'number' || totalPrice < 0) {
    return res.status(400).json({
      success: false,
      message: 'Total price must be a positive number',
    });
  }

  next();
};

// ✅ FIX: Validate booking update
const validateBookingUpdate = (req, res, next) => {
  const { checkIn, checkOut, totalPrice, status } = req.body;

  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }
  }

  if (totalPrice !== undefined && (typeof totalPrice !== 'number' || totalPrice < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Total price must be a positive number',
    });
  }

  if (status && !['pending', 'confirmed', 'checked-in', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be one of: pending, confirmed, checked-in, completed, cancelled',
    });
  }

  next();
};

// ✅ FIX: Validate MongoDB ObjectId
const validateMongoId = (req, res, next) => {
  const { id } = req.params;
  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

  if (!mongoIdRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  next();
};

// ✅ FIX: Validate pagination params
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive number',
    });
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100',
    });
  }

  next();
};

module.exports = {
  validateRequired,
  validateRoomCreate,
  validateRoomUpdate,
  validateGuestCreate,
  validateGuestUpdate,
  validateBookingCreate,
  validateBookingUpdate,
  validateMongoId,
  validatePagination,
};
