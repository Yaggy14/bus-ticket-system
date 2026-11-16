import SeatLock from '../../database/models/SeatLock.js';

/**
 * Automated 300-Second Time-To-Live (TTL) Seat Lock Release Service
 * Runs periodically to release expired LOCKED seats back to AVAILABLE.
 * Fatma Abuabid - Module 1 (Backend Core & Concurrency Engine)
 */
export function startLockScheduler() {
  const CHECK_INTERVAL_MS = 10000; // Poll every 10 seconds

  setInterval(async () => {
    try {
      const now = new Date();
      const result = await SeatLock.updateMany(
        { status: 'LOCKED', expires_at: { $lte: now } },
        { $set: { status: 'RELEASED' } }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `[TTL Engine] Released ${result.modifiedCount} expired seat lock(s) at ${now.toISOString()}`
        );
      }
    } catch (err) {
      console.error('[TTL Engine] Error clearing expired locks:', err.message);
    }
  }, CHECK_INTERVAL_MS);

  console.log('[TTL Engine] Seat lock release scheduler initialized (300s TTL).');
}
