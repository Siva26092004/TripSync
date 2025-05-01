import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  title: String,
  destination: String,
  startDate: Date,
  endDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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
  status: {
    type: String,
    enum: ['planned', 'started', 'completed'],
    default: 'planned',
  },
  groupCode: {
    type: String,
    unique: true,
    required: true,
  },
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;