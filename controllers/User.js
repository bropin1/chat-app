import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createError } from "../error.js";
import mongoose from "mongoose";
//sign up

export const signup = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    if (req.body.password) {
      const hashPassword = bcrypt.hashSync(req.body.password, salt);
      const newUser = new User({
        _id: new mongoose.Types.ObjectId(),
        ...req.body,
        password: hashPassword,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT);
      const { password, ...others } = newUser._doc; // need to populate conversationList
      res
        .cookie("access_token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        })
        .json(others)
        .status(200);
    } else {
      return next(createError(404, "password is undefined"));
    }
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const user = await User.findOne({
      name: req.body.name,
    });
    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return next(createError(403, "wrong credentials"));
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT);
    const { password, ...others } = user._doc;
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(others);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user) return next(createError(404, "user doesn't exist"));
    const { password, conversations, ...others } = user._doc;
    const userId = req.user.id;
    let updatedConversations = [];
    //checking if the conversations are related to the user who fetched the request
    if (conversations) {
      conversations.forEach((conv) => {
        if (conv.chatUsers.includes(userId)) updatedConversations.push(conv);
      });
    }
    res.json({ ...others, conversations: updatedConversations });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userList = [];
    (await User.find({ new: true }).populate("conversationList")).forEach(
      (user) => {
        let messages = [];
        const { password, conversationList, ...others } = user._doc;
        // console.log("obj", obj._doc);
        // console.log("conversationList", conversationList);
        if (conversationList) {
          conversationList.forEach((conv) => {
            // console.log("outside");

            if (conv.chatUsers.includes(userId)) {
              // console.log("inside");

              messages = conv.messages;
            }

            // console.log("messages", messages);
          });
        }
        userList.push({ ...others, messages });
      }
    );
    res.json(userList);
  } catch (err) {
    next(err);
  }
};
