var mysql = require("mysql");
const connection = mysql.createPool({
  host: "remotemysql.com",
  user: "xRrfTdEb8w",
  password: "E9Dj4rlvkJ",
  database: "xRrfTdEb8w",
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
