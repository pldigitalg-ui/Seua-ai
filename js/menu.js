document.addEventListener("DOMContentLoaded", function(){

  const botao = document.getElementById("menuToggle");
  const menu = document.getElementById("siteMenu");
  const overlay = document.getElementById("menuOverlay");

  if(!botao || !menu || !overlay) return;

  botao.addEventListener("click", function(){
    menu.classList.toggle("ativo");
    overlay.classList.toggle("ativo");
  });

  overlay.addEventListener("click", function(){
    menu.classList.remove("ativo");
    overlay.classList.remove("ativo");
  });

});
