const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Meeting title is required'], trim: true },
    room: { type: String, required: [true, 'Room name is required'], trim: true },
    date: { type: String, required: [true, 'Date is required'] },
    startTime: { type: String, required: [true, 'Start time is required'] },
    endTime: { type: String, required: [true, 'End time is required'] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
