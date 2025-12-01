const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');

// ==============================================
// GET ALL BOOKINGS
// ==============================================
exports.getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('guestId', 'name email phone')
      .populate('roomId', 'number type price')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================
// GET BOOKING BY ID
// ==============================================
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guestId')
      .populate('roomId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ==============================================
// CREATE BOOKING
// ==============================================
exports.createBooking = async (req, res, next) => {
  try {
    const { guestId, roomId, checkIn, checkOut, totalPrice, notes, status } = req.body;

    console.log('📥 Booking data received:', req.body);

    if (!guestId || !roomId || !checkIn || !checkOut || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Please provide guestId, roomId, checkIn, checkOut, and totalPrice',
      });
    }

    const guest = await Guest.findById(guestId);
    if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

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

    // FIXED POPULATE
    await booking.populate([
      { path: 'guestId' },
      { path: 'roomId' }
    ]);

    console.log('✅ Booking created:', booking);

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ==============================================
// UPDATE BOOKING
// ==============================================
exports.updateBooking = async (req, res, next) => {
  try {
    const { guestId, roomId, checkIn, checkOut, status, totalPrice, notes } = req.body;

    console.log('📥 Update data received:', req.body);

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (guestId) {
      const guest = await Guest.findById(guestId);
      if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
      booking.guestId = guestId;
    }

    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
      booking.roomId = roomId;
    }

    if (checkIn) booking.checkIn = new Date(checkIn);
    if (checkOut) booking.checkOut = new Date(checkOut);
    if (status) booking.status = status;
    if (totalPrice !== undefined) booking.totalPrice = Number(totalPrice);
    if (notes !== undefined) booking.notes = notes;

    if (booking.checkOut <= booking.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    await booking.save();

    // FIXED POPULATE
    await booking.populate([
      { path: 'guestId' },
      { path: 'roomId' }
    ]);

    console.log('✅ Booking updated:', booking);

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ==============================================
// DELETE BOOKING
// ==============================================
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    console.log('✅ Booking deleted:', booking._id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
