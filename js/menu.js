document.addEventListener("DOMContentLoaded", function(){

  const botao = document.getElementById("menuToggle");
  const overlay = document.getElementById("menuOverlay");

  if(!botao || !overlay) return;

  botao.addEventListener("click", function(){
    document.body.classList.toggle("corpo-menu-abrir");
  });

  overlay.addEventListener("click", function(){
    document.body.classList.remove("corpo-menu-abrir");
  });

});
