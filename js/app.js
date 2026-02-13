// js/app.js
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const cfg = () => window.APP_CONFIG || { whatsapp:"", brand:"LP Grill", deliveryFee:0 };

  function money(v){
    try { return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v); }
    catch { return `R$ ${Number(v||0).toFixed(2)}`.replace(".",","); }
  }
  function esc(str){
    return String(str ?? "").replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

  // MENU MOBILE (sem sumir botões no PC)
  function initMobileMenu(){
    const toggle = $("#menuToggle");
    const overlay = $("#menuOverlay");
    if (!toggle || !overlay) return;

    const open = () => document.body.classList.add("menu-open");
    const close = () => document.body.classList.remove("menu-open");
    const isOpen = () => document.body.classList.contains("menu-open");

    toggle.addEventListener("click", () => isOpen() ? close() : open());
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  // CART
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

  // Whats flutuante
  function ensureFloatingWhats(){
    if ($("#wa-fab")) return;
    if (!cfg().whatsapp) return;
    const a = document.createElement("a");
    a.id = "wa-fab";
    a.className = "wa-fab";
  const msg = (typeof buildWhatsAppMessage === "function")
  ? buildWhatsAppMessage()
  : "Olá! Quero fazer um pedido.";
a.href = `https://wa.me/${cfg().whatsapp}?text=${encodeURIComponent(msg)}`;
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML = `<span class="wa-ic">💬</span><span class="wa-t">WhatsApp</span>`;
    document.body.appendChild(a);
  }

  // Carrinho UI
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
    document.body.appendChild(fab);

    const modal = document.createElement("div");
    modal.id = "cart-modal";
    modal.className = "modal hidden";
    modal.innerHTML = `
      <div class="modal__backdrop" data-close="1"></div>
      <div class="modal__panel" role="dialog" aria-modal="true" aria-label="Carrinho">
        <div class="modal__head">
          <div>
            <h3>Seu carrinho</h3>
            <p class="muted">Preencha os dados obrigatórios e finalize no WhatsApp.</p>
          </div>
          <button class="icon-btn" type="button" data-close="1" aria-label="Fechar">✕</button>
        </div>

        <div class="modal__body">
          <div id="cart-empty" class="empty">
            <div class="empty__emoji">🧾</div>
            <div class="empty__title">Carrinho vazio</div>
            <div class="empty__sub">Toque em um item para adicionar.</div>
          </div>

          <div id="cart-list" class="cart-list"></div>

          <div class="form-grid">
            <div>
              <label class="label">Nome <b>(obrigatório)</b></label>
              <input id="ck-name" class="input" placeholder="Seu nome" />
            </div>
            <div>
              <label class="label">Telefone <b>(obrigatório)</b></label>
              <input id="ck-phone" class="input" placeholder="(31) 9xxxx-xxxx" />
            </div>
            <div class="col-2">
              <label class="label">Endereço / Retirada <b>(obrigatório)</b></label>
              <input id="ck-address" class="input" placeholder="Rua, número, bairro, referência..." />
            </div>
            <div class="col-2">
              <label class="label">Observações (opcional)</label>
              <textarea id="ck-notes" class="textarea" rows="3" placeholder="Ex: sem gelo, pouco granola..."></textarea>
            </div>
          </div>
        </div>

        <div class="modal__footer">
          <div class="total">
            <span class="muted">Total</span>
            <strong id="cart-total">R$ 0,00</strong>
          </div>
          <button id="btn-finalizar" class="btn btn-chrome" type="button">
            Finalizar o pedido
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    fab.addEventListener("click", () => openModal(true));
    modal.addEventListener("click", (e) => { if (e.target?.dataset?.close) openModal(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") openModal(false); });

    $("#btn-finalizar").addEventListener("click", finalizeWhatsApp);

    updateBadge();
    renderCart();
  }

  function openModal(open){
    const modal = $("#cart-modal");
    if (!modal) return;
    modal.classList.toggle("hidden", !open);
    document.body.classList.toggle("no-scroll", open);
  }

  function updateBadge(){
    const b = $("#cart-badge");
    if (b) b.textContent = String(cartCount());
  }

  function renderCart(){
    const list = $("#cart-list");
    const empty = $("#cart-empty");
    const totalEl = $("#cart-total");
    if (!list || !empty || !totalEl) return;

    const fee = Number(cfg().deliveryFee || 0);
    totalEl.textContent = money(cartTotal() + fee);

    if (cart.length === 0){
      empty.classList.remove("hidden");
      list.innerHTML = "";
      return;
    }

    empty.classList.add("hidden");
    list.innerHTML = cart.map(it => `
      <div class="cart-item">
        <div class="cart-item__main">
          <div class="cart-item__title">${esc(it.name)}</div>
          <div class="cart-item__sub">${esc(it.desc || "")}</div>
        </div>
        <div class="cart-item__right">
          <div class="cart-item__price">${money(it.price)}</div>
          <div class="qty">
            <button class="qty__btn" data-dec="${esc(it.id)}" type="button">−</button>
            <span class="qty__num">${it.qty}</span>
            <button class="qty__btn" data-inc="${esc(it.id)}" type="button">+</button>
          </div>
          <button class="link danger" data-rm="${esc(it.id)}" type="button">remover</button>
        </div>
      </div>
    `).join("");

    $$("[data-dec]", list).forEach(b => b.addEventListener("click", ()=>dec(b.dataset.dec)));
    $$("[data-inc]", list).forEach(b => b.addEventListener("click", ()=>inc(b.dataset.inc)));
    $$("[data-rm]", list).forEach(b => b.addEventListener("click", ()=>rm(b.dataset.rm)));
  }

  // ✅ BLOQUEIO obrigatório + impressão
  function finalizeWhatsApp(){
    if (cart.length === 0){ toast("Seu carrinho está vazio."); return; }
    if (!cfg().whatsapp){ toast("WhatsApp não configurado."); return; }

    const name = ($("#ck-name")?.value || "").trim();
    const phone = ($("#ck-phone")?.value || "").trim();
    const address = ($("#ck-address")?.value || "").trim();
    const notes = ($("#ck-notes")?.value || "").trim();

    if (!name || !phone || !address){
      toast("Preencha Nome, Telefone e Endereço ✅");
      if (!name) $("#ck-name")?.focus();
      else if (!phone) $("#ck-phone")?.focus();
      else $("#ck-address")?.focus();
      return;
    }

    const subtotal = cartTotal();
    const fee = Number(cfg().deliveryFee || 0);
    const total = Number((subtotal + fee).toFixed(2));

    const payload = {
      brand: cfg().brand,
      name, phone, address, notes,
      items: cart.map(it => ({ id: it.id, name: it.name, desc: it.desc, price: it.price, qty: it.qty })),
      subtotal, fee, total,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("lpgrill_last_order_print_v1", JSON.stringify(payload));

    const lines = [];
    lines.push(`🧾 *PEDIDO - ${cfg().brand}*`);
    lines.push("");
    cart.forEach(it => {
      lines.push(`• ${it.qty}x ${it.name} — ${money(it.qty * it.price)}`);
      if (it.desc) lines.push(`  ${it.desc}`);
    });
    lines.push("");
    lines.push(`Subtotal: ${money(subtotal)}`);
    if (fee > 0) lines.push(`Taxa: ${money(fee)}`);
    lines.push(`Total: *${money(total)}*`);
    lines.push(`\nNome: ${name}`);
    lines.push(`Telefone: ${phone}`);
    lines.push(`Endereço/Retirada: ${address}`);
    if (notes) lines.push(`Obs: ${notes}`);

    window.open("pedido.html", "_blank");
    window.open(`https://wa.me/${cfg().whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  }

  // HOME: grid
  function mountHome(){
    const grid = $("#home-acai-grid");
    if (!grid || !window.CATALOG?.home_acai) return;

    grid.innerHTML = window.CATALOG.home_acai.map(p => {
      const hasPrice = typeof p.price === "number";
      const priceHtml = hasPrice ? `<div class="price">${money(p.price)}</div>` : `<div class="price ghost">Personalizar</div>`;
      const badge = p.badge ? `<span class="badge">${esc(p.badge)}</span>` : "";
      const link = p.link ? `data-link="${esc(p.link)}"` : "";
      return `
        <article class="cardx" data-home-card="1" data-id="${esc(p.id)}" ${link}>
          <div class="thumb" style="background-image:url('${esc(p.img || "")}')">
            <span class="thumb__fallback">Imagem</span>
          </div>
          <div class="cardx__body">
            <div class="title-row">
              <h3>${esc(p.name)}</h3>
              ${badge}
            </div>
            <p>${esc(p.desc || "")}</p>
            <div class="bottom-row">
              ${priceHtml}
              <div class="tap">Toque para ${p.link ? "abrir" : "adicionar"}</div>
            </div>
          </div>
        </article>
      `;
    }).join("");

    $$('[data-home-card="1"]', grid).forEach(card => {
      card.addEventListener("click", () => {
        const link = card.dataset.link;
        const id = card.dataset.id;

        if (link) { window.location.href = link; return; }

        const p = window.CATALOG.home_acai.find(x => x.id === id);
        if (!p || typeof p.price !== "number") return;
        addItem({ id: p.id, name: p.name, desc: p.desc, price: p.price });
      });
    });
  }

  // PÁGINAS DE CATEGORIA (bebidas/combos/sorvetes)
  function mountCatalog(){
    const root = document.querySelector("[data-catalog]");
    if (!root || !window.CATALOG?.categories) return;

    const catId = root.getAttribute("data-catalog");
    const cat = window.CATALOG.categories.find(c => c.id === catId);
    if (!cat) return;

    const grid = $("#catalog-grid", root);
    if (!grid) return;

    grid.innerHTML = cat.items.map(it => `
      <article class="cardx" data-add-card="1" data-id="${esc(it.id)}">
        <div class="thumb" style="background-image:url('${esc(it.img || "")}')">
          <span class="thumb__fallback">Imagem</span>
        </div>
        <div class="cardx__body">
          <div class="title-row">
            <h3>${esc(it.name)}</h3>
            ${it.badge ? `<span class="badge">${esc(it.badge)}</span>` : ""}
          </div>
          <p>${esc(it.desc || "")}</p>
          <div class="bottom-row">
            <div class="price">${money(it.price)}</div>
            <div class="tap">Clique no card para adicionar</div>
          </div>
        </div>
      </article>
    `).join("");

    $$("[data-add-card='1']", grid).forEach(card => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        const it = cat.items.find(x => x.id === id);
        if (!it) return;
        addItem({ id: it.id, name: it.name, desc: it.desc, price: it.price });
      });
    });
  }

  // TOAST
  let toastTimer = null;
  function toast(msg){
    let el = $("#toast");
    if (!el){
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast hidden";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>el.classList.add("hidden"), 1800);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    ensureFloatingWhats();
    ensureCartUI();
    mountHome();
    mountCatalog();
  });
})();
// js/app.js
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const cfg = () => window.APP_CONFIG || { whatsapp:"", brand:"LP Grill", deliveryFee:0 };

  function money(v){
    try { return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v); }
    catch { return `R$ ${Number(v||0).toFixed(2)}`.replace(".",","); }
  }
  function esc(str){
    return String(str ?? "").replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

  /* MENU MOBILE */
  function initMobileMenu(){
    const toggle = $("#menuToggle");
    const overlay = $("#menuOverlay");
    const menu = $("#siteMenu");
    if (!toggle || !overlay || !menu) return;

    const open = () => document.body.classList.add("menu-open");
    const close = () => document.body.classList.remove("menu-open");
    const isOpen = () => document.body.classList.contains("menu-open");

    toggle.addEventListener("click", () => isOpen() ? close() : open());
    overlay.addEventListener("click", close);
    $$("a", menu).forEach(a => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* CART */
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

  /* FLOATING BUTTONS */
  function ensureFloatingWhats(){
    if ($("#wa-fab")) return;
    if (!cfg().whatsapp) return;
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
    document.body.appendChild(fab);

    const modal = document.createElement("div");
    modal.id = "cart-modal";
    modal.className = "modal hidden";
    modal.innerHTML = `
      <div class="modal__backdrop" data-close="1"></div>
      <div class="modal__panel" role="dialog" aria-modal="true" aria-label="Carrinho">
        <div class="modal__head">
          <div>
            <h3>Seu carrinho</h3>
            <p class="muted">Preencha os dados obrigatórios e finalize no WhatsApp.</p>
          </div>
          <button class="icon-btn" type="button" data-close="1" aria-label="Fechar">✕</button>
        </div>

        <div class="modal__body">
          <div id="cart-empty" class="empty">
            <div class="empty__emoji">🧾</div>
            <div class="empty__title">Carrinho vazio</div>
            <div class="empty__sub">Toque em um item para adicionar.</div>
          </div>

          <div id="cart-list" class="cart-list"></div>

          <div class="form-grid">
            <div>
              <label class="label">Nome <b>(obrigatório)</b></label>
              <input id="ck-name" class="input" placeholder="Seu nome" />
            </div>
            <div>
              <label class="label">Telefone <b>(obrigatório)</b></label>
              <input id="ck-phone" class="input" placeholder="(31) 9xxxx-xxxx" />
            </div>
            <div class="col-2">
              <label class="label">Endereço / Retirada <b>(obrigatório)</b></label>
              <input id="ck-address" class="input" placeholder="Rua, número, bairro, referência..." />
            </div>
            <div class="col-2">
              <label class="label">Observações (opcional)</label>
              <textarea id="ck-notes" class="textarea" rows="3" placeholder="Ex: sem gelo, pouco granola..."></textarea>
            </div>
          </div>
        </div>

        <div class="modal__footer">
          <div class="total">
            <span class="muted">Total</span>
            <strong id="cart-total">R$ 0,00</strong>
          </div>
          <button id="btn-finalizar" class="btn btn-chrome" type="button">
            Finalizar o pedido
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    fab.addEventListener("click", () => openModal(true));
    modal.addEventListener("click", (e) => { if (e.target?.dataset?.close) openModal(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") openModal(false); });

    $("#btn-finalizar").addEventListener("click", finalizeWhatsApp);

    updateBadge();
    renderCart();
  }

  function openModal(open){
    const modal = $("#cart-modal");
    if (!modal) return;
    modal.classList.toggle("hidden", !open);
    document.body.classList.toggle("no-scroll", open);
  }

  function updateBadge(){
    const b = $("#cart-badge");
    if (b) b.textContent = String(cartCount());
  }

  function renderCart(){
    const list = $("#cart-list");
    const empty = $("#cart-empty");
    const totalEl = $("#cart-total");
    if (!list || !empty || !totalEl) return;

    const fee = Number(cfg().deliveryFee || 0);
    totalEl.textContent = money(cartTotal() + fee);

    if (cart.length === 0){
      empty.classList.remove("hidden");
      list.innerHTML = "";
      return;
    }

    empty.classList.add("hidden");
    list.innerHTML = cart.map(it => `
      <div class="cart-item">
        <div class="cart-item__main">
          <div class="cart-item__title">${esc(it.name)}</div>
          <div class="cart-item__sub">${esc(it.desc || "")}</div>
        </div>
        <div class="cart-item__right">
          <div class="cart-item__price">${money(it.price)}</div>
          <div class="qty">
            <button class="qty__btn" data-dec="${esc(it.id)}" type="button">−</button>
            <span class="qty__num">${it.qty}</span>
            <button class="qty__btn" data-inc="${esc(it.id)}" type="button">+</button>
          </div>
          <button class="link danger" data-rm="${esc(it.id)}" type="button">remover</button>
        </div>
      </div>
    `).join("");

    $$("[data-dec]", list).forEach(b => b.addEventListener("click", ()=>dec(b.dataset.dec)));
    $$("[data-inc]", list).forEach(b => b.addEventListener("click", ()=>inc(b.dataset.inc)));
    $$("[data-rm]", list).forEach(b => b.addEventListener("click", ()=>rm(b.dataset.rm)));
  }

  /* ✅ BLOQUEIO: não envia sem dados obrigatórios */
  function finalizeWhatsApp(){
    if (cart.length === 0){ toast("Seu carrinho está vazio."); return; }
    if (!cfg().whatsapp){ toast("WhatsApp não configurado."); return; }

    const name = ($("#ck-name")?.value || "").trim();
    const phone = ($("#ck-phone")?.value || "").trim();
    const address = ($("#ck-address")?.value || "").trim();
    const notes = ($("#ck-notes")?.value || "").trim();

    if (!name || !phone || !address){
      toast("Preencha Nome, Telefone e Endereço ✅");
      // dá um “focus” no primeiro vazio
      if (!name) $("#ck-name")?.focus();
      else if (!phone) $("#ck-phone")?.focus();
      else $("#ck-address")?.focus();
      return;
    }

    const subtotal = cartTotal();
    const fee = Number(cfg().deliveryFee || 0);

    const printPayload = {
      brand: cfg().brand,
      name, phone, address, notes,
      items: cart.map(it => ({ id: it.id, name: it.name, desc: it.desc, price: it.price, qty: it.qty })),
      subtotal,
      fee,
      total: Number((subtotal + fee).toFixed(2)),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("lpgrill_last_order_print_v1", JSON.stringify(printPayload));

    const lines = [];
    lines.push(`🧾 *PEDIDO - ${cfg().brand}*`);
    lines.push("");
    cart.forEach(it => {
      lines.push(`▪ ${it.qty}x ${it.name}`);
      if (it.desc) lines.push(`   ${it.desc}`);
      lines.push(`   ${money(it.qty * it.price)}`);
    });

    lines.push("");
    lines.push(`💰 Subtotal: ${money(subtotal)}`);
    if (fee > 0) lines.push(`🚚 Entrega: ${money(fee)}`);
    lines.push(`💳 Total: *${money(subtotal + fee)}*`);

    lines.push(`\n👤 Nome: ${name}`);
    lines.push(`📞 Telefone: ${phone}`);
    lines.push(`📍 Endereço/Retirada: ${address}`);
    if (notes) lines.push(`📝 Obs: ${notes}`);

    window.open("pedido.html", "_blank");
    window.open(`https://wa.me/${cfg().whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  }

  /* HOME GRID */
  function mountHomeAcai(){
    const grid = $("#home-acai-grid");
    if (!grid || !window.CATALOG?.home_acai) return;

    grid.innerHTML = window.CATALOG.home_acai.map(p => {
      const hasPrice = typeof p.price === "number";
      const priceHtml = hasPrice ? `<div class="price">${money(p.price)}</div>` : `<div class="price">Personalizar</div>`;
      const badge = p.badge ? `<span class="badge">${esc(p.badge)}</span>` : "";
      const link = p.link ? `data-link="${esc(p.link)}"` : "";
      return `
        <article class="cardx" data-home-card="1" data-id="${esc(p.id)}" ${link}>
          <div class="thumb" style="background-image:url('${esc(p.img || "")}')">
            <span class="thumb__fallback">Imagem</span>
          </div>
          <div class="cardx__body">
            <div class="title-row">
              <h3>${esc(p.name)}</h3>
              ${badge}
            </div>
            <p>${esc(p.desc || "")}</p>
            <div class="bottom-row">
              ${priceHtml}
              <div class="tap">Toque para ${p.link ? "abrir" : "adicionar"}</div>
            </div>
          </div>
        </article>
      `;
    }).join("");

    $$('[data-home-card="1"]', grid).forEach(card => {
      card.addEventListener("click", () => {
        const link = card.dataset.link;
        const id = card.dataset.id;

        if (link) { window.location.href = link; return; }

        const p = window.CATALOG.home_acai.find(x => x.id === id);
        if (!p || typeof p.price !== "number") return;

        addItem({ id: p.id, name: p.name, desc: p.desc, price: p.price });
      });
    });
  }

  /* TOAST */
  let toastTimer = null;
  function toast(msg){
    let el = $("#toast");
    if (!el){
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast hidden";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>el.classList.add("hidden"), 1800);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    ensureFloatingWhats();
    ensureCartUI();
    mountHomeAcai();
  });
})();
