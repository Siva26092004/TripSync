import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const privateKey =  fs.readFileSync('../TripSync_server/keys/private.key', 'utf8');

const publicKey = fs.readFileSync('../TripSync_server/keys/public.key', 'utf8');

const generateToken = (userId) => {
  return jwt.sign({ userId }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '7d'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, publicKey, {
    algorithms: ['RS256']
  });
};

export const verifyUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      req.user = decoded.userId; // Getting User ID
      next();
    } catch (err) {
      return res.status(401).json({ msg: 'Invalid Token' });
    }
  } else {
    res.status(401).json({ msg: 'No Token Provided' });
  }
}


export const registerUser = async (req, res) => {
  const { name, email, password, phone_number} = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: 'User already exists' });

    const user = await User.create({ name, email, password, phone_number });
    const token = generateToken(user._id);

    res.status(201).json({ userId: user._id, token, name: user.name });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.status(200).json({ userId: user._id, token, name: user.name });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const user = await User.find().select('-password'); // Exclude password from the response
    if (!user) return res.status(404).json({ msg: 'No Users found' });
    res.status(200).json(user);
  }
    catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
