import express from 'express';
import { createTrip, getUserTrips, updateUserLocation } from '../controllers/tripController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleware, createTrip);
router.get('/mytrips', authMiddleware, getUserTrips);
router.put('/location/:tripId', authMiddleware, updateUserLocation);

export default router;
