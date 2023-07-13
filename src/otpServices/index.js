"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const user_1 = __importDefault(require("../models/user"));
const driver_1 = __importDefault(require("../models/driver"));
// Forget Password OTP email send function.
function sendEmail(req, OTP, name, type) {
    return new Promise((resolve, reject) => {
        // Nodemailer COnfiguration
        var transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: "teamgenshinofficial@gmail.com",
                pass: "wkrivbrwloojnpzb",
            },
        });
        let mail_configs;
        // Format for Forget Password
        if (type === "forgetPassword") {
            mail_configs = {
                from: "teamgenshinofficial@gmail.com",
                to: req.body.email_id,
                subject: "OneCab Password Recovery",
                html: `<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>OneCab - OTP Email </title>
</head>
<body>
<!-- partial:index.partial.html -->
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">OneCab</a>
    </div>
    <p style="font-size:1.1em">Hi ${name},</p>
    <p>Thank you for choosing OneCab. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;">Regards,<br />OneCab</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>OneCab Inc</p>
      <p>Pimpri Chinchwad</p>
      <p>Pune</p>
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
            };
        }
        // format for validate Email
        if (type === "validateEmail") {
            mail_configs = {
                from: "teamgenshinofficial@gmail.com",
                to: req.body.email_id,
                subject: "OneCab Email Validation",
                html: `<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>OneCab - Validation OTP </title>
</head>
<body>
<!-- partial:index.partial.html -->
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">OneCab</a>
    </div>
    <p style="font-size:1.1em">Hello,</p>
    <p>Thank you for choosing OneCab. Use the following OTP to complete your Password Validity Procedure. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;">Regards,<br />OneCab</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>OneCab Inc</p>
      <p>Pimpri Chinchwad</p>
      <p>Pune</p>
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
            };
        }
        // Send Email through transporter
        transporter.sendMail(mail_configs, function (error, info) {
            if (error) {
                // Error: any Error occured
                return reject({ message: `An error has occured`, error: error });
            }
            // Success : Email sent
            return resolve({ message: "Email sent succesfully" });
        });
    });
}
// otp request-----------------------
// pass (body) email_id: email(string)
// get data: token (email id that was passed)
// OTP send for forget password
router.post("/otpEmail", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // OTP and Find
        const OTP = Math.floor(Math.random() * 900000 + 100000);
        const findUser = yield user_1.default.find({ email_id: req.body.email_id });
        const findDriver = yield driver_1.default.find({ email_id: req.body.email_id });
        // conditions
        if (findUser.length !== 0 || findDriver.length !== 0) {
            // JWT token creation
            const token = jsonwebtoken_1.default.sign({ otp: OTP, email_id: req.body.email_id }, req.body.email_id);
            if (findUser.length !== 0) {
                sendEmail(req, OTP, findUser[0].name, "forgetPassword")
                    .then((response) => {
                    // Success : token send
                    res.status(200).json({ message: response, token: token });
                })
                    .catch((error) => res.status(500).json({ error: error.message }));
            }
            else {
                sendEmail(req, OTP, findDriver[0].username, "forgetPassword")
                    .then((response) => {
                    // Success : token send
                    res.status(200).json({ message: response, token: token });
                })
                    .catch((error) => res.status(500).json({ error: error.message }));
            }
        }
        else {
            //Error: User not found
            return res.status(404).json({ message: "User not Found" });
        }
    }
    catch (e) {
        //Error: Server Error
        return res.status(500).json({ message: "Internal Server Error" });
    }
}));
// forget password-------------------
// pass (headers) token and (body) new password and email_id
// get data: message of successful
router.post("/forgetPassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // access the header
        const bearerHeader = req.headers.authorization;
        const { email_id, password } = req.body;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            // verify the token got from frontend
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], req.body.email_id);
            if (password && email_id && tokenVerify.email_id === email_id) {
                // find the user in database
                const findUser = yield user_1.default.find({ email_id: email_id });
                const findDriver = yield driver_1.default.find({ email_id: email_id });
                if (findUser.length !== 0) {
                    // Password Hashing using bcrypt.
                    const saltRounds = 10;
                    bcrypt_1.default.hash(password, saltRounds).then((hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
                        findUser[0].password = hashedPassword;
                        // save user
                        const passwordSet = yield findUser[0].save();
                        if (passwordSet) {
                            //Success: if password is set successfully
                            return res
                                .status(200)
                                .json({ message: "Password updated successfully" });
                        }
                        else {
                            //Error: If password cannot be set
                            return res
                                .status(500)
                                .json({ message: "Cannot set the password in database" });
                        }
                    }));
                }
                else if (findDriver.length !== 0) {
                    // Password Hashing using bcrypt.
                    const saltRounds = 10;
                    bcrypt_1.default.hash(password, saltRounds).then((hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
                        findDriver[0].password = hashedPassword;
                        // save user
                        const passwordSet = yield findDriver[0].save();
                        if (passwordSet) {
                            //Success: if password is set successfully
                            return res
                                .status(200)
                                .json({ message: "Password updated successfully" });
                        }
                        else {
                            //Error: If password cannot be set
                            return res
                                .status(500)
                                .json({ message: "Cannot set the password in database" });
                        }
                    }));
                }
                else {
                    //Error: user not found
                    return res.status(404).json({ message: "User not Found" });
                }
            }
            else {
                //Error: Token not valid.
                return res.status(404).json({ message: "password not found" });
            }
        }
        else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Token not found" });
        }
    }
    catch (e) {
        //Error: if anything breaks
        return res
            .status(500)
            .json({ message: "Some error in setting new password" });
    }
}));
// email verification ----------------
// pass (body) email_id: string.
// get data: token and message of successful.
// Create OTP and validate Email
router.post("/validateEmail", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user and OTP
        const OTP = Math.floor(Math.random() * 900000 + 100000);
        // Generating OTP
        const token = jsonwebtoken_1.default.sign({ otp: OTP }, req.body.email_id);
        // Send Email Function
        sendEmail(req, OTP, "User", "validateEmail")
            .then((response) => {
            // Success : send Token
            res.status(200).json({ message: response, token: token });
        })
            .catch((error) => res.status(500).json({ error: error.message }));
    }
    catch (e) {
        //Error: if anything breaks
        return res
            .status(500)
            .json({ message: "Error while validating the email" });
    }
}));
exports.default = router;
