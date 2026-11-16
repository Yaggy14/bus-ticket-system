import mongoose from 'mongoose';

const seatLockSchema = new mongoose.Schema({
  trip_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  seat_number: {
    type: Number,
    required: true
  },
  lock_token: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['LOCKED', 'RELEASED', 'COMMITTED'],
    default: 'LOCKED'
  },
  expires_at: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Compound unique index to prevent double-locking the same seat on a trip
seatLockSchema.index({ trip_id: 1, seat_number: 1 }, { unique: true });

// TTL index: MongoDB automatically removes RELEASED locks after expiry
// (used as a secondary cleanup mechanism alongside the lockScheduler)
seatLockSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('SeatLock', seatLockSchema);
