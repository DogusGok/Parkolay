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
  res.render("login", { error: "" });
});
app.get("/user", (req, res) => {
  res.render("user");
});
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
app.get("/:accountType/:accountId", function (req, res) {
  const accountType = req.params.accountType;
});

app.post("/", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  connection.query(
    "SELECT email, password,account_type,account_id FROM accounts WHERE email =" +
      connection.escape(email) +
      " AND password =" +
      connection.escape(password),
    function (err, results) {
      if (err) {
        throw err;
      }
      if (results.length != 0) {
        if (email == results[0].email && password == results[0].password) {
          res.redirect(
            "/" + results[0].account_type + "/" + results[0].account_id
          );
        }
      } else {
        res.render("login", {
          error: "Email veya şifre yanlış lütfen kontrol ediniz",
        });
      }
    }
  );
});
app.get("/register/:accountType", function (req, res) {
  const accountType = req.params.accountType;
  if (accountType == "user") {
    res.render("user-register");
  } else if (accountType == "company") {
    res.render("company-register", { error: "" });
  } else throw Error;
});

app.post("/register/:accountType", function (req, res) {
  const accountType = req.params.accountType;
  const email = req.body.email;

  const pass = req.body.password;
  const repas = req.body.confirm;
  console.log(repas);
  if (repas != pass) {
    if (accountType == "user") {
      res.render("user-register", { error: "Şifreler eşleşmiyor" });
      console.log(repas);
    } else if (accountType == "company") {
      res.render("company-register", { error: "Şifreler eşleşmiyor" });
    } else throw Error;
  } else {
    if (accountType == "user" || accountType == "company") {
      connection.query(
        "SELECT email from accounts where email=?",
        [email],
        function (err, results) {
          if (results.length != 0) {
            console.log(email);
            console.log("zaten mevcut");
          } else {
            connection.query(
              "INSERT INTO accounts  (account_type,email,password) VALUES (" +
                connection.escape(accountType) +
                "," +
                connection.escape(email) +
                "," +
                connection.escape(pass) +
                ");INSERT INTO ",
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
  }
});
app.listen(3000, function () {
  console.log("server started!");
});
