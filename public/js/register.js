var a = document.getElementById("regis");
a.onclick = function () {
  var pass = document.getElementById("password").value;
  var repass = document.getElementById("rpassword").value;
  if (pass == "") {
    alert("Şifre Boş Bırakılamaz");
  } else if (pass != repass) {
    alert("Şifreler aynı değil");
  } else {
    console.log("Başarılı");
  }
};
