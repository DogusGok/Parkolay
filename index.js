const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const ejs = require("ejs");
const app = express();
const _ = require("lodash");
const db = require("./database");

const ahour = 1000 * 60 * 60;
app.use(
  sessions({
    secret: "skimboyleprojeyi",
    saveUninitialized: true,
    cookie: { maxAge: ahour },
    resave: false,
  })
);
app.use(express.json());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
var mysql = require("mysql");
const connection = mysql.createConnection({
  host: "remotemysql.com",
  user: "xRrfTdEb8w",
  password: "E9Dj4rlvkJ",
  database: "xRrfTdEb8w",
});

var session;
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.render("login", { error: "" });
});
app.get("/user/:userId", (req, res) => {
  session = req.session;
  if (session.userId == req.params.userId) {
    res.render("user", { username: session.userId });
  } else {
    res.redirect("/");
  }
});
app.get("/user/arac", function (req, res) {
  req.session.destroy();
  res.render("user");
});
app.get("/company/:id", function (req, res) {
  session = req.session;

  console.log(session.userId);
  if (session.userId == req.params.id) {
    res.render("company");
  } else {
    res.redirect("/");
  }
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

  db.getUser(email, password, function (results) {
    console.log(results);
    if (results != 0) {
      session = req.session;
      session.userId = results[0].account_id;
      res.redirect("/" + results[0].account_type + "/" + results[0].account_id);
    }
  });
});

app.get("/register/:userType", function (req, res) {
  const userType = req.params.userType;
  if (userType == "user") {
    res.render("user-register");
  } else if (accountType == "company") {
    res.render("company-register", { error: "" });
  } else throw Error;
});

app.post("/register/:accountType", function (req, res) {
  const accountType = req.params.accountType;
  const email = req.body.email;

  const pass = req.body.password;
  const repas = req.body.rpassword;
  console.log(repas);
  if (repas != pass) {
    if (userType == "user") {
      res.render("user-register", { error: "Şifreler eşleşmiyor" });
    } else if (userType == "company") {
      res.render("company-register", { error: "Şifreler eşleşmiyor" });
    } else throw Error;
  } else {
    if (userType == "user" || userType == "company") {
      db.isEmailExist(mail, (result) => {
        if (result) {
          res.render(userType + "-register", {
            error: "Mail kullanılmaktadır",
          });
        } else {
          db.insertUser(userType, mail, pass, (val) => {
            if (val) {
              console.log("Kayıt oluşturuldu");
              res.redirect("/");
            }
          });
        }
      });
    } else throw Error;
  }
});
app.listen(3000, function () {
  console.log("server started!");
});
