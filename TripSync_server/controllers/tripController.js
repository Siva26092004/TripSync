import Trip from '../models/tripModel.js';
import User from '../models/userModel.js';
import TripInvitation from '../models/tripInvitation.js';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

// Create a trip
export const createTrip = async (req, res) => {
  try {
    const { title, destination } = req.body;
    const userId = req.user;

    // Check if user has an active trip
    const activeTrip = await Trip.findOne({
      participants: userId,
      status: 'started',
    });
    if (activeTrip) {
      return res.status(400).json({ error: 'You are already in an active trip' });
    }

    const groupCode = nanoid(8);
    const newTrip = new Trip({
      title,
      destination,
      createdBy: userId,
      participants: [userId],
      groupCode,
    });

    const savedTrip = await newTrip.save();
    await savedTrip.populate('participants', 'name email profilePhoto');
    res.status(201).json(savedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Join a trip via group code
export const joinTrip = async (req, res) => {
  try {
    const { groupCode } = req.body;
    const userId = req.user;

    const activeTrip = await Trip.findOne({
      participants: userId,
      status: 'started',
    });
    if (activeTrip) {
      return res.status(400).json({ error: 'You are already in an active trip' });
    }

    const trip = await Trip.findOne({ groupCode });
    if (!trip) {
      return res.status(404).json({ error: 'Invalid group code' });
    }

    if (trip.status === 'completed') {
      return res.status(400).json({ error: 'Trip has ended' });
    }

    if (trip.participants.includes(userId) || trip.joinRequests.includes(userId)) {
      return res.status(400).json({ error: 'You have already joined or requested to join' });
    }

    trip.joinRequests.push(userId);
    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants joinRequests', 'name email profilePhoto');
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Request to join a trip
export const requestJoinTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }

    const activeTrip = await Trip.findOne({
      participants: userId,
      status: 'started',
    });
    if (activeTrip) {
      return res.status(400).json({ error: 'You are already in an active trip' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.status === 'completed') {
      return res.status(400).json({ error: 'Trip has ended' });
    }

    if (trip.participants.includes(userId) || trip.joinRequests.includes(userId)) {
      return res.status(400).json({ error: 'You have already joined or requested to join' });
    }

    trip.joinRequests.push(userId);
    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants joinRequests', 'name email profilePhoto');
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Accept join request
export const acceptJoinRequest = async (req, res) => {
  try {
    const { tripId, userId } = req.params;
    const leaderId = req.user;

    if (!mongoose.Types.ObjectId.isValid(tripId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid trip or user ID' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() !== leaderId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to manage join requests' });
    }

    if (!trip.joinRequests.includes(userId)) {
      return res.status(400).json({ error: 'No join request from this user' });
    }

    trip.joinRequests = trip.joinRequests.filter((id) => id.toString() !== userId);
    trip.participants.push(userId);
    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants joinRequests', 'name email profilePhoto');
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Decline join request
export const declineJoinRequest = async (req, res) => {
  try {
    const { tripId, userId } = req.params;
    const leaderId = req.user;

    if (!mongoose.Types.ObjectId.isValid(tripId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid trip or user ID' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() !== leaderId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to manage join requests' });
    }

    if (!trip.joinRequests.includes(userId)) {
      return res.status(400).json({ error: 'No join request from this user' });
    }

    trip.joinRequests = trip.joinRequests.filter((id) => id.toString() !== userId);
    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants joinRequests', 'name email profilePhoto');
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
        { participants: req.user },
        { joinRequests: req.user },
      ],
    }).populate('participants joinRequests createdBy', 'name email profilePhoto');
    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update trip details
export const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, destination } = req.body;

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

    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants joinRequests', 'name email profilePhoto');
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add participant (by leader)
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
    trip.joinRequests = trip.joinRequests.filter((id) => id.toString() !== userId);
    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants joinRequests', 'name email profilePhoto');
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove participant
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

    trip.participants = trip.participants.filter((p) => p.toString() !== userId);
    trip.joinRequests = trip.joinRequests.filter((id) => id.toString() !== userId);
    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants joinRequests', 'name email profilePhoto');
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Start trip
export const startTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to start this trip' });
    }

    if (trip.status !== 'planned') {
      return res.status(400).json({ error: 'Trip is already started or completed' });
    }

    const activeTrip = await Trip.findOne({
      participants: userId,
      status: 'started',
    });
    if (activeTrip) {
      return res.status(400).json({ error: 'You are already in an active trip' });
    }

    trip.status = 'started';
    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants joinRequests', 'name email profilePhoto');
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// End trip
export const endTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to end this trip' });
    }

    if (trip.status !== 'started') {
      return res.status(400).json({ error: 'Trip is not active' });
    }

    trip.status = 'completed';
    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants joinRequests', 'name email profilePhoto');
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update participant location
export const updateLocation = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { latitude, longitude } = req.body;
    const userId = req.user;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Coordinates are required' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (!trip.participants.includes(userId)) {
      return res.status(403).json({ error: 'You are not a participant of this trip' });
    }

    trip.locationUpdates.push({
      user: userId,
      coords: { latitude, longitude },
      timestamp: new Date(),
    });

    const updatedTrip = await trip.save();
    await updatedTrip.populate('participants joinRequests', 'name email profilePhoto');
    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Send trip invitation
export const sendInvitation = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { userId } = req.body;
    const fromUserId = req.user;

    if (!mongoose.Types.ObjectId.isValid(tripId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid trip or user ID' });
    }

    if (fromUserId.toString() === userId) {
      return res.status(400).json({ error: 'Cannot send invitation to yourself' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (!trip.participants.includes(fromUserId)) {
      return res.status(403).json({ error: 'You are not a participant of this trip' });
    }

    if (trip.participants.includes(userId)) {
      return res.status(400).json({ error: 'User is already a participant' });
    }

    const toUser = await User.findById(userId);
    if (!toUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if a pending invitation already exists
    const existingInvitation = await TripInvitation.findOne({
      fromUser: fromUserId,
      toUser: userId,
      trip: tripId,
      status: 'pending',
    });
    if (existingInvitation) {
      return res.status(400).json({ error: 'Invitation already sent' });
    }

    // Create trip invitation
    const tripInvitation = new TripInvitation({
      fromUser: fromUserId,
      toUser: userId,
      trip: tripId,
    });
    await tripInvitation.save();

    res.status(200).json({ message: 'Trip invitation sent' });
  } catch (err) {
    console.error('Send invitation error:', err);
    res.status(500).json({ error: 'Failed to send trip invitation' });
  }
};

// Get pending trip invitations for the user
export const getTripInvitations = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    // Get pending trip invitations received by the user
    const invitations = await TripInvitation.find({ toUser: userId, status: 'pending' })
      .populate('fromUser', 'name profilePhoto')
      .populate('trip', 'title destination')
      .lean();

    const formattedInvitations = invitations.map((inv) => ({
      _id: inv._id,
      fromUser: {
        _id: inv.fromUser._id,
        name: inv.fromUser.name,
        profilePhoto: inv.fromUser.profilePhoto,
      },
      trip: {
        _id: inv.trip._id,
        title: inv.trip.title,
        destination: inv.trip.destination,
      },
    }));

    res.status(200).json(formattedInvitations);
  } catch (err) {
    console.error('Error fetching trip invitations:', err);
    res.status(500).json({ error: 'Failed to fetch trip invitations' });
  }
};

// Accept trip invitation
export const acceptTripInvitation = async (req, res) => {
  try {
    const { invitationId } = req.body;
    const userId = req.user;

    if (!userId) return res.status(401).json({ error: 'User not authenticated' });
    if (!invitationId) return res.status(400).json({ error: 'Invitation ID is required' });

    // Find the trip invitation
    const invitation = await TripInvitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: 'Trip invitation not found' });
    }
    if (invitation.toUser.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to accept this invitation' });
    }
    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation is not pending' });
    }

    // Check if user is already in an active trip
    const activeTrip = await Trip.findOne({
      participants: userId,
      status: 'started',
    });
    if (activeTrip) {
      return res.status(400).json({ error: 'You are already in an active trip' });
    }

    // Add user to trip participants
    const trip = await Trip.findById(invitation.trip);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (trip.status === 'completed') {
      return res.status(400).json({ error: 'Trip has ended' });
    }
    trip.participants.push(userId);
    await trip.save();

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Populate trip for response
    await trip.populate('participants joinRequests', 'name email profilePhoto');
    res.status(200).json({ message: 'Trip invitation accepted', trip });
  } catch (err) {
    console.error('Error accepting trip invitation:', err);
    res.status(500).json({ error: 'Failed to accept trip invitation' });
  }
};

// Reject trip invitation
export const rejectTripInvitation = async (req, res) => {
  try {
    const { invitationId } = req.body;
    const userId = req.user;

    if (!userId) return res.status(401).json({ error: 'User not authenticated' });
    if (!invitationId) return res.status(400).json({ error: 'Invitation ID is required' });

    // Find the trip invitation
    const invitation = await TripInvitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: 'Trip invitation not found' });
    }
    if (invitation.toUser.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to reject this invitation' });
    }

    // Update invitation status
    invitation.status = 'rejected';
    await invitation.save();

    res.status(200).json({ message: 'Trip invitation rejected' });
  } catch (err) {
    console.error('Error rejecting trip invitation:', err);
    res.status(500).json({ error: 'Failed to reject trip invitation' });
  }
};