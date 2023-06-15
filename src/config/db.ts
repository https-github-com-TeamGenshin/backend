import mongoose from "mongoose";
require("dotenv").config();

const connects = async (): Promise<any> => {
  let DB: string | undefined = process.env.DB;
  if (DB) {
    await mongoose
      .connect(DB)
      .then(() => {
        console.log("Mongo Connected");
      })
      .catch((e: any) => {
        console.log(e);
      });
  } else {
    console.log("MongoDB connection string is not defined.");
  }
};

export default connects;
