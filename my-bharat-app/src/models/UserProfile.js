import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    default: 0
  }
}, { _id: false });

const UserProfileSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  creditsUsed: {
    type: Number,
    default: 0
  },
  creditLimit: {
    type: Number,
    default: 0.10
  },
  language: {
    type: String,
    default: 'hi-IN'
  },
  locationType: {
    type: String,
    enum: ['village', 'city'],
    default: 'village'
  },
  conversationHistory: [MessageSchema]
}, {
  timestamps: true
});

const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);

export default UserProfile;
