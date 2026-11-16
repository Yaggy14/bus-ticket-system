import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema({
  event_type: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip_address: {
    type: String,
    default: null
  }
}, { timestamps: true });

export default mongoose.model('SecurityLog', securityLogSchema);
