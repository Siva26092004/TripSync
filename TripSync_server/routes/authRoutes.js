import express from 'express';
import { loginUser, registerUser,uploadProfilePhoto,getProfile,updateProfile} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js'; 
import upload from '../config/multerConfig.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/profile-photo', authMiddleware, upload.single('profilePhoto'), uploadProfilePhoto);
router.get('/profile', authMiddleware, getProfile);
router.patch('/profile', authMiddleware, updateProfile);
export default router;
