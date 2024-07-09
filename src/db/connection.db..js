// var mysql = require('mysql');

// var con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: ""
// });

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   con.query("CREATE DATABASE Auth", function (err, result) {
//     if (err) throw err;
//     console.log("Database created");
//   });
// });
import mysql from "mysql"
export const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "product"
});