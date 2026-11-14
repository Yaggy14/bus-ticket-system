import { pool } from '../db.js';
import crypto from 'crypto';

export async function lockSeat(req, res) {
  const { trip_id, seat_number } = req.body;
  if (!trip_id || !seat_number) {
    return res.status(400).json({ success: false, message: 'trip_id and seat_number are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if already booked
    const bookedCheck = await client.query(
      `SELECT p.id FROM passengers p 
       JOIN bookings b ON p.booking_id = b.id 
       WHERE b.trip_id = $1 AND p.seat_number = $2`,
      [trip_id, seat_number]
    );
    if (bookedCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Seat is already permanently booked.' });
    }

    // 2. Check if currently locked
    const lockCheck = await client.query(
      `SELECT id FROM seat_locks 
       WHERE trip_id = $1 AND seat_number = $2 AND status = 'LOCKED' AND expires_at > CURRENT_TIMESTAMP`,
      [trip_id, seat_number]
    );
    if (lockCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Seat is currently locked by another customer.' });
    }

    // 3. Grant 300-second (5 min) TTL lock
    const lockToken = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 300 * 1000);

    await client.query(
      `INSERT INTO seat_locks (trip_id, seat_number, lock_token, status, expires_at)
       VALUES ($1, $2, $3, 'LOCKED', $4)
       ON CONFLICT (trip_id, seat_number) 
       DO UPDATE SET lock_token = $3, status = 'LOCKED', expires_at = $4`,
      [trip_id, seat_number, lockToken, expiresAt]
    );

    await client.query('COMMIT');
    return res.json({ success: true, lockToken, expiresAt, ttlSeconds: 300 });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
}

export async function unlockSeat(req, res) {
  const { trip_id, seat_number, lock_token } = req.body;
  try {
    await pool.query(
      `UPDATE seat_locks SET status = 'RELEASED' 
       WHERE trip_id = $1 AND seat_number = $2 AND lock_token = $3`,
      [trip_id, seat_number, lock_token]
    );
    return res.json({ success: true, message: 'Seat unlocked successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function confirmBooking(req, res) {
  const { trip_id, passengers, total_amount } = req.body;
  const pnr = 'PNR-' + Math.floor(100000 + Math.random() * 900000);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const bookingRes = await client.query(
      `INSERT INTO bookings (trip_id, pnr_code, total_amount, payment_status)
       VALUES ($1, $2, $3, 'CONFIRMED') RETURNING id`,
      [trip_id, pnr, total_amount]
    );
    const bookingId = bookingRes.rows[0].id;

    for (const p of passengers) {
      await client.query(
        `INSERT INTO passengers (booking_id, seat_number, full_name, tc_no, gender, phone, email)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [bookingId, p.seatNumber, p.fullName, p.tcNo, p.gender, p.phone, p.email]
      );

      // Commit lock to permanent state
      await client.query(
        `UPDATE seat_locks SET status = 'COMMITTED' 
         WHERE trip_id = $1 AND seat_number = $2`,
        [trip_id, p.seatNumber]
      );
    }

    await client.query('COMMIT');
    return res.json({ success: true, pnrCode: pnr, bookingId });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
}
