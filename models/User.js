import mongoose from "mongoose";
import { conversationSchema } from "../models/Conversation.js";

const userSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true, dropDups: true },
  password: { type: String, required: true },
  conversationList: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  ],
  profilePicture: String,
});

export default mongoose.model("User", userSchema);
