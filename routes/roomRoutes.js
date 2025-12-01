const express = require('express');
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const {
  validateRoomCreate,
  validateRoomUpdate,
  validateMongoId,
  validatePagination,
} = require('../middleware/validation');

const router = express.Router();

// ✅ Middleware as second parameter (not wrapped in arrow function)
router.get('/', validatePagination, getAllRooms);
router.get('/:id', validateMongoId, getRoomById);
router.post('/', validateRoomCreate, createRoom);
router.put('/:id', validateMongoId, validateRoomUpdate, updateRoom);
router.delete('/:id', validateMongoId, deleteRoom);

module.exports = router;
