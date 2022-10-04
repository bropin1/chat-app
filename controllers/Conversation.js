import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

export const updateConversation = async (sender, recipient, message) => {
  //check if conversation exists
  console.log("recipient", recipient);
  console.log("inside update conversation");
  const conversation = await Conversation.findOne({
    chatUsers: { $all: [sender, recipient] },
  });

  //if not create it and add it to both users
  if (!conversation) {
    const newConversation = new Conversation({
      _id: new mongoose.Types.ObjectId(),
      chatUsers: [sender, recipient],
      messages: [message],
    });

    await newConversation.save();

    User.findByIdAndUpdate(
      sender,
      {
        $push: { conversationList: newConversation._id },
      },
      { new: true }
    ).then((user) => {
      console.log("user.conversaltionList", user.conversationList);
    });

    User.findByIdAndUpdate(
      recipient,
      {
        $push: { conversationList: newConversation._id },
      },
      { new: true }
    ).then((user) => {
      console.log(user.conversationList);
    });

    //push to both users in mongoose that is not working
  } else {
    //if it exists push the new message to conversation and
    console.log("inside else");
    conversation.messages.push(message);
    // console.log("conversation:", conversation._doc);
    conversation.save((err) => {
      if (err) return handleError(err);
    });
    //is it linked to a user ?
    //updated conv is not updating user
  }

  //push the message to the recipient if active ws.send()
};
