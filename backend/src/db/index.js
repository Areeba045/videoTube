
import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

let connectionPromise = null;

const ConnectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.DATABASE_URL, {
        dbName: DB_NAME,
        serverSelectionTimeoutMS: 10000,
      })
      .then(() => {
        console.log(
          "MongoDB connected successfully:",
          mongoose.connection.host
        );

        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error("MongoDB connection failed:", error.message);
        throw error;
      });
  }

  return connectionPromise;
};

export default ConnectDB;


// import mongoose from "mongoose";
// import { DB_NAME } from "../constant.js";
// import express from 'express'
// // import dorenv from 'dotenv';

// // dotenv.config();




// const ConnectDB = async () => {
// try {
//     const connectionInstance = await  mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`);
//     // console.log(connectionInstance);
//     // console.log("DATABASE CONNECTED SUCCESSFULLY || MONGO DB HOST " , connectionInstance.connection.host);
// } catch (error) {
//     throw error ;
//     console.log("MONGO DB CONNECTION ERROR : " , error );
//     process.exit(1);
// }
// }


// export default ConnectDB ;