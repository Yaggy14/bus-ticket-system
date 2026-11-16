import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  seat_number: {
    type: Number,
    required: true
  },
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  tc_no: {
    type: String,
    required: true,
    length: 11
  },
  gender: {
    type: String,
    required: true,
    enum: ['ERKEK', 'KADIN']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  }
}, { timestamps: true });

export default mongoose.model('Passenger', passengerSchema);
