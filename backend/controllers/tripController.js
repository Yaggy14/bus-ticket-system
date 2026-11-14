import { pool } from '../db.js';

export async function searchTrips(req, res) {
  const { origin, destination, date } = req.query;
  try {
    const query = `
      SELECT t.id, t.origin, t.destination, t.departure_time, t.arrival_time, t.base_fare,
             b.plate_number, b.layout_type, b.model
      FROM trips t
      JOIN buses b ON t.bus_id = b.id
      WHERE ($1::varchar IS NULL OR t.origin ILIKE $1)
        AND ($2::varchar IS NULL OR t.destination ILIKE $2)
        AND t.is_active = TRUE
      ORDER BY t.departure_time ASC
    `;
    const result = await pool.query(query, [origin || null, destination || null]);
    return res.json({ success: true, trips: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getTripSeats(req, res) {
  const { id } = req.params;
  try {
    const seatsQuery = `
      SELECT s.seat_number, s.row_idx, s.col_idx,
             p.gender,
             sl.status AS lock_status, sl.expires_at
      FROM trips t
      JOIN buses b ON t.bus_id = b.id
      JOIN seats s ON s.bus_id = b.id
      LEFT JOIN passengers p ON p.seat_number = s.seat_number 
        AND p.booking_id IN (SELECT id FROM bookings WHERE trip_id = $1)
      LEFT JOIN seat_locks sl ON sl.trip_id = $1 
        AND sl.seat_number = s.seat_number 
        AND sl.status = 'LOCKED' 
        AND sl.expires_at > CURRENT_TIMESTAMP
      WHERE t.id = $1
      ORDER BY s.seat_number ASC
    `;
    const result = await pool.query(seatsQuery, [id]);
    return res.json({ success: true, seats: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
