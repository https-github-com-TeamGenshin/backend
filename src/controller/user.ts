import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";

import userModel, { User } from "../models/user";
import driverModel from "../models/driver";

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
              {
                id: user._id.toString(),
                username: user.name,
                email_id: user.email_id,
                mobile_no: user.mobile_no,
                location: user.location,
                pending_request: user.pending_request,
                role:
                  user._id.toString() === "64ad2bbdd73ea6b35065340e"
                    ? "Admin"
                    : "user",
              },
              SecretKey
            );
            if (token) {
              //Success: if data is found and all operations are done.
              return res.status(200).send({
                message: "Login Successful",
                data: {
                  id: user._id.toString(),
                  username: user.name,
                  email_id: user.email_id,
                  mobile_no: user.mobile_no,
                  location: user.location,
                  pending_request: user.pending_request,
                  role:
                    user._id.toString() === "64ad2bbdd73ea6b35065340e"
                      ? "Admin"
                      : "user",
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

// Verify User by token got from frontend.
export const verifyUserByToken = async (req: Request, res: Response) => {
  // try {
  // access the header
  const bearerHeader = req.headers.authorization;
  if (bearerHeader !== undefined) {
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      let driver;
      // find out the user or driver by id.
      const user = await userModel.findById({ _id: tokenVerify.id.toString() });
      if (!user) {
        driver = await driverModel.findById({
          _id: tokenVerify.id.toString(),
        });
      }

      if (user) {
        tokenVerify.pending_request = user.pending_request;
        // Success : Token id
        return res.status(200).send({
          message: "Login by token Successful",
          data: tokenVerify,
        });
      } else if (driver) {
        // Success : Token id
        return res.status(200).send({
          message: "Login by token Successful",
          data: tokenVerify,
        });
      } else {
        // Error data not found
        return res.status(404).json({ message: "Data not found" });
      }
    } else {
      //Error: if Header not found.
      return res.status(404).json({ message: "Token not found" });
    }
  } else {
    //Error: if Header not found.
    return res.status(404).json({ message: "Token not found" });
  }
  // } catch (e) {
  //   // Error : verifying the token
  //   return res.status(500).json({ message: "Problem in verifying the token" });
  // }
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

    if (password.length < 8) {
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

    const driver = await driverModel.findOne({
      $or: [{ email_id }, { mobile_no }],
    });

    if (user !== null || driver !== null) {
      //Error: user or driver exists with that credentials
      return res.status(400).json({ message: "user or driver already Exists" });
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
              accepted_request: [],
            })
            .then((user) => {
              //Success: Returning the user Id of the user.
              return res.status(200).json({
                message: "User Created Successfully",
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
    // access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (tokenVerify) {
        // finding the user by id got from the frontend.
        let data = await userModel.findById({ _id: tokenVerify.id });

        // checking if the user exists or not.
        if (!data) {
          return res.status(404).json({ message: "User not found" });
        } else {
          const user = data;
          //Success: Return the all user details.
          return res.status(200).json({
            message: "finding one user is successful",
            data: user,
          });
        }
      } else {
        //Error: Token not valid.
        return res.status(404).json({ message: "Token not valid" });
      }
    } else {
      //Error: if Header not found.
      return res.status(404).json({ message: "Token not found" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get all users in the database.
export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
      if (tokenVerify) {
        // find all the users
        let users = await userModel.find();
        // Success : send all users
        return res.json({
          message: "Finding all users are successful!",
          data: users,
        });
      } else {
        //Error: Token not valid.
        return res.status(404).json({ message: "Token not valid" });
      }
    } else {
      //Error: if Header not found.
      return res.status(404).json({ message: "Token not found" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// delete user in the database by id.
export const deleteUserController = async (req: Request, res: Response) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (tokenVerify) {
        // deleting the user by filter.
        let data = await userModel.findByIdAndDelete({ _id: tokenVerify.id });

        // handling if user not deleted.
        if (data !== null) {
          //Success: User is deleted successfully.
          return res.status(200).json({
            message: "Delete user successful",
            data: data,
          });
        } else {
          //Error: Token not valid.
          return res.status(404).json({ message: "Token not valid" });
        }
      } else {
        //Error: if Header not found.
        return res.status(404).json({ message: "Token not found" });
      }
    } else {
      //Error: User provided not found in database.
      return res.status(400).json({ message: "Cannot find User" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAllAcceptedRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (tokenVerify) {
        // find all the users
        let users = await userModel.findById({ _id: tokenVerify.id });
        const data = users?.accepted_request.map(
          ({ driver_name, start_date, model_registration_no, _id }) => {
            return { driver_name, start_date, model_registration_no, _id };
          }
        );
        // Success : send all users
        return res.json({
          message: "Finding all users are successful!",
          data: data,
        });
      } else {
        //Error: Token not valid.
        return res.status(404).json({ message: "Token not valid" });
      }
    } else {
      //Error: if Header not found.
      return res.status(404).json({ message: "Token not found" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getOneAcceptedRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (tokenVerify) {
        const { _id } = req.body;
        // find all the users
        let users = await userModel.findById({ _id: tokenVerify.id });
        const data = users?.accepted_request.find((accepted) => {
          return _id === accepted._id?.toString();
        });
        if (data) {
          // Success : send all users
          return res.json({
            message: "Finding all users are successful!",
            data: data,
          });
        } else {
          //Error: cannot find data
          return res.status(404).json({ message: "Cannot Find the request" });
        }
      } else {
        //Error: Token not valid.
        return res.status(404).json({ message: "Token not valid" });
      }
    } else {
      //Error: if Header not found.
      return res.status(404).json({ message: "Token not found" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};
