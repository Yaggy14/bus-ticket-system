import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  trip_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  pnr_code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED'],
    default: 'CONFIRMED'
  }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
