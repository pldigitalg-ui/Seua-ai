// js/app.js
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const cfg = () => window.APP_CONFIG || { whatsapp:"", brand:"LP Grill" };

  function money(v){
    try { return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v); }
    catch { return `R$ ${Number(v).toFixed(2)}`.replace(".",","); }
  }
  function esc(str){
    return String(str ?? "").replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

  // =====================
  // CART STORAGE
  // =====================
  const LS_KEY = "lpgrill_cart_v2";
  let cart = loadCart();

  function loadCart(){
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
    catch { return []; }
  }
  function saveCart(){
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
    updateBadge();
    renderCart();
  }
  function cartCount(){ return cart.reduce((a,b)=>a+(b.qty||0),0); }
  function cartTotal(){ return cart.reduce((a,b)=>a + (b.qty*b.price),0); }

  function addItem(item){
    const f = cart.find(x => x.id === item.id);
    if (f) f.qty += 1;
    else cart.push({ ...item, qty: 1 });
    saveCart();
    toast("Adicionado ao carrinho ✅");
  }
  function dec(id){
    const f = cart.find(x => x.id===id);
    if (!f) return;
    f.qty -= 1;
    if (f.qty<=0) cart = cart.filter(x=>x.id!==id);
    saveCart();
  }
  function inc(id){
    const f = cart.find(x => x.id===id);
    if (!f) return;
    f.qty += 1;
    saveCart();
  }
  function rm(id){
    cart = cart.filter(x=>x.id!==id);
    saveCart();
  }

  // =====================
  // GLOBAL FLOATING BUTTONS
  // =====================
  function ensureFloatingWhats(){
    if ($("#wa-fab")) return;
    const a = document.createElement("a");
    a.id = "wa-fab";
    a.className = "wa-fab";
    a.href = `https://wa.me/${cfg().whatsapp}`;
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML = `<span class="wa-ic">💬</span><span class="wa-t">WhatsApp</span>`;
    document.body.appendChild(a);
  }

  function ensureCartUI(){
    if ($("#cart-fab")) return;

    const fab = document.createElement("button");
    fab.id = "cart-fab";
    fab.className = "cart-fab";
    fab.type = "button";
    fab.innerHTML = `
      <span class="cart-ic">🛒</span>
      <span class="cart-t">Carrinho</span>
      <span class="cart-badge" id="cart-badge">0</span>
    `;
    document.body.appendChil
