import express from 'express';
import { lockSeat, unlockSeat, confirmBooking, validatePassenger } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/lock', lockSeat);
router.delete('/unlock', unlockSeat);
router.post('/validate-passenger', validatePassenger);
router.post('/confirm', confirmBooking);

export default router;
