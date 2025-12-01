const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');

// @desc    Get all bookings with pagination and filtering
// @route   GET /api/bookings?page=1&limit=10&status=confirmed
// @access  Public
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('guestId', 'name email phone')
      .populate('roomId', 'number type price')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Error in getAllBookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Public
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guestId')
      .populate('roomId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('❌ Error in getBookingById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    const { guestId, roomId, checkIn, checkOut, totalPrice, notes, status } = req.body;

    console.log('📥 Booking data received:', req.body);

    // Validation
    if (!guestId || !roomId || !checkIn || !checkOut || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Please provide guestId, roomId, checkIn, checkOut, and totalPrice',
      });
    }

    // Verify guest exists
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found',
      });
    }

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    const booking = await Booking.create({
      guestId,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice: Number(totalPrice),
      notes: notes || '',
      status: status || 'pending',
    });

    await booking.populate('guestId').populate('roomId');

    console.log('✅ Booking created:', booking);

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('❌ Error in createBooking:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Public
exports.updateBooking = async (req, res) => {
  try {
    const { guestId, roomId, checkIn, checkOut, status, totalPrice, notes } = req.body;

    console.log('📥 Update data received:', req.body);

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify guest exists if updating
    if (guestId) {
      const guest = await Guest.findById(guestId);
      if (!guest) {
        return res.status(404).json({
          success: false,
          message: 'Guest not found',
        });
      }
      booking.guestId = guestId;
    }

    // Verify room exists if updating
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }
      booking.roomId = roomId;
    }

    // Update fields
    if (checkIn) booking.checkIn = new Date(checkIn);
    if (checkOut) booking.checkOut = new Date(checkOut);
    if (status) booking.status = status;
    if (totalPrice !== undefined) booking.totalPrice = Number(totalPrice);
    if (notes !== undefined) booking.notes = notes;

    // Validate dates
    if (booking.checkOut <= booking.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    await booking.save();
    await booking.populate('guestId').populate('roomId');

    console.log('✅ Booking updated:', booking);

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('❌ Error in updateBooking:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Public
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    console.log('✅ Booking deleted:', booking._id);

    res.status(200).json({ success: true, message: 'Booking deleted successfully', data: booking });
  } catch (error) {
    console.error('❌ Error in deleteBooking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
