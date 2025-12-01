const express = require('express');
const {
  getAllGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestBookings,
} = require('../controllers/guestController');
const {
  validateGuestCreate,
  validateGuestUpdate,
  validateMongoId,
  validatePagination,
} = require('../middleware/validation');

const router = express.Router();

// ✅ Middleware as second parameter
router.get('/', validatePagination, getAllGuests);
router.get('/:id', validateMongoId, getGuestById);
router.post('/', validateGuestCreate, createGuest);
router.put('/:id', validateMongoId, validateGuestUpdate, updateGuest);
router.delete('/:id', validateMongoId, deleteGuest);
router.get('/:id/bookings', validateMongoId, getGuestBookings);

module.exports = router;
