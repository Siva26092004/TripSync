import mongoose from "mongoose"
const tripSchema = new mongoose.Schema({
  title: String,
  destination: String,
  startDate: Date,
  endDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users added at creation
  locationUpdates: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      coords: {
        latitude: Number,
        longitude: Number,
      },
      timestamp: Date,
    },
  ],
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
