import express from 'express';
import {
  createTrip,
  getUserTrips,
  updateTrip,
  addParticipant,
  removeParticipant,
  startTrip,
  joinTrip,
  endTrip,
  sendInvitation,
  requestJoinTrip,
  acceptJoinRequest,
  declineJoinRequest,
  updateLocation,getTripInvitations,rejectTripInvitation,acceptTripInvitation
} from '../controllers/tripController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.post('/', authMiddleware, createTrip);
router.get('/mytrips', authMiddleware, getUserTrips);
router.put('/:tripId', authMiddleware, updateTrip);
router.post('/:tripId/participants', authMiddleware, addParticipant);
router.delete('/:tripId/participants/:userId', authMiddleware, removeParticipant);
router.patch('/:tripId/start', authMiddleware, startTrip);
router.patch('/:tripId/end', authMiddleware, endTrip);
router.post('/join', authMiddleware, joinTrip);
router.post('/:tripId/join-request', authMiddleware, requestJoinTrip);
router.post('/:tripId/join-request/:userId/accept', authMiddleware, acceptJoinRequest);
router.post('/:tripId/join-request/:userId/decline', authMiddleware, declineJoinRequest);
router.post('/:tripId/invite', authMiddleware, sendInvitation);
router.get('/invitations', authMiddleware, getTripInvitations);
router.post('/invitations/accept', authMiddleware, acceptTripInvitation);
router.post('/invitations/reject', authMiddleware, rejectTripInvitation);
router.post('/:tripId/location', authMiddleware, updateLocation);

export default router;