import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import { getAllUsers,sendFriendRequest,getFriendRequests,acceptFriendRequest,rejectFriendRequest,getFriends } from '../controllers/friendController.js';
const router=express.Router();
router.get('/users', authMiddleware, getAllUsers);
router.post('/friend-request', authMiddleware, sendFriendRequest);
router.get('/friend-requests', authMiddleware, getFriendRequests);
router.post('/friend-request/accept', authMiddleware, acceptFriendRequest);
router.post('/friend-request/reject', authMiddleware, rejectFriendRequest);
router.get('/friends',authMiddleware,getFriends);
export default router;