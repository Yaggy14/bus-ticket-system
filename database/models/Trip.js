import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  bus_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  origin: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  departure_time: {
    type: Date,
    required: true
  },
  arrival_time: {
    type: Date,
    required: true
  },
  base_fare: {
    type: Number,
    required: true,
    min: 0
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for fast origin/destination search
tripSchema.index({ origin: 1, destination: 1, departure_time: 1 });

export default mongoose.model('Trip', tripSchema);
