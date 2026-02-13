document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("menuToggle");
  const overlay = document.getElementById("menuOverlay");
  if (!btn || !overlay) return;

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    document.body.classList.toggle("menu-open");
  });

  overlay.addEventListener("click", function () {
    document.body.classList.remove("menu-open");
  });
});
/* =========================
   ✅ WHATSAPP (LP Grill Açaí)
   ========================= */
const WA_PHONE = "553198832407"; // ✅ 55 + DDD + número

function getCartFromStorage(){
  try { return JSON.parse(localStorage.getItem("lp_cart") || "[]"); }
  catch(e){ return []; }
}

function cartTotal(cart){
  return cart.reduce((sum, it) => sum + (Number(it.price||0) * Number(it.qty||1)), 0);
}

function buildWhatsAppMessage(){
  const cart = getCartFromStorage();
  const total = cartTotal(cart);

  // Se você já tem campos de nome/endereço, podemos puxar aqui pelo id:
  const nome = (document.querySelector("#nome")?.value || "").trim();
  const endereco = (document.querySelector("#endereco")?.value || "").trim();
  const pagamento = (document.querySelector("#pagamento")?.value || "").trim();
  const obs = (document.querySelector("#obs")?.value || "").trim();

  let msg = "🍇 *LP Grill Açaí — Pedido*%0A";
  msg += "-------------------------%0A";

  if(cart.length === 0){
    msg += "⚠️ Carrinho vazio.%0A";
  }else{
    cart.forEach((it, i) => {
      const q = Number(it.qty||1);
      const p = Number(it.price||0);
      const sub = (q*p).toFixed(2).replace(".", ",");
      msg += `${i+1}) ${q}x ${it.name} — R$ ${sub}%0A`;
    });
    msg += "-------------------------%0A";
    msg += `💰 *Total:* R$ ${total.toFixed(2).replace(".", ",")}%0A`;
  }

  // Dados do cliente (se tiver campo)
  if(nome) msg += `%0A👤 Nome: ${encodeURIComponent(nome)}%0A`;
  if(endereco) msg += `📍 Endereço: ${encodeURIComponent(endereco)}%0A`;
  if(pagamento) msg += `💳 Pagamento: ${encodeURIComponent(pagamento)}%0A`;
  if(obs) msg += `📝 Obs: ${encodeURIComponent(obs)}%0A`;

  msg += "%0A✅ Enviado pelo site.";

  return msg;
}

function refreshWhatsAppLink(){
  const a = document.querySelector("#waFloat");
  if(!a) return;
  a.href = `https://wa.me/${WA_PHONE}?text=${buildWhatsAppMessage()}`;
}

// atualiza ao abrir e sempre que mexer no carrinho
document.addEventListener("DOMContentLoaded", refreshWhatsAppLink);
window.addEventListener("storage", refreshWhatsAppLink);
