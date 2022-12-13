const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const _ = require("lodash");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
var mysql = require("mysql");
const connection = mysql.createConnection({
  host: "remotemysql.com",
  user: "xRrfTdEb8w",
  password: "E9Dj4rlvkJ",
  database: "xRrfTdEb8w",
});

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.render("login");
});
app.get("/user",(req,res)=>{
  res.render("user");
})
app.get("/user/arac", function (req, res) {
  res.render("arac");
});
app.get("/company", function (req, res) {
  res.render("company");
});
app.get("/admin", function (req, res) {
  res.render("admin");
});
app.get("/register", function (req, res) {
  res.render("register");
});


app.post("/", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    connection.query(
      "SELECT username, password,user_type FROM user WHERE username = ? AND password = ?",
      [username, password],
      function (err, results) {
        if (results) {
          res.redirect("/user");
        } else throw err;
      }
    );
  });
});
app.get("/register/:userType", function (req, res) {
  const userType = req.params.userType;
  if (userType == "user") {
    res.render("user-register");
  } else if (userType == "company") {
    res.render("company-register");
  } else throw Error;
});
app.post("/register/:userType", function (req, res) {
  const userType = req.params.userType;
  const mail = req.body.mail;
  const pass = req.body.password;
  if (userType == "user" || userType == "company") {
    connection.query(
      "SELECT email from accounts where email=?",
      [mail],
      function (err, results) {
        if (results.length != 0) {
          console.log(mail);
          console.log("zaten mevcut");
        } else {
          connection.query(
            "INSERT accounts  (account_type,email,password) VALUES (?,?,?)",
            [userType, mail, pass],
            function (err, results) {
              if (err) throw err;
              console.log("kayıt başarılı");
              res.redirect("/");
            }
          );
        }
      }
    );
  } else throw Error;
});
app.listen(3000, function () {
  console.log("server started!");
});
