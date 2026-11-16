import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bus_ticket_db';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      // TLS/SSL for cloud-hosted Atlas connections
      tls: process.env.NODE_ENV === 'production',
    });
    console.log('[MongoDB] Connected successfully to:', MONGODB_URI.split('@').pop() || MONGODB_URI);
  } catch (err) {
    console.error('[MongoDB] Connection error:', err.message);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from database.');
});
