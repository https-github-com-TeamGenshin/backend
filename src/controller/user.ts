import { NextFunction, Request, Response } from "express";
import userModel, { User } from "../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";

import {
  createUserService,
  findUserService,
  findAndUpdateUserService,
  deleteUserService,
} from "../services/user.service";

// login user by username (email or mobile_no) and password.
export const loginUserController = async (req: Request, res: Response) => {
  try {
    if (!req.body.username) {
      return res.status(400).json({ message: "Email or Mobile no. not found" });
    } else if (!req.body.password) {
      return res.status(400).json({ message: "Password not found" });
    } else {
      let { username, password } = req.body;
      password = password.trim();

      // find the user in the database according to mobile_no or email_id.
      const email_id = username.trim();
      const mobile_no = username.trim();

      const user = await userModel.findOne({
        $or: [{ email_id }, { mobile_no }],
      });

      // if user not found.
      if (user === null) {
        //Error: if user not found in database.
        return res.status(404).json({ message: "User does not exist" });
      } else {
        // Check for the valid password by comparing the hashed password in database.
        const hashedPassword = user.password;
        bcrypt.compare(password, hashedPassword).then((results) => {
          if (results) {
            // creating the token
            const token = jwt.sign(
              { user: user._id, username: username },
              SecretKey
            );
            if (token) {
              //Success: if data is found and all operations are done.
              return res.status(200).send({
                message: "Login Successful",
                data: {
                  id: user._id,
                  username: username,
                },
                token: token,
              });
            } else {
              //Error: if token is not created.
              return res.status(500).json({ message: "Cannot create token" });
            }
          } else {
            //Error: if wrong password is entered.
            return res.status(404).json({ message: "Wrong Password Error" });
          }
        });
      }
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// verify Token function.
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearerHeader = req.headers["authentication"];
  if (bearerHeader !== undefined) {
    const bearer: string = bearerHeader as string;
    const token = bearer.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Unable to fetch token" });
    } else {
      req.body.token = token;
      next();
    }
  } else {
    return res.status(400).json({ message: "Invalid Token" });
  }
};

// Verify User by token got from frontend.
export const verifyUserByToken = async (req: Request, res: Response) => {
  try {
    const tokenVerify = jwt.verify(req.body.token, SecretKey);
    if (tokenVerify) {
      return res.status(200).send({
        message: "Login by token Successful",
        data: tokenVerify,
      });
    } else {
      res.status(400).json({ message: "Cannot verify token" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Problem in verifying the token" });
  }
};

// Create User in the Backend Controller.
export const createUserController = async (req: Request, res: Response) => {
  try {
    let { name, email_id, mobile_no, password, gender, age, location } =
      req.body;

    if (
      !name ||
      !email_id ||
      !mobile_no ||
      !password ||
      !gender ||
      !age ||
      !location
    ) {
      //Error anyone details not available.
      return res.status(400).json({ message: "Data Incomplete Error" });
    }

    if (password < 8) {
      //Error: password less than 8 characters.
      return res
        .status(400)
        .json({ message: "password less than 8 characters" });
    }

    // checking if the user already exists in database.
    email_id = email_id.trim();
    mobile_no = mobile_no.trim();
    password = password.trim();

    const user = await userModel.findOne({
      $or: [{ email_id }, { mobile_no }],
    });

    if (user !== null) {
      //Error: user exists
      return res.status(400).json({ message: "user already Exists" });
    } else {
      // Password Hashing using bcrypt.
      const saltRounds = 10;
      bcrypt
        .hash(password, saltRounds)
        .then((hashedPassword) => {
          // finally creating and saving the user.
          userModel
            .create({
              name: name,
              email_id: email_id,
              mobile_no: mobile_no,
              password: hashedPassword,
              gender: gender,
              age: age,
              location: location,
              pending_request: "",
            })
            .then((user) => {
              //Success: Returning the user Id of the user.
              return res.status(200).json({
                message: "This is User Create Page",
                data: user,
              });
            });
        })
        .catch((e) => {
          //Error: in making the hasing password.
          return res
            .status(500)
            .json({ message: "error while hashing the password" });
        });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// Find user by id in params...
export const findOneUserController = async (req: Request, res: Response) => {
  try {
    // finding the user by id got from the frontend.
    const filter = { _id: req.params.id };
    let data = await findUserService(filter);

    // checking if the user exists or not.
    if (data.length === 0) {
      return res.status(404).json({ message: "User not found" });
    } else {
      const user = data[0];
      //Success: Return the all user details.
      return res.status(200).json({
        message: "This is User findone Page",
        data: user,
      });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get all users in the database.
export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    let users = await userModel.find();
    return res.json({
      message: "This is User getAll page",
      data: users,
    });
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// delete user in the database by id.
export const deleteUserController = async (req: Request, res: Response) => {
  try {
    // deleting the user by filter.
    const filter = { _id: req.params.id };
    let data = await deleteUserService(filter);

    // handling if user not deleted.
    if (data !== null) {
      //Success: User is deleted successfully.
      return res.status(200).json({
        message: "This is User Delete Page",
        data: data,
      });
    } else {
      //Error: User provided not found in database.
      return res.status(400).json({ message: "Cannot find User" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// Forget Password OTP email send function.
function sendEmail(res: any) {
  return new Promise(async (resolve, reject) => {
    let testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      auth: {
        user: "teamgenshinofficial@gmail.com",
        pass: "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",
      },
    });
    console.log(res.email_id, res.otp);
    const mail_configs = {
      from: testAccount.user,
      to: res.email_id,
      subject: "OneCab PASSWORD RECOVERY",
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
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing OneCab. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${res.otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />OneCab</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>OneCab Inc</p>
      <p>1600 Amphitheatre Parkway</p>
      <p>California</p>
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent successfully" });
    });
  });
}

export const otpEmailSendController = async (req: Request, res: Response) => {
  sendEmail(req.body)
    .then((response) => res.json({ message: "Email sent Successfully" }))
    .catch((error) => res.status(500).send(error.message));
};
