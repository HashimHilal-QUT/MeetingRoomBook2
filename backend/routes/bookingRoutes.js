const express = require('express');
const { createBooking, getBookings, getBookingById, updateBooking, deleteBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getBookings).post(protect, createBooking);
router.route('/:id').get(protect, getBookingById).put(protect, updateBooking).delete(protect, deleteBooking);

module.exports = router;
