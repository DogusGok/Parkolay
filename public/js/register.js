a.onclick=function(){
    var pass=document.getElementById("bussines-pass").value;
    var repass=document.getElementById("bussines-repass").value;
    if(pass==""){
        alert("Şifre Boş Bırakılamaz")
    }else if(pass!=repass){
        alert("Şifreler aynı değil");
    }else{
        console.log("Başarılı")
    }
}
    