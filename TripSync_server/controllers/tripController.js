import Trip from '../models/tripModel.js';
import mongoose from 'mongoose';
import User from '../models/userModel.js'
import { nanoid } from 'nanoid'; // For generating unique group codes

// Create a trip (updated to include groupCode)
export const createTrip = async (req, res) => {
  try {
    console.log("called");
    const { title, destination, startDate, endDate } = req.body;

    const groupCode = nanoid(8); // Generate 8-character unique code

    const newTrip = new Trip({
      title,
      destination,
      startDate,
      endDate,
      createdBy: req.user,
      participants: [req.user],
      groupCode,
    });

    const savedTrip = await newTrip.save();
    await savedTrip.populate('participants', 'name email');
    res.status(201).json(savedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Join a trip via group code
export const joinTrip = async (req, res) => {
  console.log("connected");
  try {
    const { groupCode } = req.body;

    if (!groupCode) {
      return res.status(400).json({ error: 'Group code is required' });
    }

    const trip = await Trip.findOne({ groupCode });
    if (!trip) {
      return res.status(404).json({ error: 'Invalid group code' });
    }

    if (trip.participants.includes(req.user)) {
      return res.status(400).json({ error: 'You are already a participant' });
    }

    trip.participants.push(req.user);
    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants', 'name email');
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all trips for the authenticated user
export const getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      $or: [
        { createdBy: req.user },
        { participants: req.user},
      ],
    }).populate('participants', 'name email');
    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update trip details
export const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, destination, startDate, endDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() !== req.user.toString()) {
      return res.status(403).json({ error: 'Unauthorized to update this trip' });
    }

    trip.title = title || trip.title;
    trip.destination = destination || trip.destination;
    trip.startDate = startDate || trip.startDate;
    trip.endDate = endDate || trip.endDate;

    const updatedTrip = await trip.save();
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add participant to trip
export const addParticipant = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tripId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid trip or user ID' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() !== req.user.toString()) {
      return res.status(403).json({ error: 'Unauthorized to modify participants' });
    }

    if (trip.participants.includes(userId)) {
      return res.status(400).json({ error: 'User already a participant' });
    }

    trip.participants.push(userId);
    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants', 'name email');
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove participant from trip
export const removeParticipant = async (req, res) => {
  try {
    const { tripId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid trip or user ID' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() !== req.user.toString()) {
      return res.status(403).json({ error: 'Unauthorized to modify participants' });
    }

    trip.participants = trip.participants.filter(p => p.toString() !== userId);
    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants', 'name email');
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Start trip (update status)
export const startTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() !== req.user.toString()) {
      return res.status(403).json({ error: 'Unauthorized to start this trip' });
    }

    trip.status = 'started';
    const updatedTrip = await trip.save();
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

