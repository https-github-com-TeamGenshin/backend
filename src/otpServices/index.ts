import { Request, Response, Router } from "express";
const router: Router = Router();
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import userModel from "../models/user";
import driverModel from "../models/driver";

// Forget Password OTP email send function.

function sendEmail(req: Request, OTP: number, name: string, type: string) {
  return new Promise((resolve, reject) => {
    // Nodemailer COnfiguration
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "teamgenshinofficial@gmail.com",
        pass: "wkrivbrwloojnpzb",
      },
    });

    let mail_configs: any;

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
router.post("/otpEmail", async (req: Request, res: Response) => {
  try {
    // OTP and Find
    const OTP = Math.floor(Math.random() * 900000 + 100000);
    const findUser = await userModel.find({ email_id: req.body.email_id });
    const findDriver = await driverModel.find({ email_id: req.body.email_id });

    // conditions
    if (findUser.length !== 0 || findDriver.length !== 0) {
      // JWT token creation
      const token = jwt.sign(
        { otp: OTP, email_id: req.body.email_id },
        req.body.email_id
      );
      if (findUser.length !== 0) {
        sendEmail(req, OTP, findUser[0].name, "forgetPassword")
          .then((response) => {
            // Success : token send
            res.status(200).json({ message: response, token: token });
          })
          .catch((error) => res.status(500).json({ error: error.message }));
      } else {
        sendEmail(req, OTP, findDriver[0].username, "forgetPassword")
          .then((response) => {
            // Success : token send
            res.status(200).json({ message: response, token: token });
          })
          .catch((error) => res.status(500).json({ error: error.message }));
      }
    } else {
      //Error: User not found
      return res.status(404).json({ message: "User not Found" });
    }
  } catch (e) {
    //Error: Server Error
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// forget password-------------------
// pass (headers) token and (body) new password and email_id
// get data: message of successful

router.post("/forgetPassword", async (req: Request, res: Response) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    const { email_id, password } = req.body;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      // verify the token got from frontend
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        req.body.email_id
      ) as jwt.JwtPayload;
      if (password && email_id && tokenVerify.email_id === email_id) {
        // find the user in database
        const findUser = await userModel.find({ email_id: email_id });
        const findDriver = await driverModel.find({ email_id: email_id });
        if (findUser.length !== 0) {
          // Password Hashing using bcrypt.
          const saltRounds = 10;
          bcrypt.hash(password, saltRounds).then(async (hashedPassword) => {
            findUser[0].password = hashedPassword;
            // save user
            const passwordSet = await findUser[0].save();
            if (passwordSet) {
              //Success: if password is set successfully
              return res
                .status(200)
                .json({ message: "Password updated successfully" });
            } else {
              //Error: If password cannot be set
              return res
                .status(500)
                .json({ message: "Cannot set the password in database" });
            }
          });
        } else if (findDriver.length !== 0) {
          // Password Hashing using bcrypt.
          const saltRounds = 10;
          bcrypt.hash(password, saltRounds).then(async (hashedPassword) => {
            findDriver[0].password = hashedPassword;
            // save user
            const passwordSet = await findDriver[0].save();
            if (passwordSet) {
              //Success: if password is set successfully
              return res
                .status(200)
                .json({ message: "Password updated successfully" });
            } else {
              //Error: If password cannot be set
              return res
                .status(500)
                .json({ message: "Cannot set the password in database" });
            }
          });
        } else {
          //Error: user not found
          return res.status(404).json({ message: "User not Found" });
        }
      } else {
        //Error: Token not valid.
        return res.status(404).json({ message: "password not found" });
      }
    } else {
      //Error: if Header not found.
      return res.status(404).json({ message: "Token not found" });
    }
  } catch (e) {
    //Error: if anything breaks
    return res
      .status(500)
      .json({ message: "Some error in setting new password" });
  }
});

// email verification ----------------
// pass (body) email_id: string.
// get data: token and message of successful.

// Create OTP and validate Email
router.post("/validateEmail", async (req: Request, res: Response) => {
  try {
    // Find user and OTP
    const OTP = Math.floor(Math.random() * 900000 + 100000);
    // Generating OTP
    const token = jwt.sign({ otp: OTP }, req.body.email_id);
    // Send Email Function
    sendEmail(req, OTP, "User", "validateEmail")
      .then((response) => {
        // Success : send Token
        res.status(200).json({ message: response, token: token });
      })
      .catch((error) => res.status(500).json({ error: error.message }));
  } catch (e) {
    //Error: if anything breaks
    return res
      .status(500)
      .json({ message: "Error while validating the email" });
  }
});

export default router;
