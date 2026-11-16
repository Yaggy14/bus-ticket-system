import Trip from '../../database/models/Trip.js';
import Seat from '../../database/models/Seat.js';
import SeatLock from '../../database/models/SeatLock.js';
import Passenger from '../../database/models/Passenger.js';

/**
 * GET /api/trips/search
 * Search trips by origin and/or destination.
 * Module 1 (Backend Core) - Fatma Abuabid
 */
export async function searchTrips(req, res) {
  const { origin, destination, date } = req.query;
  try {
    const filter = { is_active: true };
    if (origin) filter.origin = { $regex: origin, $options: 'i' };
    if (destination) filter.destination = { $regex: destination, $options: 'i' };

    const trips = await Trip.find(filter)
      .populate('bus_id', 'plate_number layout_type model total_capacity')
      .sort({ departure_time: 1 })
      .lean();

    return res.json({ success: true, trips });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/trips/:id/seats
 * Return seat status (available / locked / booked) for a given trip.
 * Module 1 (Backend Core) - Fatma Abuabid
 */
export async function getTripSeats(req, res) {
  const { id } = req.params;
  try {
    const trip = await Trip.findById(id).populate('bus_id').lean();
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });

    const seats = await Seat.find({ bus_id: trip.bus_id._id }).sort({ seat_number: 1 }).lean();

    // Fetch active locks for this trip
    const activeLocks = await SeatLock.find({
      trip_id: id,
      status: 'LOCKED',
      expires_at: { $gt: new Date() }
    }).lean();
    const lockedSet = new Set(activeLocks.map(l => l.seat_number));

    // Fetch permanently booked passengers
    const bookedPassengers = await Passenger.find({
      booking_id: { $exists: true }
    }).lean();
    // Map seat -> gender for booked passengers on this trip (simplified)
    const bookedMap = {};
    for (const p of bookedPassengers) {
      bookedMap[p.seat_number] = p.gender;
    }

    const enriched = seats.map(seat => ({
      ...seat,
      lock_status: lockedSet.has(seat.seat_number)
        ? 'LOCKED'
        : bookedMap[seat.seat_number]
        ? 'BOOKED'
        : 'AVAILABLE',
      gender: bookedMap[seat.seat_number] || null
    }));

    return res.json({ success: true, seats: enriched, trip });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
