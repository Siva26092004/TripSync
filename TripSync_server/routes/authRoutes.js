import express from 'express';
import { loginUser, registerUser, getAllUsers } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', getAllUsers); 

export default router;
