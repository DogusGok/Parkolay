const cookieParser = require("cookie-parser");
const { call } = require("function-bind");
var mysql = require("mysql");
const connection = mysql.createPool({
  host: "db4free.net",
  user: "parkolay_user",
  password: "q3SyKnUkVkE3E*_",
  database: "parkolay"
});


exports.isEmailExist = (mail, callback) => {
  var a = connection.query(
    "SELECT email from accounts where email=?",
    [mail],
    function (err, results) {
      return callback(results.length != 0);
    }
  );
};

exports.insertUser = (type, email, pass, name, surname, telNo, callback) => {
  connection.query(
    "INSERT INTO accounts (account_type,email,password) VALUES (" +
      connection.escape(type) +
      "," +
      connection.escape(email) +
      "," +
      connection.escape(pass) +
      ");",
    function (err, results) {
      if (err) throw err;
      else {
        connection.query(
          "INSERT INTO user (account_id,name,surname,tel_no) VALUES(" +
            connection.escape(results.insertId) +
            "," +
            connection.escape(name) +
            "," +
            connection.escape(surname) +
            "," +
            connection.escape(telNo) +
            ");",
          function (err, result) {
            if (err) {
              throw err;
            } else {
              return callback(true);
            }
          }
        );
      }
    }
  );
};
exports.insertCompany = (type, email, pass, name, telNo, callback) => {
  connection.query(
    "INSERT INTO accounts (account_type,email,password) VALUES (" +
      connection.escape(type) +
      "," +
      connection.escape(email) +
      "," +
      connection.escape(pass) +
      ");",
    function (err, results) {
      if (err) throw err;
      else {
        connection.query(
          "INSERT INTO company (account_id,company_name,tel_no) VALUES(" +
            connection.escape(results.insertId) +
            "," +
            connection.escape(name) +
            "," +
            connection.escape(telNo) +
            ");",
          function (err, result) {
            if (err) {
              throw err;
            } else {
              return callback(true);
            }
          }
        );
      }
    }
  );
};
exports.getUser = (email, password, callback) => {
  connection.query(
    "SELECT email, password,account_type,account_id FROM accounts WHERE email =" +
      connection.escape(email) +
      " AND password =" +
      connection.escape(password),
    function (err, results) {
      if (results.length != 0) {
        return callback(results);
      } else {
        return callback(0);
      }
    }
  );
};
exports.isPlakaExist = (plaka, callback) => {
  connection.query(
    "SELECT plaka from vehicle where plaka=" + connection.escape(plaka),
    function (err, results) {
      if (err) {
        throw err;
      }
      return callback(results.length != 0);
    }
  );
};
exports.isAddressAvailable = (
  sehir,
  ilce,
  mahalle,
  cadde,
  sokak,
  no,
  callback
) => {
  connection.query(
    "SELECT sehir,ilce,mahalle,cadde,sokak,yer_no from vehicle where plaka=" +
      connection.escape(plaka),
    function (err, results) {
      if (err) {
        throw err;
      }
      return callback(results.length != 0);
    }
  );
};

exports.insertArac = (user_id, plaka, fuel_type, callback) => {
  connection.query(
    "INSERT INTO vehicle (plaka,fuel_type) VALUES(" +
      connection.escape(plaka) +
      "," +
      connection.escape(fuel_type) +
      ");",
    function (err, result) {
      if (err) throw err;
      else {
        connection.query(
          "UPDATE user SET plaka =" +
            connection.escape(plaka) +
            "WHERE account_id=" +
            connection.escape(user_id),
          function (err, result) {
            if (err) throw err;
            else return callback(true);
          }
        );
      }
    }
  );
};

exports.insertPark=(isim,ilce,mahalle,cadde,sokak,no,kapasite,ucret,callback)=>{
  connection.query(
    "INSERT INTO Address (sehir,ilce,mahalle,cadde,sokak,yer_no) VALUES(" +
      connection.escape("İstanbul") +
      "," +
      connection.escape(ilce) +","+
      connection.escape(mahalle) +","+
      connection.escape(cadde) +","+
      connection.escape(sokak) +","+
      connection.escape(no)+
      ");",
    function (err, result) {
      if (err) throw err;
      else{
        connection.query(
          "INSERT INTO otopark (name,kapasite,saatlik_ücret,address_id) VALUES(" +
      connection.escape(isim)+","+
      connection.escape(kapasite) +","+
      connection.escape(ucret)+","+
      connection.escape(result.insertId)+
      ");",(err,result)=>{
        if(err) throw err;
        else{
          callback(true);
        }
      }
        )
      }
    }
  );
}

exports.getParkfromDistrict=(ilce,callback)=>{
  connection.query(
    "SELECT otopark.name,otopark.saatlik_ücret,Address.ilce, otopark.kapasite FROM otopark INNER JOIN Address ON Address.address_id=otopark.address_id WHERE Address.ilce="+
    connection.escape(ilce),
    (err,results)=>{
      if(err) throw Error
      else{
        return callback(results);
      }
    }
    

    )}

  exports.getInvoice=(user_id,callback)=>{
    connection.query(
      "SELECT users.name,users.tel_no,invoice.tutar from users INNER JOIN invoice ON invoice.user_id=users.user_id WHERE users.user_id="+
      connection.escape(user_id),
      (err,result)=>{
        if (err) throw Error
        else{
          return callback(result);
        }
      }
    )
    

  }


  exports.removeAccount=(account_type,id,callback)=>{
    connection.query(
      "DELETE FROM"+account_type +"WHERE"+ account_type+".account_id = "+
      connection.escape(id),
      (err,results)=>{
        if(err) throw Error
        else{
          return callback(true);
        }
      }
    )
  }

  exports.updateUserInfo=(name,surname,tel,id,callback)=>{
      connection.query(
        "UPDATE users SET name = "+connection.escape(name)+","+" surname= "+connection.escape(surname)+","+"tel_no="+connection.escape(tel)+" WHERE account_id="+id,
        (err,result)=>{
         if(err) throw Error
         else{
           return callback(true);
         }
        }
       )
  }

exports.updateCompanyInfo=(name,tel,id,callback)=>{
    connection.query(
      "UPDATE company SET company_name = "+connection.escape(name)+","+" tel_no= "+connection.escape(tel)+" WHERE account_id="+id,
      (err,result)=>{
       if(err) throw Error
       else{
         return callback(true);
       }
      }
     )
}


  exports.getAllUserNumb=(callback)=>{
    connection.query(
      "SELECT (SELECT COUNT(user_id) FROM users) as user_number,(SELECT COUNT(company_id) FROM company) as company_number",
      (err,result)=>{
      
        return callback(result);
      }
    )
  }
  exports.getAll=(account_type,callback)=>{
    connection.query(
      "SELECT * FROM "+account_type+" INNER JOIN accounts WHERE "+account_type+".account_id=accounts.account_id"
      ,(err,result)=>{
        
        return callback(result);
      }
    )
  }
  exports.settingsAccount=(account_type,id,callback)=>{
    connection.query(
      "SELECT * FROM "+account_type+" WHERE account_id="+
      connection.escape(id),
      (err,result)=>{
        if (err) throw Error;
        else{
          return callback(result);
        }
      }
    )

  }
  