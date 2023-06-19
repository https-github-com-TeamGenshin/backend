import express, { NextFunction, Request, Response, Router } from "express";
const router: Router = Router();

import BodyParser from "body-parser";
import {
  loginUserController,
  verifyToken,
  verifyUserByToken,
  createUserController,
  findOneUserController,
  getAllUsersController,
  deleteUserController,
  otpEmailSendController,
  forgetPasswordController,
  validateEmailController,
} from "../controller/user";

router.use(BodyParser.json());
router.use(BodyParser.urlencoded({ extended: true }));

// All the data will be send in JSON format.
// pass headers in every request other than login and register.

// Login user Route ----------------
// pass (body) mobile no. or email in (username) and password in (password)
// get data: {id: (_id from database), username: (username passed before),}, token: (token string only)

router.post("/loginUser", loginUserController);

// verify the token from frontend route -------------------
// pass (header) authentication: bearer <token>
// get data: {id: (_id from database), username: (username passed during login),},

router.post("/verifyUserToken", verifyToken, verifyUserByToken);

// Create user Route -----------------
// pass (body) name, email_id, mobile_no, password, gender, age, location
// get data: For now all the details after saving in database

router.post("/createUser", createUserController);

// find user Route ------------------
// pass (params) replace :id with the id
// get data: All details of user

router.get("/getOneUser/:id", findOneUserController);

// get all users Route---------------
// pass nothing
// get data: [All users with all details]

router.get("/getAllUsers", getAllUsersController);

// delete user-----------------------
// pass (params) replace :id with the id
// get data: deletedCount should be equals 1

router.delete("/deleteUser/:id", deleteUserController);

// otp request-----------------------
// pass (body) email_id: email(string)
// get data: token (email id that was passed)

router.post("/otpEmail", otpEmailSendController);

// forget password-------------------
// pass (headers) token and (body) new password and email_id
// get data: message of successful

router.post("/forgetPassword", forgetPasswordController);

// email verification ----------------
// pass (body) email_id: string.
// get data: token and message of successful.

router.post("/validateEmail", validateEmailController);

export default router;
