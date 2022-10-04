import express from "express";
import { signup, signin, getUser, getUsers } from "../controllers/User.js";
import { tokenVerif } from "../tokenVerification.js";
import cors from "cors";

const router = express.Router();

// const options = {
//   origin: "http://localhost:3000",
//   allowedHeaders: ["content-type", "x-requested-with"],
//   credientials: true,
// };

//sign up
// router.options("/auth/signup", cors(options)); //preflight
// router.post("/auth/signup", cors(options), signup);

router.post("/auth/signup", signup);

//sign in
// router.options("/auth/signin", cors(options));
// router.post("/auth/signin", cors(options), signin);

router.post("/auth/signin", signin);

//get User ()
router.get("/find/:name", tokenVerif, getUser);

//get USers
router.get("/findAll", tokenVerif, getUsers);

//delete User

//update User

export default router;
