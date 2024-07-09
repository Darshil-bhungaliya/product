// const express = require("express")
import express from "express";
const app = express()
import bcrypt from "bcrypt"
import mysql from'mysql';
import authrouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";



// export const con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "auth"
// });
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }))
app.use(cookieParser())


app.use("/api/v1",authrouter)


app.listen(8080, () => {
    console.log("server is run on port 8080")
})