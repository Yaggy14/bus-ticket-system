import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  plate_number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  model: {
    type: String,
    required: true
  },
  total_capacity: {
    type: Number,
    required: true,
    min: 1
  },
  layout_type: {
    type: String,
    required: true,
    enum: ['1+1+1', '2+1', '2+2']
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Bus', busSchema);
