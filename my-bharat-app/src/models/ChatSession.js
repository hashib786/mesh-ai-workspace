import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ChatSessionSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
    },
    chatId: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      default: "नई बातचीत",
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose compilation errors on hot reloads
const ChatSession =
  mongoose.models.ChatSession ||
  mongoose.model("ChatSession", ChatSessionSchema);

export default ChatSession;
