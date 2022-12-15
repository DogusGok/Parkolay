var mysql = require("mysql");
const connection = mysql.createConnection({
  host: "remotemysql.com",
  user: "xRrfTdEb8w",
  password: "E9Dj4rlvkJ",
  database: "xRrfTdEb8w",
});

exports.isEmailExist=(mail,callback)=>{
    var a=connection.query(
        "SELECT email from accounts where email=?",
        [mail],
        function (err, results) {   
         
        return callback(results.length !=0) 
          
        }
    )
  
    
}

exports.insertUser=(type,mail,pass,callback)=>{
    connection.query(
        "INSERT accounts  (account_type,email,password) VALUES (?,?,?)",
        [type, mail, pass],
        function (err, results) {
          if (err) throw err;
          else{
            return callback(true);
          }
        }
      );
}
exports.getUser=(email,password,callback)=>{
    connection.query(
        "SELECT email, password,account_type,account_id FROM accounts WHERE email =" +
          connection.escape(email) +
          " AND password =" +
          connection.escape(password),
        function (err, results) {
          if (err) {
            throw err;
          }
          if (results.length != 0){
            
            return callback(results);
            
          }
        })
}

