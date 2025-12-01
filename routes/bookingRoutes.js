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

// ✅ Middleware as second parameter
router.get('/', validatePagination, getAllBookings);
router.get('/:id', validateMongoId, getBookingById);
router.post('/', validateBookingCreate, createBooking);
router.put('/:id', validateMongoId, validateBookingUpdate, updateBooking);
router.delete('/:id', validateMongoId, deleteBooking);

module.exports = router;
