import { request } from "express";
import jwt from "jsonwebtoken";

export const tokenVerif = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    jwt.verify(token, process.env.JWT, (err, userToken) => {
      if (err) return res.status(403).json({ message: "Token not valid" });
      else {
        req.user = userToken;
        return next();
      }
    });
  } catch (err) {
    next(err);
  }
};
