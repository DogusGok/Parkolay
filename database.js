const { call } = require("function-bind");
var mysql = require("mysql");
const connection = mysql.createPool({
  host: "db4free.net",
  user: "parkolay_user",
  password: "q3SyKnUkVkE3E*_",
  database: "parkolay",
});

exports.insertUser = (type, email, pass, name, surname, telNo, callback) => {
  connection.query(
    "INSERT INTO accounts (account_type,email,password) SELECT" +
      connection.escape(type) +
      "," +
      connection.escape(email) +
      "," +
      connection.escape(pass) +
      "WHERE NOT EXISTS(SELECT * FROM accounts WHERE email=" +
      connection.escape(email) +
      ")",
    function (err, results) {
      if (err) throw err;
      else if (results.affectedRows == 1) {
        console.log(results);
        connection.query(
          "INSERT INTO users (account_id,name,surname,tel_no) VALUES(" +
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
              return callback(results.affectedRows);
            }
          }
        );
      } else return callback(results.affectedRows);
    }
  );
};
exports.insertCompany = (type, email, pass, name, telNo, callback) => {
  connection.query(
    "INSERT INTO accounts (account_type,email,password) SELECT" +
      connection.escape(type) +
      "," +
      connection.escape(email) +
      "," +
      connection.escape(pass) +
      "WHERE NOT EXISTS(SELECT * FROM accounts WHERE email=" +
      connection.escape(email) +
      ")",
    function (err, results) {
      if (err) throw err;
      else if (results.affectedRows == 1) {
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
              return callback(results.affectedRows);
            }
          }
        );
      } else return callback(results.affectedRows);
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
      if (results != null) {
        return callback(results);
      } else {
        return callback(null);
      }
    }
  );
};

// exports.isAddressAvailable = (
//   sehir,
//   ilce,
//   mahalle,
//   cadde,
//   sokak,
//   no,
//   callback
// ) => {
//   connection.query(
//     "SELECT sehir,ilce,mahalle,cadde,sokak,yer_no from vehicle where plaka=" +
//       connection.escape(plaka),
//     function (err, results) {
//       if (err) {
//         throw err;
//       }
//       return callback(results.length != 0);
//     }
//   );
// };

exports.insertArac = (user_id, plaka, fuel_type, callback) => {
  connection.query(
    "insert into vehicle (plaka,fuel_type,user_id)  select " +
      connection.escape(plaka) +
      "," +
      connection.escape(fuel_type) +
      "," +
      connection.escape(user_id) +
      " WHERE not exists(SELECT * from vehicle WHERE plaka=" +
      connection.escape(plaka) +
      ")",
    function (err, result) {
      if (err) throw err;
      else return callback(result.affectedRows);
    }
  );
};

exports.insertPark = (
  company_id,
  isim,
  ilce,
  mahalle,
  cadde,
  sokak,
  no,
  kapasite,
  ucret,
  callback
) => {
  connection.query(
    "INSERT INTO Address (sehir,ilce,mahalle,cadde,sokak,yer_no) VALUES(" +
      connection.escape("İstanbul") +
      "," +
      connection.escape(ilce) +
      "," +
      connection.escape(mahalle) +
      "," +
      connection.escape(cadde) +
      "," +
      connection.escape(sokak) +
      "," +
      connection.escape(no) +
      ");",
    function (err, result) {
      if (err) throw err;
      else {
        connection.query(
          "INSERT INTO otopark (name,kapasite,saatlik_ücret,address_id,company_id) VALUES(" +
            connection.escape(isim) +
            "," +
            connection.escape(kapasite) +
            "," +
            connection.escape(ucret) +
            "," +
            connection.escape(result.insertId) +
            "," +
            connection.escape(company_id) +
            ");",
          (err, result) => {
            if (err) throw err;
            else {
              callback(true);
            }
          }
        );
      }
    }
  );
};

exports.getParkfromDistrict = (ilce, callback) => {
  connection.query(
    "SELECT otopark_id,otopark.name,otopark.saatlik_ücret,Address.ilce, otopark.kapasite FROM otopark INNER JOIN Address ON Address.address_id=otopark.address_id WHERE Address.ilce=" +
      connection.escape(ilce),
    (err, results) => {
      if (err) throw Error;
      else {
        return callback(results);
      }
    }
  );
};
exports.getAllParkForCompany = (company_id, callback) => {
  connection.query(
    "SELECT otopark_id,otopark.name,Address.ilce,otopark.kapasite,otopark.mevcut_arac_sayisi,round((mevcut_arac_sayisi* 100.0) / (kapasite))AS doluluk_orani,otopark.saatlik_ücret FROM otopark INNER JOIN Address ON Address.address_id=otopark.address_id and company_id=" +
      connection.escape(company_id),
    (err, results) => {
      if (results.length == 0) return callback(0);
      else {
        return callback(results);
      }
    }
  );
};
exports.getAllParkForUser = (callback) => {
  connection.query(
    "SELECT otopark_id,otopark.name,Address.ilce,otopark.kapasite,otopark.mevcut_arac_sayisi,round((mevcut_arac_sayisi* 100.0) / (kapasite))AS doluluk_orani,otopark.saatlik_ücret FROM otopark INNER JOIN Address ON Address.address_id=otopark.address_id ",
    (err, results) => {
      if (err) throw err;
      return callback(results);
    }
  );
};
exports.deleteOtopark = (otoparkId, callback) => {
  connection.query(
    "DELETE FROM otopark WHERE otopark_id=" + connection.escape(otoparkId),
    (err, results) => {
      if (err) throw Error;
      else {
        return callback(results);
      }
    }
  );
};
exports.getFilteredParks = (
  account_id,
  account_type,
  ilce,
  minUcret,
  maxUcret,
  sıralama,
  callback
) => {
  var query;
  if (minUcret == "") minUcret = 0;
  if (maxUcret == "") maxUcret = 10000;
  if (sıralama == "") sıralama = "ilce";
  console.log(ilce, minUcret, maxUcret, connection.escape(sıralama));
  if (ilce == "") {
    switch (account_type) {
      case "user":
        query =
          "SELECT otopark.name,Address.ilce,otopark.mevcut_arac_sayisi,round((mevcut_arac_sayisi* 100.0) / (kapasite))AS doluluk_orani,otopark.saatlik_ücret FROM otopark INNER JOIN Address ON Address.address_id=otopark.address_id where saatlik_ücret between " +
          connection.escape(minUcret) +
          " and  " +
          connection.escape(maxUcret) +
          " order by  " +
          sıralama;
        break;
      case "company":
        query =
          "SELECT otopark.name,Address.ilce,otopark.mevcut_arac_sayisi,round((mevcut_arac_sayisi* 100.0) / (kapasite))AS doluluk_orani,otopark.saatlik_ücret FROM otopark INNER JOIN Address ON Address.address_id=otopark.address_id where company_id=" +
          connection.escape(account_id) +
          " and saatlik_ücret between " +
          connection.escape(minUcret) +
          " and  " +
          connection.escape(maxUcret) +
          " order by  " +
          sıralama;
        break;
    }
  } else {
    switch (account_type) {
      case "user":
        query =
          "SELECT otopark.name,Address.ilce,otopark.mevcut_arac_sayisi,round((mevcut_arac_sayisi* 100.0) / (kapasite))AS doluluk_orani,otopark.saatlik_ücret FROM otopark INNER JOIN Address ON Address.address_id=otopark.address_id where ilce=" +
          connection.escape(ilce) +
          " and saatlik_ücret between " +
          connection.escape(minUcret) +
          " and  " +
          connection.escape(maxUcret) +
          " order by  " +
          connection.escape(sıralama);
        break;
      case "company":
        query =
          "SELECT otopark.name,Address.ilce,otopark.mevcut_arac_sayisi,round((mevcut_arac_sayisi* 100.0) / (kapasite))AS doluluk_orani,otopark.saatlik_ücret FROM otopark INNER JOIN Address ON Address.address_id=otopark.address_id where company_id=" +
          connection.escape(account_id) +
          "and ilce=" +
          connection.escape(ilce) +
          " and saatlik_ücret between " +
          connection.escape(minUcret) +
          " and  " +
          connection.escape(maxUcret) +
          " order by  " +
          connection.escape(sıralama);
        break;
    }
  }
  connection.query(query, (err, results) => {
    if (err) throw err;
    else {
      return callback(results);
    }
  });
};
exports.parkEt = (otoparkId, vehicle_id, callback) => {
  connection.query(
    "UPDATE otopark set mevcut_arac_sayisi=mevcut_arac_sayisi+1 where otopark_id=4 and kapasite>mevcut_arac_sayisi+1;",
    (err, results) => {}
  );
};
exports.getVehicleAndInfosWithId = (account_id, callback) => {
  connection.query(
    "SELECT v.plaka, o.name,o.saatlik_ücret, a.sehir, a.ilce,a.mahalle,a.cadde,a.sokak,a.yer_no FROM vehicle v LEFT JOIN otopark o ON v.otopark_id =o.otopark_id LEFT JOIN Address a ON o.address_id = a.address_id WHERE v.user_id = " +
      connection.escape(account_id),
    (err, results) => {
      if (err) {
        throw err;
      } else {
        return callback(results);
      }
    }
  );
};
exports.getAvailableVehicle = (account_id, callback) => {
  connection.query(
    "SELECT * FROM vehicle where user_id=" +
      connection.escape(account_id) +
      "and otopark_id is null",

    (err, results) => {
      if (err) {
        throw err;
      } else {
        return callback(results);
      }
    }
  );
};
//----------------ADMİN İŞLEMLERİ------------------
exports.removeAccount = (account_type, id, callback) => {
  connection.query(
    "DELETE FROM" +
      account_type +
      "WHERE" +
      account_type +
      ".account_id = " +
      connection.escape(id),
    (err, results) => {
      if (err) throw Error;
      else {
        return callback(true);
      }
    }
  );
};

exports.updateUserInfo = (name, surname, tel, id, callback) => {
  connection.query(
    "UPDATE users SET name = " +
      connection.escape(name) +
      "," +
      " surname= " +
      connection.escape(surname) +
      "," +
      "tel_no=" +
      connection.escape(tel) +
      " WHERE account_id=" +
      id,
    (err, result) => {
      if (err) throw Error;
      else {
        return callback(true);
      }
    }
  );
};

exports.updateCompanyInfo = (name, tel, id, callback) => {
  connection.query(
    "UPDATE company SET company_name = " +
      connection.escape(name) +
      "," +
      " tel_no= " +
      connection.escape(tel) +
      " WHERE account_id=" +
      id,
    (err, result) => {
      if (err) throw Error;
      else {
        return callback(true);
      }
    }
  );
};

exports.getAllUserNumb = (callback) => {
  connection.query(
    "SELECT (SELECT COUNT(user_id) FROM users) as user_number,(SELECT COUNT(company_id) FROM company) as company_number",
    (err, result) => {
      return callback(result);
    }
  );
};
exports.getAll = (account_type, callback) => {
  connection.query(
    "SELECT * FROM " +
      account_type +
      " INNER JOIN accounts WHERE " +
      account_type +
      ".account_id=accounts.account_id",
    (err, result) => {
      return callback(result);
    }
  );
};
exports.settingsAccount = (account_type, id, callback) => {
  connection.query(
    "SELECT * FROM " +
      account_type +
      " WHERE account_id=" +
      connection.escape(id),
    (err, result) => {
      if (err) throw Error;
      else {
        return callback(result);
      }
    }
  );
};
exports.getInvoice = () => {};
