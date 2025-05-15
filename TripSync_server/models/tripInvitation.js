import mongoose from 'mongoose';

const tripInvitationSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

tripInvitationSchema.index({ toUser: 1, status: 1 });
tripInvitationSchema.index({ fromUser: 1, toUser: 1, trip: 1 }, { unique: true });

export default mongoose.model('TripInvitation', tripInvitationSchema);