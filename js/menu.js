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

 const nome = (document.querySelector("#nome")?.value || "").trim();
const endereco = (document.querySelector("#endereco")?.value || "").trim();
const pagamento = (document.querySelector("#pagamento")?.value || "").trim();
const obs = (document.querySelector("#obs")?.value || "").trim();

  let msg = "🍇 LP Grill Açaí — Pedido\n";
  msg += "-------------------------\n";

  if(cart.length === 0){
    msg += "⚠️ Carrinho vazio.\n";
  }else{
    cart.forEach((it, i) => {
      const q = Number(it.qty || 1);
      const p = Number(it.price || 0);
      const sub = (q*p).toFixed(2).replace(".", ",");
      msg += `${i+1}) ${q}x ${it.name} — R$ ${sub}\n`;
    });

    msg += "-------------------------\n";
    msg += `💰 Total: R$ ${total.toFixed(2).replace(".", ",")}\n`;
  }

  if(nome) msg += `\n👤 Nome: ${nome}\n`;
  if(endereco) msg += `📍 Endereço: ${endereco}\n`;
  if(pagamento) msg += `💳 Pagamento: ${pagamento}\n`;
  if(obs) msg += `📝 Obs: ${obs}\n`;

  msg += "\n✅ Enviado pelo site.";

  return msg;
}

function refreshWhatsAppLink(){
  const a = document.querySelector("#waFloat");
  if(!a) return;
  a.href = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
}

// atualiza ao abrir e sempre que mexer no carrinho
document.addEventListener("DOMContentLoaded", refreshWhatsAppLink);
window.addEventListener("storage", refreshWhatsAppLink);

document.addEventListener("click", (e) => {
  const a = e.target.closest("#waFloat");
  if(!a) return;
  refreshWhatsAppLink();
});
/* =========================
   ✅ Marcar adicionais ao clicar
   - funciona em botões/divs clicáveis
   - não quebra se não existir
   ========================= */

// Troque aqui se o seu HTML usar outro seletor de adicional:
const ADDON_SELECTOR = ".addon, .adicional, .extra, [data-addon]";

document.addEventListener("click", (e) => {
  const el = e.target.closest(ADDON_SELECTOR);
  if(!el) return;

  // toggle (marca/desmarca)
  el.classList.toggle("is-selected");

  // opcional: salvar seleção no localStorage por página (pra não perder ao atualizar)
  try{
    const key = "lp_addons_selected";
    const all = Array.from(document.querySelectorAll(ADDON_SELECTOR));
    const selectedIdx = all
      .map((node, idx) => node.classList.contains("is-selected") ? idx : null)
      .filter(v => v !== null);
    localStorage.setItem(key, JSON.stringify(selectedIdx));
  }catch(err){}
});

// opcional: restaurar seleção ao abrir a página
document.addEventListener("DOMContentLoaded", () => {
  try{
    const key = "lp_addons_selected";
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    const all = Array.from(document.querySelectorAll(ADDON_SELECTOR));
    saved.forEach(i => { if(all[i]) all[i].classList.add("is-selected"); });
  }catch(err){}
});
