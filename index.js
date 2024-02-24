const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const ejs = require("ejs");
const app = express();
const _ = require("lodash");
const db = require("./database");
const { redirect } = require("statuses");
const { functions, toInteger } = require("lodash");

const ahour = 1000 * 60 * 60;
app.use(
  sessions({
    secret: "parkolay",
    saveUninitialized: true,
    cookie: { maxAge: ahour },
    resave: false,
  })
);
app.use(express.json());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(function (req, res, next) {
  if (!req.user)
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  next();
});

var session;
app.use(express.static(__dirname + "/public"));

// ----------------Giriş İşlemleri-----------------
app.get("/", function (req, res) {
  req.session.destroy();
  res.render("login", { error: "" });
});
app.post("/", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  db.getUser(email, password, function (results) {
    if (results != 0) {
      session = req.session;
      session.userId = results[0].account_id;
      res.redirect("/" + results[0].account_type + "/" + results[0].account_id);
    } else res.render("login", { error: "Girilen bilgilere ait hesap bulunamadı!" });
  });
});
// ----------------Kayıt İşlemleri----------------
app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/register/:accountType", function (req, res) {
  const accountType = req.params.accountType;
  if (accountType == "user") {
    res.render("user-register", { error: "" });
  } else if (accountType == "company") {
    res.render("company-register", { error: "" });
  } else throw Error;
});
app.post("/register/:accountType", function (req, res) {
  const accountType = req.params.accountType;
  const email = req.body.email;
  const name = req.body.name;
  const surname = req.body.surname;
  const telNo = req.body.telNo;
  const pass = req.body.password;
  const repas = req.body.rpassword;
  console.log(repas);
  if (repas != pass) {
    if (accountType == "user") {
      res.render("user-register", { error: "Şifreler eşleşmiyor" });
    } else if (accountType == "company") {
      res.render("company-register", { error: "Şifreler eşleşmiyor" });
    } else throw Error;
  } else {
    if (accountType == "user" || accountType == "company") {
      if (accountType == "user") {
        db.insertUser(accountType, email, pass, name, surname, telNo, (val) => {
          if (val == 0) {
            res.render(accountType + "-register", {
              error: "Mail kullanılmaktadır",
            });
          } else if (val == 1) {
            res.redirect("/");
          } else throw err;
        });
      } else if (accountType == "company") {
        db.insertCompany(accountType, email, pass, name, telNo, (val) => {
          if (val == 0) {
            res.render(accountType + "-register", {
              error: "Mail kullanılmaktadır",
            });
          } else if (val == 1) {
            res.redirect("/");
          } else throw err;
        });
      }
    } else throw Error;
  }
});
// ------------------User Paneli------------------
app.get("/user/:userId", (req, res) => {
  session = req.session;
  session.accountType = "user";
  if (session.userId == req.params.userId) {
    res.render("user", { username: session.userId });
  } else {
    res.redirect("/");
  }
});
app.get("/user/addArac/:userId", function (req, res) {
  if (session != undefined && session.userId == req.params.userId) {
    res.render("add-arac", { error: "", success: "" });
  } else res.redirect("/");
});
app.get("/addArac", function (req, res) {
  res.redirect(
    "/" + req.session.accountType + "/addArac" + "/" + req.session.userId
  );
});
app.get("/user-araclar", function (req, res) {
  res.redirect(
    "/" + req.session.accountType + "/araclar" + "/" + req.session.userId
  );
  app.get("/user/araclar/:userId", function (req, res) {
    if (session != undefined && session.userId == req.params.userId) {
      db.getVehicleAndInfosWithId(session.userId, (results) => {
        res.render("user-araclar", { result: results });
      });
    } else res.redirect("/");
  });
});
app.get("/:account_id/parkEt/:otopark_id/:plaka", function (req, res) {
  if (session != undefined && session.userId == req.params.account_id) {
  } else res.redirect("/");
});
app.post("/user/addArac/:userId", function (req, res) {
  const plaka = req.body.carplate;
  const fuelType = req.body.fuel;
  if (session != undefined && session.userId == req.params.userId) {
    db.insertArac(req.params.userId, plaka, fuelType, function (val) {
      if (val == 1) {
        res.render("add-arac", { error: "", success: "Kayıt Tamamlandı" });
      } else if (val == 0) {
        res.render("add-arac", {
          error: "Girilen plaka kullanılıyor!",
          success: "",
        });
      } else throw err;
    });
  } else res.redirect("/");
});
// ----------------Company Paneli-----------------
app.get("/company/:id", function (req, res) {
  session = req.session;
  session.accountType = "company";

  console.log(session.userId);
  if (session.userId == req.params.id) {
    res.render("company");
  } else {
    res.redirect("/");
  }
});
app.get("/selectpark", (req, res) => {
  const ilce = "bağcılar";
  db.getParkfromDistrict(ilce, (result) => {
    res.render("select-park", { result: result });
  });
});
app.get("/addOtopark", function (req, res) {
  console.log(session);
  res.redirect(
    "/" + req.session.accountType + "/addOtopark" + "/" + req.session.userId
  );
});
app.get("/Otoparklar", function (req, res) {
  console.log(session);
  res.redirect(
    "/" + req.session.accountType + "/Otoparklar" + "/" + req.session.userId
  );
});
app.get("/company/addOtopark/:userId", function (req, res) {
  if (session != undefined && session.userId == req.params.userId) {
    res.render("add-otopark", { error: "", success: "" });
  } else res.redirect("/");
});
app.get("/:accountType/Otoparklar/:userId", function (req, res) {
  session = req.session;

  if (session != undefined && session.userId == req.params.userId) {
    switch (req.params.accountType) {
      case "user":
        let araclar;
        let parklar;

        db.getAvailableVehicle(req.params.userId, (result) => {
          if (result.length != 0) araclar = result;
          else araclar = null;
          db.getAllParkForUser((results) => {
            if (results.length != 0) {
              parklar = results;
            } else parklar = null;
            res.render("user-otoparklar", {
              parklar: parklar,
              araclar: araclar,
            });
          });
        });

        break;
      case "company":
        db.getAllParkForCompany(req.params.userId, (result) => {
          if (result == 0) {
            res.redirect("/company/addOtopark/" + req.params.userId);
          } else {
            res.render("company-otoparklar", { result: result });
          }
        });
        break;
    }
  } else res.redirect("/");
});
app.post("/company/addOtopark/:userId", (req, res) => {
  session = req.session;
  const isim = req.body.name;
  const ilce = req.body.ilce;
  const mahalle = req.body.mahalle;
  const cadde = req.body.cadde;
  const sokak = req.body.sokak;
  const no = req.body.no;
  const kapasite = req.body.kapasite;
  const fiyat = req.body.ücret;
  const company_id = req.params.userId;
  if (session.userId == req.params.userId && session.accountType == "company") {
    db.insertPark(
      company_id,
      isim,
      ilce,
      mahalle,
      cadde,
      sokak,
      no,
      kapasite,
      fiyat,
      (call) => {
        if (call) {
          res.render("add-otopark", {
            error: "",
            success: "Otopark kayıt edildi baby !",
          });
        }
      }
    );
  }
});
app.post("/:accountType/Otoparklar/:userId", (req, res) => {
  session = req.session;
  const ilce = req.body.ilce;
  const minUcret = req.body.minUcret;
  const maxUcret = req.body.maxUcret;
  const siralama = req.body.siralama;
  if (
    session.userId == req.params.userId &&
    session.accountType == req.params.accountType
  ) {
    db.getFilteredParks(
      req.params.userId,
      req.params.accountType,
      ilce,
      minUcret,
      maxUcret,
      siralama,
      (result) => {
        if (session != undefined && session.userId == req.params.userId) {
          if (req.params.accountType == "user") {
            db.getAvailableVehicle(req.params.userId, (araclar) => {
              res.render(req.params.accountType + "-otoparklar", {
                parklar: result,
                araclar: araclar,
              });
            });
          } else {
            res.render(req.params.accountType + "-otoparklar", {
              result: result,
            });
          }
        } else res.redirect("/");
      }
    );
  }
});

app.get("/deleteOtopark/:otoparkId", function (req, res) {
  session = req.session;
  if (session != undefined && session.userId == req.params.userId) {
    db.deleteOtopark(req.params.otoparkId, (result, err) => {
      if (err) throw err;
      else {
        db.getAllPark((results) => {
          if (err) throw err;
          res.render("company-otoparklar", { result: results });
          console.log("veri silindi");
        });
      }
    });
  } else res.redirect("/");
});
app.get("/invoice", (req, res) => {
  res.render("invoice");
});
//---------------ADMİN PANELİ---------------------
app.get("/admin", function (req, res) {
  db.getAllUserNumb(function (result) {
    var index = result[0].user_number;
    res.render("admin", {
      user_number: index,
      company_number: result[0].company_number,
      otopark_number:result[0].otopark_number
    });
  });
});
app.get("/admin/company-settings", (req, res) => {
  db.getAll("company", (result) => {
    if (result.length > 0) {
      res.render("company-op", { results: result });
    }
  });
});
app.get("/admin/user-settings", (req, res) => {
  db.getAll("users", function (result) {
    if (result.length > 0) {
      res.render("users-operation", { results: result });
    }
  });
});
app.get("/admin/company-settings/show-parks/:id",(req,res)=>{
  db.getAllParkForCompany(req.params.id,function(result){
    res.render("show-parks",{results:result})
  })
  
})
app.get("/admin/user-settings/:id", (req, res) => {
  db.settingsAccount("users", req.params.id, (result) => {
    res.render("settings-user", { results: result[0] });
  });
});
app.get("/admin/company-settings/:id", (req, res) => {
  db.settingsAccount("company", req.params.id, (result) => {
    res.render("settings-co", { results: result[0] });
  });
});

app.post("/admin/company-settings/:id", (req, res) => {
  var name = req.body.name;
  var tel = req.body.tel;
  db.updateCompanyInfo(name, tel, req.params.id, function (result) {
    if (result) {
      res.redirect("/admin/company-settings");
    }
  });
});

app.post("/admin/company-settings/show-parks/:id",(req,res)=>{
  var name=req.body.name;
  var cap=toInteger(req.body.cap);
  var pric=toInteger(req.body.price);
  var otoid=req.body.otoid;

  
  db.updateOtoparkInfo(name,cap,pric,otoid,function(result){
    if(result){
      res.redirect("/admin/company-settings/show-parks/"+req.params.id);
    }
  })
})

app.post("/admin/user-settings/:id", (req, res) => {
  var name = req.body.name;
  var sname = req.body.surname;
  var tel = req.body.tel;
  db.updateUserInfo(name, sname, tel, req.params.id, function (result) {
    if (result) {
      res.redirect("/admin/user-settings");
    }
  });
});

app.get("/admin/delete-user/:id", (req, res) => {
  db.removeAccount("users", req.params.id, function (result) {
    if (result) {
      res.redirect("/admin/user-settings");
    }
  });
});
app.get("/admin/delete-park/:id", (req,res)=>{
  
  db.deleteOtopark(req.params.id,function(resılt){
    res.redirect("/admin/company-settings");
  });
})




app.get("/admin/delete-company/:id", (req, res) => {
  db.removeAccount("company", req.params.id, function (result) {
    if (result) {
      res.redirect("/admin/company-settings");
    }
  });
});

app.get("/logout", function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      res.status(400).send("unable to logout");
    } else {
      console.log("logout succes");
      res.redirect("/");
    }
  });
});

app.listen(3000, function () {
  console.log("server started!");
});
