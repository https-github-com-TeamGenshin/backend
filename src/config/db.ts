import mongoose, { connect } from "mongoose";
require("dotenv").config();
// Connecting to the Mongo DB
const connects = async (): Promise<any> => {
  // Mongo DB String

  const connectionParams = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  };
  await connect(
    process.env.DB ||
      "mongodb+srv://teamgenshinofficial:UNbsEdjRAkK3BKNw@cabmanagement.w73ourp.mongodb.net/CabManagement"
  )
    .then(() => {
      // Print Mongo Connected in console if connected
      console.log("Mongo Connected");
    })
    .catch((e: any) => {
      console.log(e);
    });
};

export default connects;
``;
