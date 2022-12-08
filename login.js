const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();

const _ = require("lodash");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("public/images"));
var mysql = require("mysql");
const connection = mysql.createConnection({
  host: "remotemysql.com",
  user: "xRrfTdEb8w",
  password: "E9Dj4rlvkJ",
  database: "xRrfTdEb8w",
});
app.get("/", function (req, res) {
  res.render("login");
});

app.post("/", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    connection.query(
      "SELECT username, password,account_type FROM accounts WHERE username =" +
        connection.escape(username) +
        "AND password =" +
        connection.escape(password),
      function (err, results, rows) {
        if (err) throw err;
        else {
          switch (results[0].account_type) {
            case "user":
              res.render("user");
              break;
            case "admin":
              res.render("admin");
              break;
            case "company":
              res.render("company");
              break;

            default:
              break;
          }
        }
      }
    );
  });
});

app.listen(3000, function () {
  console.log("server started!");
});
