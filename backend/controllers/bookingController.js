import crypto from 'crypto';
import mongoose from 'mongoose';
import SeatLock from '../../database/models/SeatLock.js';
import Booking from '../../database/models/Booking.js';
import Passenger from '../../database/models/Passenger.js';
import SecurityLog from '../../database/models/SecurityLog.js';

/**
 * POST /api/seats/lock
 * Acquire a 300-second TTL distributed seat lock (Concurrency Lock Engine).
 * Uses Mongoose findOneAndUpdate with upsert for atomic operation.
 * Fatma Abuabid - Module 1 (Backend Core & Concurrency Engine)
 */
export async function lockSeat(req, res) {
  const { trip_id, seat_number } = req.body;
  if (!trip_id || seat_number == null) {
    return res.status(400).json({ success: false, message: 'trip_id and seat_number are required.' });
  }

  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 300 * 1000); // 300s TTL
    const lockToken = crypto.randomBytes(16).toString('hex');

    // Check if already LOCKED by another client (not expired)
    const existing = await SeatLock.findOne({
      trip_id,
      seat_number,
      status: 'LOCKED',
      expires_at: { $gt: now }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Seat is currently locked by another customer. Please try another seat.'
      });
    }

    // Atomically upsert lock (handles released/expired entries cleanly)
    const lock = await SeatLock.findOneAndUpdate(
      { trip_id, seat_number },
      {
        $set: {
          lock_token: lockToken,
          status: 'LOCKED',
          expires_at: expiresAt
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    await SecurityLog.create({
      event_type: 'SEAT_LOCKED',
      details: { trip_id, seat_number, lock_token: lockToken },
      ip_address: req.ip
    });

    return res.json({ success: true, lockToken, expiresAt, ttlSeconds: 300 });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/seats/unlock
 * Release a seat lock by token (called on timeout modal or navigation back).
 * Fatma Abuabid - Module 1 (Backend Core & Concurrency Engine)
 */
export async function unlockSeat(req, res) {
  const { trip_id, seat_number, lock_token } = req.body;
  try {
    await SeatLock.findOneAndUpdate(
      { trip_id, seat_number, lock_token },
      { $set: { status: 'RELEASED' } }
    );
    return res.json({ success: true, message: 'Seat released successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/bookings/confirm
 * Commit booking with Mongoose session (ACID-equivalent multi-collection write).
 * Fatma Abuabid - Module 1 (Backend Core & Concurrency Engine)
 */
export async function confirmBooking(req, res) {
  const { trip_id, passengers, total_amount } = req.body;
  const pnrCode = 'PNR-' + Math.floor(100000 + Math.random() * 900000);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create booking document
    const [booking] = await Booking.create(
      [{ trip_id, pnr_code: pnrCode, total_amount, payment_status: 'CONFIRMED' }],
      { session }
    );

    // 2. Create passenger documents
    const passengerDocs = passengers.map(p => ({
      booking_id: booking._id,
      seat_number: p.seatNumber,
      full_name: p.fullName,
      tc_no: p.tcNo,
      gender: p.gender,
      phone: p.phone,
      email: p.email
    }));
    await Passenger.insertMany(passengerDocs, { session });

    // 3. Commit seat locks to permanent state
    for (const p of passengers) {
      await SeatLock.findOneAndUpdate(
        { trip_id, seat_number: p.seatNumber },
        { $set: { status: 'COMMITTED' } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    await SecurityLog.create({
      event_type: 'BOOKING_CONFIRMED',
      details: { pnr_code: pnrCode, trip_id, seat_count: passengers.length },
      ip_address: req.ip
    });

    return res.json({ success: true, pnrCode, bookingId: booking._id });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/bookings/validate-passenger
 * Server-side T.C. ID validation guard (double-check after client-side validation).
 * Fatma Abuabid - Module 1 (Backend Core & Concurrency Engine)
 */
export async function validatePassenger(req, res) {
  const { tc_no } = req.body;
  if (!tc_no || !/^\d{11}$/.test(tc_no) || tc_no[0] === '0') {
    return res.status(400).json({ success: false, message: 'Invalid T.C. ID format.' });
  }
  const digits = tc_no.split('').map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const d10 = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  if (d10 !== digits[9]) {
    return res.status(400).json({ success: false, message: 'T.C. ID failed algorithmic parity check.' });
  }
  const sumFirst10 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (sumFirst10 % 10 !== digits[10]) {
    return res.status(400).json({ success: false, message: 'T.C. ID failed sum check.' });
  }
  return res.json({ success: true, message: 'T.C. ID is valid.' });
}
