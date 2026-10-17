import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import express from 'express'
// import dorenv from 'dotenv';

// dotenv.config();




const ConnectDB = async () => {
try {
    const connectionInstance = await  mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`);
    // console.log(connectionInstance);
    // console.log("DATABASE CONNECTED SUCCESSFULLY || MONGO DB HOST " , connectionInstance.connection.host);
} catch (error) {
    throw error ;
    console.log("MONGO DB CONNECTION ERROR : " , error );
    process.exit(1);
}
}


export default ConnectDB ;