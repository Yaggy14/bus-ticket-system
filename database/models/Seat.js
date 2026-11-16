import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  bus_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  seat_number: {
    type: Number,
    required: true
  },
  row_idx: {
    type: Number,
    required: true
  },
  col_idx: {
    type: Number,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

seatSchema.index({ bus_id: 1, seat_number: 1 }, { unique: true });

export default mongoose.model('Seat', seatSchema);
