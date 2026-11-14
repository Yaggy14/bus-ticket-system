import { pool } from '../db.js';

/**
 * Automated 300-Second Time-To-Live (TTL) Seat Lock Release Service
 * Runs periodically to release expired locks and guarantee inventory consistency.
 */
export function startLockScheduler() {
  const CHECK_INTERVAL_MS = 10000; // Check every 10 seconds

  setInterval(async () => {
    try {
      const now = new Date();
      const result = await pool.query(
        `UPDATE seat_locks 
         SET status = 'RELEASED' 
         WHERE status = 'LOCKED' AND expires_at <= $1 
         RETURNING id, trip_id, seat_number`,
        [now]
      );

      if (result.rowCount > 0) {
        console.log(`[TTL Engine] Released ${result.rowCount} expired seat lock(s) at ${now.toISOString()}`);
      }
    } catch (err) {
      // In development / demo environment without active pg, log cleanly
      if (err.code !== 'ECONNREFUSED') {
        console.error('[TTL Engine] Error clearing expired locks:', err.message);
      }
    }
  }, CHECK_INTERVAL_MS);

  console.log('[TTL Engine] Seat lock release scheduler initialized (300s TTL).');
}
