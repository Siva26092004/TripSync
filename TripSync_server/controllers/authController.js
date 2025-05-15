import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
import cloudinary from '../config/cloudinaryConfig.js';
import { Readable } from 'stream';

dotenv.config();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};


export const registerUser = async (req, res) => {
  const { name, email, password,phone_number} = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: 'User already exists' });

    const user = await User.create({ name, email, password,phone_number });
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




//profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const user = await User.findById(userId).select('name email phone_number profilePhoto');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};


// Upload profile photo
export const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user; // From authMiddleware
    console.log('Called uploadProfilePhoto, userId:', userId);

    // Debug: Log Cloudinary configuration
    console.log('Cloudinary Config:', {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
      api_secret: cloudinary.config().api_secret ? '****' : undefined,
    });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert buffer to stream for Cloudinary
    const fileStream = Readable.from(req.file.buffer);
    console.log('File stream created:', fileStream);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'tripsync/profile_photos',
          public_id: `user_${userId}_${Date.now()}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      fileStream.pipe(stream);
    });
    console.log('Cloudinary upload result:', uploadResult);

    // Update user with Cloudinary URL
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: uploadResult.secure_url },
      { new: true, select: 'name email profilePhoto' }
    );

    res.status(200).json({
      message: 'Profile photo uploaded successfully',
      profilePhoto: user.profilePhoto,
    });
  } catch (err) {
    console.error('Error uploading profile photo:', err);
    res.status(500).json({ error: err.message || 'Failed to upload profile photo' });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, phone_number } = req.body;
    if (!name && !phone_number) {
      return res.status(400).json({ error: 'At least one field (name or phone_number) must be provided' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (phone_number) updates.phone_number = phone_number;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, select: 'name email phone_number profilePhoto' }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
};
