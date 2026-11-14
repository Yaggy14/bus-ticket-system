import express from 'express';
import { searchTrips, getTripSeats } from '../controllers/tripController.js';

const router = express.Router();

router.get('/search', searchTrips);
router.get('/:id/seats', getTripSeats);

export default router;
