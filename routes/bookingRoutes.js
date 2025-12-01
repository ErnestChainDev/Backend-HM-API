const express = require('express');
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const {
  validateBookingCreate,
  validateBookingUpdate,
  validateMongoId,
  validatePagination,
} = require('../middleware/validation');

const router = express.Router();

// ✅ GET all bookings with pagination
router.get('/', validatePagination, getAllBookings);

// ✅ GET single booking by ID
router.get('/:id', validateMongoId, getBookingById);

// ✅ POST create new booking
router.post('/', validateBookingCreate, createBooking);

// ✅ PUT update booking
router.put('/:id', validateMongoId, validateBookingUpdate, updateBooking);

// ✅ DELETE booking
router.delete('/:id', validateMongoId, deleteBooking);

module.exports = router;
