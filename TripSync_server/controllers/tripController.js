import Trip from '../models/tripModel.js';

//  Create a trip
export const createTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate } = req.body;

    const newTrip = new Trip({
      title,
      destination,
      startDate,
      endDate,
      createdBy: req.user,
      participants: [req.user],
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Get all trips for the logged in user
export const getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ participants: req.user }).populate('participants', 'name email');
    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Update user location in a trip
export const updateUserLocation = async (req, res) => {
  const { tripId } = req.params;
  const { latitude, longitude } = req.body;

  try {
    const trip = await Trip.findById(tripId);

    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Check if user is a participant
    const isParticipant = trip.participants.find(p => p.toString() === req.user);
    if (!isParticipant) {
      return res.status(403).json({ message: 'User not part of the trip' });
    }

    trip.locationUpdates.push({
      user: req.user,
      coords: { latitude, longitude },
      timestamp: new Date(),
    });

    await trip.save();
    res.status(200).json({ message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
