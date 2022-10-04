import mongoose, { Schema } from "mongoose";

export const conversationSchema = mongoose.Schema({
  _id: Schema.Types.ObjectId,
  chatUsers: { type: [String], required: true }, //chatUsers is ID//might create problem of duplicatgas //need to make sure that the array no matter the combination is unique
  messages: { type: [{ sender: String, message: String }] },
});

export default mongoose.model("Conversation", conversationSchema);
