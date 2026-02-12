// js/app.js
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const cfg = () => window.APP_CONFIG || { whatsapp: "", brand: "Loja" };

  function money(v) {
    try {
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
    } catch {
      return `R$ ${Number(v).toFixed(2)}`.replace(".", ",");
    }
  }

  // =========================
  // CART STATE
  // =========================
  const LS_KEY = "lpgrill_cart_v1";
  let cart = load();

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
    updateBadge();
    renderCart();
  }

  function addItem(item) {
    const found = cart.find(x => x.id === item.id);
    if (found) found.qty += 1;
    else cart.push({ ...item, qty: 1 });
    save();
    toast("Adicionado ao carrinho ✅");
  }

  function decItem(id) {
    const found = cart.find(x => x.id === id);
    if (!found) return;
    found.qty -= 1;
    if (found.qty <= 0) cart = cart.filter(x => x.id !== id);
    save();
  }

  function incItem(id) {
    const found = cart.find(x => x.id === id);
    if (!found) return;
    found.qty += 1;
    save();
  }

  function removeItem(id) {
    cart = cart.filter(x => x.id !== id);
    save();
  }

  function clearCart() {
    cart = [];
    save();
  }

  function cartCount() {
    return cart.reduce((a, b) => a + (b.qty || 0), 0);
  }

  function cartTotal() {
    return cart.reduce((a, b) => a + (b.qty * b.price), 0);
  }

  // =========================
  // UI: CART MODAL
  // =========================
  function ensureCartUI() {
    if ($("#cart-fab")) return;

    const fab = document.createElement("button");
    fab.id = "cart-fab";
    fab.className = "cart-fab";
    fab.type = "button";
    fab.innerHTML = `
      <span class="cart-fab__icon">🛒</span>
      <span class="cart-fab__label">Carrinho</span>
      <span class="cart-fab__badge" id="cart-badge">0</span>
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
            <h3>Carrinho</h3>
            <p class="muted">Revise seu pedido e finalize no WhatsApp.</p>
          </div>
          <button class="icon-btn" type="button" data-close="1" aria-label="Fechar">✕</button>
        </div>

        <div class="modal__body">
          <div id="cart-empty" class="empty">
            <div class="empty__emoji">🧾</div>
            <div class="empty__title">Seu carrinho está vazio</div>
            <div class="empty__sub">Adicione itens para finalizar o pedido.</div>
          </div>

          <div id="cart-list" class="cart-list"></div>

          <div class="form-grid">
            <div>
              <label class="label">Nome (opcional)</label>
              <input id="ck-name" class="input" placeholder="Seu nome" />
            </div>
            <div>
              <label class="label">Telefone (opcional)</label>
              <input id="ck-phone" class="input" placeholder="(31) 9xxxx-xxxx" />
            </div>
            <div class="col-2">
              <label class="label">Endereço / Retirada</label>
              <input id="ck-address" class="input" placeholder="Rua, número, bairro, referência..." />
            </div>
            <div class="col-2">
              <label class="label">Observações</label>
              <textarea id="ck-notes" class="textarea" rows="3" placeholder="Ex: sem gelo, ponto da carne, pouco granola..."></textarea>
            </div>
          </div>
        </div>

        <div class="modal__footer">
          <div class="total">
            <span class="muted">Total</span>
            <strong id="cart-total">R$ 0,00</strong>
          </div>
          <button id="btn-finalizar" class="btn btn-purple" type="button">
            Finalizar o pedido
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    fab.addEventListener("click", () => openModal(true));
    modal.addEventListener("click", (e) => {
      const el = e.target;
      if (el?.dataset?.close) openModal(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") openModal(false);
    });

    $("#btn-finalizar").addEventListener("click", finalizeWhatsApp);

    updateBadge();
    renderCart();
  }

  function openModal(open) {
    const modal = $("#cart-modal");
    if (!modal) return;
    modal.classList.toggle("hidden", !open);
    document.body.classList.toggle("no-scroll", open);
  }

  function updateBadge() {
    const badge = $("#cart-badge");
    if (badge) badge.textContent = String(cartCount());
  }

  function renderCart() {
    const list = $("#cart-list");
    const empty = $("#cart-empty");
    const totalEl = $("#cart-total");
    if (!list || !empty || !totalEl) return;

    totalEl.textContent = money(cartTotal() + (cfg().deliveryFee || 0));

    if (cart.length === 0) {
      empty.classList.remove("hidden");
      list.innerHTML = "";
      return;
    }

    empty.classList.add("hidden");
    list.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item__main">
          <div class="cart-item__title">${escapeHTML(item.name)}</div>
          <div class="cart-item__sub">${escapeHTML(item.desc || "")}</div>
        </div>
        <div class="cart-item__right">
          <div class="cart-item__price">${money(item.price)}</div>
          <div class="qty">
            <button class="qty__btn" data-dec="${item.id}" type="button">−</button>
            <span class="qty__num">${item.qty}</span>
            <button class="qty__btn" data-inc="${item.id}" type="button">+</button>
          </div>
          <button class="link danger" data-rm="${item.id}" type="button">remover</button>
        </div>
      </div>
    `).join("");

    // events
    $$("[data-dec]", list).forEach(b => b.addEventListener("click", () => decItem(b.dataset.dec)));
    $$("[data-inc]", list).forEach(b => b.addEventListener("click", () => incItem(b.dataset.inc)));
    $$("[data-rm]", list).forEach(b => b.addEventListener("click", () => removeItem(b.dataset.rm)));
  }

  function finalizeWhatsApp() {
    if (cart.length === 0) {
      toast("Seu carrinho está vazio.");
      return;
    }

    const name = ($("#ck-name")?.value || "").trim();
    const phone = ($("#ck-phone")?.value || "").trim();
    const address = ($("#ck-address")?.value || "").trim();
    const notes = ($("#ck-notes")?.value || "").trim();

    const lines = [];
    lines.push(`Olá! Quero finalizar um pedido no ${cfg().brand}:`);
    lines.push("");
    cart.forEach(it => {
      lines.push(`• ${it.qty}x ${it.name} — ${money(it.qty * it.price)}`);
    });

    const subtotal = cartTotal();
    const taxa = cfg().deliveryFee || 0;
    lines.push("");
    lines.push(`Subtotal: ${money(subtotal)}`);
    if (taxa > 0) lines.push(`Taxa: ${money(taxa)}`);
    lines.push(`Total: ${money(subtotal + taxa)}`);

    if (name) lines.push(`\nNome: ${name}`);
    if (phone) lines.push(`Telefone: ${phone}`);
    if (address) lines.push(`Endereço/Retirada: ${address}`);
    if (notes) lines.push(`Obs: ${notes}`);

    const wa = cfg().whatsapp || "";
    const url = `https://wa.me/${wa}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank");
  }

  // =========================
  // RENDER PRODUCT LISTS
  // =========================
  function mountCatalog() {
    const root = document.querySelector("[data-catalog]");
    if (!root || !window.CATALOG) return;

    const catId = root.getAttribute("data-catalog");
    const cat = window.CATALOG.categories.find(c => c.id === catId);
    if (!cat) return;

    const grid = $("#catalog-grid", root);
    if (!grid) return;

    grid.innerHTML = cat.items.map(it => `
      <article class="p-card">
        <div class="p-card__top">
          <div>
            <h3>${escapeHTML(it.name)}</h3>
            <p>${escapeHTML(it.desc || "")}</p>
          </div>
          ${it.badge ? `<span class="badge">${escapeHTML(it.badge)}</span>` : ``}
        </div>
        <div class="p-card__bottom">
          <div class="p-price">${money(it.price)}</div>
          <button class="btn btn-outline" type="button" data-add="${it.id}">Adicionar</button>
        </div>
      </article>
    `).join("");

    $$("[data-add]", grid).forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.add;
        const item = cat.items.find(x => x.id === id);
        if (!item) return;
        addItem({ id: item.id, name: item.name, desc: item.desc, price: item.price });
      });
    });
  }

  // =========================
  // HOME HIGHLIGHTS
  // =========================
  function mountHighlights() {
    const wrap = document.querySelector("#highlights");
    if (!wrap || !window.CATALOG?.highlights) return;

    wrap.innerHTML = window.CATALOG.highlights.map(h => `
      <article class="h-card">
        <div class="h-card__info">
          <h3>${escapeHTML(h.title)}</h3>
          <p>${escapeHTML(h.subtitle)}</p>
        </div>
        <div class="h-card__meta">
          <span class="pill">${money(h.price)}</span>
          <a class="btn btn-outline" href="${h.link}">${escapeHTML(h.cta)}</a>
        </div>
      </article>
    `).join("");
  }

  // =========================
  // TOAST
  // =========================
  let toastTimer = null;
  function toast(msg) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast hidden";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add("hidden"), 1800);
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
    }[s]));
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureCartUI();
    mountCatalog();
    mountHighlights();
  });
})();
