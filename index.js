const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const ejs = require("ejs");
const app = express();
const _ = require("lodash");
const db = require("./database");
const { redirect } = require("statuses");
const { add } = require("lodash");
const { Admin } = require("mongodb");

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
app.use(function (req, res, next) {
  if (!req.user)
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  next();
});

var session;
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  req.session.destroy();
  res.render("login", { error: "" });
});
app.get("/user/:userId", (req, res) => {
  session = req.session;
  session.accountType = "user";
  if (session.userId == req.params.userId) {
    res.render("user", { username: session.userId });
  } else {
    res.redirect("/");
  }
});
app.get("/addArac", function (req, res) {
  if(session==req.session){
    res.redirect(
      "/" + req.session.accountType +"/addArac"+"/"+req.session.userId
    );  
  }else{
    res.redirect("/");
  }
  
});

app.get("/selectpark",(req,res)=>{
  const ilce="bağcılar";
  db.getParkfromDistrict(ilce,(result)=>{
    res.render("select-park",{result:result});
  })

  
});
app.get("/addOtopark", function (req, res) {
  console.log(session);
  res.redirect(
    "/" + req.session.accountType + "/addOtopark"+ "/" + req.session.userId 
  );
});
app.get("/company/addOtopark/:userId", function (req, res) {
  if (session != undefined && session.userId == req.params.userId) {
    res.render("add-otopark", { error: "", success: "" });
  } else res.redirect("/");
});
app.get("/user/addArac/:userId", function (req, res) {
  if (session != undefined && session.userId == req.params.userId) {
    res.render("add-arac", { error: "", success: "" });
  } else res.redirect("/");
});

app.get("/invoice",(req,res)=>{
  res.render("invoice");
});
app.post("/user/addArac/:userId", function (req, res) {
  const plaka = req.body.carplate;
  const fuelType = req.body.fuel;
  if (session != undefined && session.userId == req.params.userId) {
    db.isPlakaExist(plaka, function (result) {
      if (result) {
        res.render("arac", {
          error: "Girilen plaka kullanılıyor!",
          success: "",
        });
      } else {
        db.insertArac(req.params.userId, plaka, fuelType, function (val) {
          if (val) {
            res.render("arac", { error: "", success: "Kayıt Tamamlandı" });
          } else throw err;
        });
      }
    });
  } else res.redirect("/");
});
app.get("/admin/company-settings",(req,res)=>{
  db.getAll("company",(result)=>{
    if(result.length>0){
      res.render("company-op",{results:result})
    }
  })
})
app.get("/admin/user-settings",(req,res)=>{
  db.getAll("users",function(result){
    if(result.length>0){
      res.render("users-operation",{results:result});
    }
  })
  
})
app.get("/admin/user-settings/:id",(req,res)=>{

  db.settingsAccount("users",req.params.id,(result)=>{
    
    res.render("settings-user",{results:result[0]});
  })
  
})
app.get("/admin/company-settings/:id",(req,res)=>{

  db.settingsAccount("company",req.params.id,(result)=>{
    res.render("settings-co",{results:result[0]});
  })
  
})

app.post("/admin/company-settings/:id",(req,res)=>{
  var name=req.body.name;
  var tel=req.body.tel;
  db.updateCompanyInfo(name,tel,req.params.id,function(result){
    if(result){
      res.redirect("/admin/company-settings");
    }
      
    
  })
})

app.post("/admin/user-settings/:id",(req,res)=>{
  var name=req.body.name;
  var sname=req.body.surname;
  var tel=req.body.tel;
  db.updateUserInfo(name,sname,tel,req.params.id,function(result){
    if(result){
      res.redirect("/admin/user-settings");
    }
  })
})


app.get("/admin/delete-user/:id",(req,res)=>{
  db.removeAccount("users",req.params.id,function(result){
    if(result){
      res.redirect("/admin/user-settings");
    }
  })
})

app.get("/admin/delete-company/:id",(req,res)=>{
  db.removeAccount("company",req.params.id,function(result){
    if(result){
      res.redirect("/admin/company-settings");
    }
  })
})

  


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
app.get("/admin", function (req, res) {
  
  db.getAllUserNumb(function(result){
    var index=result[0].user_number;
    res.render("admin",{user_number:index,company_number:result[0].company_number});
  });
});
app.get("/register", function (req, res) {
  res.render("register");
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
  
  if (repas != pass) {
    if (accountType == "user") {
      res.render("user-register", { error: "Şifreler eşleşmiyor" });
    } else if (accountType == "company") {
      res.render("company-register", { error: "Şifreler eşleşmiyor" });
    } else throw Error;
  } else {
    if (accountType == "user" || accountType == "company") {
      db.isEmailExist(email, (result) => {
        if (result) {
          res.render(accountType + "-register", {
            error: "Mail kullanılmaktadır",
          });
        } else {
          if (accountType == "user") {
            db.insertUser(
              accountType,
              email,
              pass,
              name,
              surname,
              telNo,
              (val) => {
                if (val) {
                  res.redirect("/");
                }
              }
            );
          } else if (accountType == "company") {
            db.insertCompany(accountType, email, pass, name, telNo, (val) => {
              if (val) {
                res.redirect("/");
              }
            });
          }
        }
      });
    } else throw Error;
  }
});

app.post("/company/addOtopark/:userId",(req,res)=>{
  session=req.session;
  const isim=req.body.name;
  const ilce=req.body.ilce;
  const mahalle=req.body.mahalle;
  const cadde=req.body.cadde;
  const sokak=req.body.sokak;
  const no=req.body.no;
  const kapasite=req.body.kapasite;
  const fiyat=req.body.ücret;
  if(session.userId==req.params.userId && session.accountType=="company"){

    db.insertPark(isim,ilce,mahalle,cadde,sokak,no,kapasite,fiyat,(call)=>{
      if(call){

        res.render("add-otopark",{error:"",success:"Otopark kayıt edildi baby !"})
      }
    });
  

  }
})

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
