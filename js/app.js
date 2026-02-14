/* ========= Helpers ========= */
const money = (v) => (Number(v) || 0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });

function mustConfigWhatsApp(){
  const ok = window.CONFIG && typeof CONFIG.whatsapp === "string" && CONFIG.whatsapp.trim().length >= 10;
  return ok;
}

function waLink(text){
  const phone = (CONFIG.whatsapp || "").replace(/\D/g,"");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function $(id){ return document.getElementById(id); }

function loadCart(){
  try{
    return JSON.parse(localStorage.getItem("CART_V1") || "[]");
  }catch(e){ return []; }
}
function saveCart(cart){
  localStorage.setItem("CART_V1", JSON.stringify(cart));
}

function cartSubtotal(cart){
  return cart.reduce((sum, it) => sum + (it.precoUnit * it.qtd), 0);
}

function upsertCartItem(cart, item){
  const key = item.key || item.id;
  const idx = cart.findIndex(x => (x.key || x.id) === key);
  if(idx >= 0){
    cart[idx].qtd += item.qtd;
  }else{
    cart.push(item);
  }
  return cart;
}

/* ========= Menu mobile ========= */
function initMobileMenu(){
  const btn = $("btnHamb");
  const mob = $("mobMenu");
  if(!btn || !mob) return;

  btn.addEventListener("click", () => {
    const open = mob.hasAttribute("hidden");
    if(open){
      mob.removeAttribute("hidden");
      btn.setAttribute("aria-expanded","true");
    }else{
      mob.setAttribute("hidden","");
      btn.setAttribute("aria-expanded","false");
    }
  });
}

/* ========= WhatsApp flutuante ========= */
function initWaFloat(){
  const a = $("waFloat");
  const msg = $("waFloatMsg");
  if(!a) return;

  if(msg && CONFIG && CONFIG.waFloatMsg) msg.textContent = CONFIG.waFloatMsg;

  const text = `Olá! Vim pelo site da ${CONFIG.lojaNome || "loja"}. Preciso de ajuda 🙂`;
  if(!mustConfigWhatsApp()){
    a.href = "#";
    a.addEventListener("click", (e) => {
      e.preventDefault();
      alert("WhatsApp não configurado. Edite js/config.js e coloque seu número em window.CONFIG.whatsapp.");
    });
    return;
  }
  a.href = waLink(text);
}

/* ========= Render Carrinho ========= */
function renderCart(){
  const cartEl = $("cartItems");
  const subEl = $("cartSubtotal");
  if(!cartEl || !subEl) return;

  const cart = loadCart();
  subEl.textContent = money(cartSubtotal(cart));

  if(cart.length === 0){
    cartEl.innerHTML = `<div class="muted" style="padding:8px 2px;font-size:13px;line-height:1.4">
      Seu carrinho está vazio. Toque em um item para marcar e adicionar.
    </div>`;
    return;
  }

  cartEl.innerHTML = cart.map((it, i) => {
    const extrasLine = it.extras && it.extras.length
      ? `<div class="meta"><strong>Adicionais:</strong> ${it.extras.join(", ")}</div>`
      : (it.obs ? `<div class="meta">${it.obs}</div>` : `<div class="meta">${it.desc || ""}</div>`);

    return `
      <div class="cartItem">
        <div class="head">
          <div>
            <div class="name">${it.nome}</div>
            ${extrasLine}
          </div>
          <div class="price">${money(it.precoUnit)}</div>
        </div>

        <div class="actions">
          <div class="qty">
            <button data-act="minus" data-i="${i}" aria-label="Diminuir">−</button>
            <strong>${it.qtd}</strong>
            <button data-act="plus" data-i="${i}" aria-label="Aumentar">+</button>
          </div>
          <button class="small danger" data-act="del" data-i="${i}">Remover</button>
        </div>
      </div>
    `;
  }).join("");

  cartEl.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", () => {
      const act = btn.getAttribute("data-act");
      const i = Number(btn.getAttribute("data-i"));
      const cartNow = loadCart();
      if(!cartNow[i]) return;

      if(act === "plus") cartNow[i].qtd += 1;
      if(act === "minus"){
        cartNow[i].qtd -= 1;
        if(cartNow[i].qtd <= 0) cartNow.splice(i,1);
      }
      if(act === "del") cartNow.splice(i,1);

      saveCart(cartNow);
      renderCart();
      syncSelectedCards();
    });
  });
}

/* ========= Sincronizar seleção visual ========= */
function syncSelectedCards(){
  const cart = loadCart();
  const ids = new Set(cart.filter(x => x.id).map(x => x.id));
  document.querySelectorAll("[data-prod-id]").forEach(card => {
    const id = card.getAttribute("data-prod-id");
    if(ids.has(id)) card.classList.add("selected");
    else card.classList.remove("selected");
  });
}

/* ========= Página Index ========= */
function initIndex(){
  const tabsEl = $("tabs");
  const productsEl = $("products");
  if(!tabsEl || !productsEl) return;

  const cats = window.DB.categorias;
  const prods = window.DB.produtos;

  let activeCat = cats[0]?.id || "";
  let query = "";

  function renderTabs(){
    tabsEl.innerHTML = cats.map(c => `
      <div class="tab ${c.id === activeCat ? "active":""}" data-cat="${c.id}">${c.nome}</div>
    `).join("");
    tabsEl.querySelectorAll(".tab").forEach(t => {
      t.addEventListener("click", () => {
        activeCat = t.getAttribute("data-cat");
        renderProducts();
        renderTabs();
      });
    });
  }

  function isInCart(prodId){
    const cart = loadCart();
    return cart.some(x => x.id === prodId);
  }

  function toggleProduct(prodId){
    const p = prods.find(x => x.id === prodId);
    if(!p) return;

    const cart = loadCart();
    const idx = cart.findIndex(x => x.id === prodId);

    if(idx >= 0){
      cart.splice(idx,1); // toggle remove
    }else{
      cart.push({
        id: p.id,
        nome: p.nome,
        desc: p.desc,
        precoUnit: p.preco,
        qtd: 1,
        extras: []
      });
    }
    saveCart(cart);
  }

  function renderProducts(){
    const list = prods
      .filter(p => p.cat === activeCat)
      .filter(p => {
        if(!query) return true;
        const s = (p.nome + " " + (p.desc||"")).toLowerCase();
        return s.includes(query.toLowerCase());
      });

    productsEl.innerHTML = list.map(p => `
      <div class="card" data-prod-id="${p.id}">
        ${p.img ? `<div class="pimg"><img src="${p.img}" alt="${p.nome}" loading="lazy"></div>` : ``}

        <div class="top">
          <strong>${p.nome}</strong>
          <div class="price">${money(p.preco)}</div>
        </div>

        <div class="desc">${p.desc || ""}</div>

        <div class="badge">
          <span class="dot"></span>
          <span>Toque para ${isInCart(p.id) ? "remover" : "adicionar"}</span>
        </div>
      </div>
    `).join("");

    productsEl.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-prod-id");
        toggleProduct(id);
        renderCart();
        syncSelectedCards();
        renderProducts(); // atualiza badge texto
      });
    });

    syncSelectedCards();
  }

  const s = $("search");
  if(s){
    s.addEventListener("input", () => {
      query = s.value.trim();
      renderProducts();
    });
  }

  const goCheckout = $("goCheckout");
  if(goCheckout){
    goCheckout.addEventListener("click", () => {
      window.location.href = "checkout.html";
    });
  }

  const clear = $("clearCart");
  if(clear){
    clear.addEventListener("click", () => {
      saveCart([]);
      renderCart();
      syncSelectedCards();
      renderProducts();
    });
  }

  renderTabs();
  renderProducts();
  renderCart();
}

/* ========= Página Açaí Builder ========= */
function initBuilder(){
  const root = $("builder");
  if(!root) return;

  const B = window.DB.acaiBuilder;

  const state = { base:null, creme:null, adicionais:[] };

  function total(){
    const base = state.base?.preco || 0;
    const creme = state.creme?.preco || 0;
    const add = state.adicionais.reduce((s,a)=> s + a.preco, 0);
    return base + creme + add;
  }

  function render(){
    root.innerHTML = `
      <div class="group">
        <h3>1) Escolha o tamanho (obrigatório)</h3>
        <div class="opts">
          ${B.base.map(x => `
            <div class="opt ${state.base?.id===x.id?"selected":""}" data-type="base" data-id="${x.id}">
              <strong>${x.nome}</strong>
              <div class="p">${money(x.preco)}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="group">
        <h3>2) Creme (opcional)</h3>
        <div class="opts">
          ${B.cremes.map(x => `
            <div class="opt ${state.creme?.id===x.id?"selected":""}" data-type="creme" data-id="${x.id}">
              <strong>${x.nome}</strong>
              <div class="p">+ ${money(x.preco)}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="group">
        <h3>3) Adicionais (toque para marcar/desmarcar)</h3>
        <div class="opts">
          ${B.adicionais.map(x => `
            <div class="opt ${state.adicionais.some(a=>a.id===x.id)?"selected":""}" data-type="add" data-id="${x.id}">
              <strong>${x.nome}</strong>
              <div class="p">+ ${money(x.preco)}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="group">
        <h3>Total do seu açaí</h3>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px">
          <div class="muted" style="font-size:13px;line-height:1.35">
            Tamanho + creme + adicionais
          </div>
          <div style="font-weight:900;font-size:18px">${money(total())}</div>
        </div>
      </div>
    `;

    root.querySelectorAll(".opt").forEach(el => {
      el.addEventListener("click", () => {
        const type = el.getAttribute("data-type");
        const id = el.getAttribute("data-id");

        if(type === "base"){
          state.base = B.base.find(x => x.id === id) || null;
        }

        if(type === "creme"){
          if(state.creme?.id === id) state.creme = null;
          else state.creme = B.cremes.find(x => x.id === id) || null;
        }

        if(type === "add"){
          const exists = state.adicionais.find(a => a.id === id);
          if(exists){
            state.adicionais = state.adicionais.filter(a => a.id !== id);
          }else{
            const item = B.adicionais.find(x => x.id === id);
            if(item) state.adicionais.push(item);
          }
        }

        render();
      });
    });
  }

  function builderToCartItem(){
    if(!state.base) return null;

    const extras = [];
    if(state.creme) extras.push(state.creme.nome);
    state.adicionais.forEach(a => extras.push(a.nome));

    const key = `ACAI-${state.base.id}-${state.creme?.id || "0"}-${state.adicionais.map(a=>a.id).sort().join(".") || "0"}`;

    return {
      key,
      id: "builder-acai",
      nome: `Açaí ${state.base.nome.replace("Copo ","")}`,
      desc: "Monte seu açaí",
      precoUnit: total(),
      qtd: 1,
      extras
    };
  }

  const addBtn = $("addBuilderToCart");
  if(addBtn){
    addBtn.addEventListener("click", () => {
      const item = builderToCartItem();
      if(!item){
        alert("Escolha o tamanho do açaí para adicionar ao carrinho.");
        return;
      }
      const cart = loadCart();
      upsertCartItem(cart, item);
      saveCart(cart);
      renderCart();
      alert("Açaí adicionado ao carrinho ✅");
    });
  }

  const reset = $("resetBuilder");
  if(reset){
    reset.addEventListener("click", () => {
      state.base = null;
      state.creme = null;
      state.adicionais = [];
      render();
    });
  }

  render();
  renderCart();
}

/* ========= Checkout ========= */
function buildOrderText(customer){
  const cart = loadCart();
  const total = money(cartSubtotal(cart));

  const lines = [];
  lines.push(`*🧾 Pedido - ${CONFIG.lojaNome || "Loja"}*`);
  lines.push(``);

  cart.forEach((it, idx) => {
    lines.push(`*${idx+1})* ${it.qtd}x ${it.nome} — ${money(it.precoUnit * it.qtd)}`);
    if(it.extras && it.extras.length){
      lines.push(`   _Adicionais:_ ${it.extras.join(", ")}`);
    }else if(it.desc){
      lines.push(`   _Detalhe:_ ${it.desc}`);
    }
  });

  lines.push(``);
  lines.push(`*Total:* ${total}`);
  lines.push(``);
  lines.push(`*Cliente:* ${customer.nome}`);
  lines.push(`*Endereço:* ${customer.endereco}`);
  lines.push(`*Pagamento:* ${customer.pagamento}`);
  if(customer.obs) lines.push(`*Obs:* ${customer.obs}`);

  return lines.join("\n");
}

function initCheckout(){
  const form = $("checkoutForm");
  if(!form) return;

  const warn = $("checkoutWarn");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const cart = loadCart();
    const nome = $("cNome").value.trim();
    const endereco = $("cEndereco").value.trim();
    const pagamento = $("cPagamento").value.trim();
    const obs = $("cObs").value.trim();

    const okCart = cart.length > 0;
    const okFields = nome && endereco && pagamento;

    if(!okCart || !okFields){
      if(warn) warn.hidden = false;
      return;
    }
    if(warn) warn.hidden = true;

    if(!mustConfigWhatsApp()){
      alert("WhatsApp não configurado. Edite js/config.js e coloque seu número em window.CONFIG.whatsapp.");
      return;
    }

    const text = buildOrderText({ nome, endereco, pagamento, obs });
    window.open(waLink(text), "_blank", "noopener");
  });

  const clear = $("clearCart");
  if(clear){
    clear.addEventListener("click", () => {
      saveCart([]);
      renderCart();
    });
  }

  renderCart();
}

/* ========= Init ========= */
(function boot(){
  initMobileMenu();
  initWaFloat();

  const clear = $("clearCart");
  if(clear){
    clear.addEventListener("click", () => {
      saveCart([]);
      renderCart();
      syncSelectedCards();
    });
  }

  initIndex();
  initBuilder();
  initCheckout();

  if(!mustConfigWhatsApp()){
    console.warn("WhatsApp não configurado. Edite js/config.js (window.CONFIG.whatsapp).");
  }
})();
