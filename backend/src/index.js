import 'dotenv/config'
// import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import { DB_NAME } from "./constant.js";
import ConnectDB from "./db/index.js";
import app from "./app.js";
import dns from "node:dns";

dns.setServers(["8.8.8.8"]);

// dotenv.config({ path: ".env" });

let PORT = process.env.PORT || 3000;

ConnectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `connection successfull || server is running on port : ${PORT}`
      );
    });

    app.on("error", (err) => {
      console.log("Error", err);
    });
  })
  .catch((err) => {
    console.log("Connection failed !! ", err);
  });

// ( async() =>{
//     try {
//         await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`);
//         app.on("error" , (error) => {
//             console.log(error);
//             throw error ;
//         })

//         app.listen(PORT , () => {
//             console.log("server is running on Port : " , PORT );
//         })

//         console.log("Databse is connected successfully !")

//     } catch (error) {
//         console.log(error);
//         throw error ;
//     }
// })()
