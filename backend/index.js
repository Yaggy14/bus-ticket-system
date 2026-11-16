import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import tripRoutes from './routes/tripRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { startLockScheduler } from './services/lockScheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/trips', tripRoutes);
app.use('/api/seats', bookingRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: 'mongodb', timestamp: new Date().toISOString() });
});

// Connect to MongoDB then start server
connectDB().then(() => {
  // Start Background TTL Seat Lock Scheduler (300s TTL)
  startLockScheduler();

  app.listen(PORT, () => {
    console.log(`[CEN317 API] Server running on http://localhost:${PORT}`);
  });
});
