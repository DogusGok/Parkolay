var a=document.getElementById("regis")
a.onclick=function(){
    var pass=document.getElementById("form3Example4cg").value;
    var repass=document.getElementById("form3Example4cdg").value;
    if(pass==""){
        alert("Şifre Boş Bırakılamaz")
    }else if(pass!=repass){
        alert("Şifreler aynı değil");
    }else{
        console.log("Başarılı")
    }
}
