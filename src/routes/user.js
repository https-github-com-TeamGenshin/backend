"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const user_1 = require("../controller/user");
// All the data will be send in JSON format.
// pass headers in every request other than login and register.
// Login user Route ----------------
// pass (body) mobile no. or email in (username) and password in (password)
// get data: {id: (_id from database), username: (username passed before),}, token: (token string only)
router.post("/loginUser", user_1.loginUserController);
// verify the token from frontend route -------------------
// pass (header) authentication: bearer <token>
// get data: {id: (_id from database), username: (username passed during login),},
router.post("/verifyUserToken", user_1.verifyUserByToken);
// Create user Route -----------------
// pass (body) name, email_id, mobile_no, password, gender, age, location
// get data: For now all the details after saving in database
router.post("/createUser", user_1.createUserController);
// find user Route ------------------
// pass (params) replace :id with the id
// get data: All details of user
router.get("/getOneUserAllData", user_1.findOneUserController);
// get all users Route---------------
// pass nothing
// get data: [All users with all details]
router.get("/getAllUsers", user_1.getAllUsersController);
// delete user-----------------------
// pass (headers) replace :id with the id
// get data: deletedCount should be equals 1
router.delete("/deleteUser", user_1.deleteUserController);
// get all accepted request of user
// pass (headers) replace :id with the id
// get data: [All accepted request of user]
router.get("/getAcceptedRequest", user_1.getAllAcceptedRequestController);
// get One accepted request of user
// pass (headers) and _id of the accepted request
// get data: [One accepted request of user]
router.post("/getOneAcceptedRequest", user_1.getOneAcceptedRequestController);
exports.default = router;
