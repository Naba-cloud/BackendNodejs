// import mongoose from "mongoose";
// import { DB_Name } from "./constants";
import connectDb from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config({ path: "./env" });
connectDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("listening on port ");
    });
    app.on("error", (err) => {
      console.log("error" + err);
      //   throw err;
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed", error);
  });

/*export const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`);
    app.on("error", (err) => {
      console.error(err);
      throw err;
    });
    app.listen(process.env.PORT, () => {
      console.log("listening on port");
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
})();*/
