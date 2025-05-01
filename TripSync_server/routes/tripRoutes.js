import express from 'express';
import { createTrip, getUserTrips, updateTrip, addParticipant, removeParticipant, startTrip, joinTrip } from '../controllers/tripController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Your JWT middleware

const router = express.Router();

// All routes require authentication
router.post('/', authMiddleware, createTrip);
router.get('/mytrips', authMiddleware, getUserTrips);
router.put('/:tripId', authMiddleware, updateTrip);
router.post('/:tripId/participants', authMiddleware, addParticipant);
router.delete('/:tripId/participants/:userId', authMiddleware, removeParticipant);
router.patch('/:tripId/start', authMiddleware, startTrip);
router.post('/join', authMiddleware, joinTrip);


export default router;