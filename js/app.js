// js/app.js
(function () {
  const money = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => [...el.querySelectorAll(s)];

  const STORAGE_KEY = "acai_cart_v1";

  const state = {
    cart: loadCart(),
    coupon: null,
    mode: "delivery" // delivery | pickup
  };

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }
  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  }

  function isOpenNow() {
    const cfg = window.SITE?.hours?.open;
    if (!cfg) return true;

    const now = new Date();
    const day = now.getDay();
    const range = cfg[day];
    if (!range) return false;

    const [start, end] = range;
    const toMin = (hhmm) => {
      const [h,m] = hhmm.split(":").map(Number);
      return h*60+m;
    };
    const cur = now.getHours()*60 + now.getMinutes();
    return cur >= toMin(start) && cur <= toMin(end);
  }

  function cartAdd(item, extra = {}) {
    // extra: { addons:[], syrups:[], notes:"" }
    const line = {
      id: cryptoRandomId(),
      itemId: item.id,
      name: item.name,
      basePrice: item.price,
      qty: 1,
      addons: extra.addons || [],
      syrups: extra.syrups || [],
      notes: extra.notes || ""
    };
    state.cart.push(line);
    saveCart();
    renderCart();
    toast("Adicionado ao carrinho ✅");
  }

  function cartRemove(lineId) {
    state.cart = state.cart.filter(x => x.id !== lineId);
    saveCart();
    renderCart();
  }

  function cartQty(lineId, delta) {
    const it = state.cart.find(x => x.id === lineId);
    if (!it) return;
    it.qty = Math.max(1, it.qty + delta);
    saveCart();
    renderCart();
  }

  function lineTotal(line) {
    const addonsTotal = (line.addons || []).reduce((s,a)=>s+(a.price||0),0);
    const syrupsTotal = (line.syrups || []).reduce((s,a)=>s+(a.price||0),0);
    const unit = line.basePrice + addonsTotal + syrupsTotal;
    return unit * line.qty;
  }

  function cartSubtotal() {
    return state.cart.reduce((s,l)=>s+lineTotal(l),0);
  }

  function deliveryFee(subtotal) {
    const cfg = window.SITE?.checkout;
    if (state.mode === "pickup") return 0;
    if (!cfg) return 0;
    if (cfg.freeDeliveryOver != null && subtotal >= cfg.freeDeliveryOver) return 0;
    return cfg.deliveryFee || 0;
  }

  function applyCoupon(subtotal) {
    if (!state.coupon) return 0;
    const pct = window.SITE?.coupons?.[state.coupon];
    if (!pct) return 0;
    return subtotal * pct;
  }

  function totals() {
    const sub = cartSubtotal();
    const fee = deliveryFee(sub);
    const disc = applyCoupon(sub);
    const total = Math.max(0, sub + fee - disc);
    return { sub, fee, disc, total };
  }

  function renderHeader() {
    const b = window.SITE?.brand;
    if (!b) return;

    const nameEl = qs("[data-brand-name]");
    const slogEl = qs("[data-brand-slogan]");
    const addrEl = qs("[data-brand-address]");
    const instaEl = qs("[data-brand-instagram]");

    if (nameEl) nameEl.textContent = b.name;
    if (slogEl) slogEl.textContent = b.slogan;
    if (addrEl) addrEl.textContent = `${b.address} • ${b.city}`;
    if (instaEl) instaEl.href = b.instagram || "#";

    const badge = qs("[data-open-badge]");
    if (badge) {
      const open = isOpenNow();
      badge.textContent = open ? "ABERTO AGORA" : "FECHADO";
      badge.classList.toggle("ok", open);
      badge.classList.toggle("warn", !open);
    }
  }

  function renderCatalog(pageKey) {
    const cat = window.SITE?.catalog?.[pageKey];
    const grid = qs("[data-grid]");
    if (!cat || !grid) return;

    grid.innerHTML = "";

    // Cards
    (cat.items || []).forEach(item => {
      const card = document.createElement("div");
      card.className = "card product";

      card.innerHTML = `
        <div class="product__top">
          <div>
            <h3 class="product__title">${escapeHtml(item.name)}</h3>
            ${item.desc ? `<p class="muted">${escapeHtml(item.desc)}</p>` : ""}
          </div>
          <div class="price">${money(item.price)}</div>
        </div>

        ${pageKey === "acai" ? renderAcaiOptions(cat) : ""}

        <div class="product__actions">
          <button class="btn" data-add>Adicionar</button>
        </div>
      `;

      qs("[data-add]", card).addEventListener("click", () => {
        if (pageKey === "acai") {
          const addons = qsa('input[type="checkbox"][data-addon]:checked', card).map(i => ({
            id: i.value,
            name: i.dataset.name,
            price: Number(i.dataset.price || 0)
          }));
          const syrup = qsa('input[type="radio"][name^="syrup-"]:checked', card).map(i => ({
            id: i.value,
            name: i.dataset.name,
            price: Number(i.dataset.price || 0)
          }));
          const notes = (qs("[data-notes]", card)?.value || "").trim();
          cartAdd(item, { addons, syrups: syrup, notes });
        } else {
          cartAdd(item);
        }
      });

      grid.appendChild(card);
    });
  }

  function renderAcaiOptions(cat) {
    const addons = cat.addons || [];
    const syrups = cat.syrups || [];
    const groupId = cryptoRandomId();

    return `
      <div class="divider"></div>
      <div class="opts">
        <div class="opts__col">
          <h4>Adicionais</h4>
          <div class="chips">
            ${addons.map(a => `
              <label class="chip">
                <input type="checkbox" data-addon value="${escapeHtml(a.id)}" data-name="${escapeHtml(a.name)}" data-price="${a.price}">
                <span>${escapeHtml(a.name)} ${a.price ? `<b>+${money(a.price)}</b>` : ""}</span>
              </label>
            `).join("")}
          </div>
        </div>

        <div class="opts__col">
          <h4>Calda</h4>
          <div class="chips">
            <label class="chip">
              <input type="radio" name="syrup-${groupId}" checked value="" data-name="Sem calda" data-price="0">
              <span>Sem calda</span>
            </label>
            ${syrups.map(s => `
              <label class="chip">
                <input type="radio" name="syrup-${groupId}" value="${escapeHtml(s.id)}" data-name="${escapeHtml(s.name)}" data-price="${s.price}">
                <span>${escapeHtml(s.name)}</span>
              </label>
            `).join("")}
          </div>
        </div>

        <div class="opts__col">
          <h4>Observações</h4>
          <textarea class="textarea" data-notes placeholder="Ex: sem banana, pouco leite em pó..."></textarea>
        </div>
      </div>
    `;
  }

  function renderCart() {
    const list = qs("[data-cart-list]");
    const sum = qs("[data-cart-summary]");
    const badge = qs("[data-cart-badge]");

    if (badge) badge.textContent = String(state.cart.reduce((s,l)=>s+l.qty,0));

    if (!list || !sum) return;

    if (state.cart.length === 0) {
      list.innerHTML = `<div class="empty">Seu carrinho está vazio.</div>`;
      sum.innerHTML = "";
      return;
    }

    list.innerHTML = state.cart.map(line => {
      const addonsTxt = (line.addons || []).map(a => a.name).join(", ");
      const syrupsTxt = (line.syrups || []).map(s => s.name).join(", ");
      return `
        <div class="cartline">
          <div class="cartline__main">
            <div class="cartline__title">${escapeHtml(line.name)}</div>
            <div class="muted small">
              ${addonsTxt ? `+ ${escapeHtml(addonsTxt)}<br>` : ""}
              ${syrupsTxt ? `Calda: ${escapeHtml(syrupsTxt)}<br>` : ""}
              ${line.notes ? `Obs: ${escapeHtml(line.notes)}` : ""}
            </div>
          </div>
          <div class="cartline__right">
            <div class="cartline__price">${money(lineTotal(line))}</div>
            <div class="qty">
              <button class="iconbtn" data-qminus>−</button>
              <span>${line.qty}</span>
              <button class="iconbtn" data-qplus>+</button>
              <button class="iconbtn danger" title="Remover" data-remove>✕</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    qsa("[data-qminus]", list).forEach((btn, idx) => {
      btn.addEventListener("click", () => cartQty(state.cart[idx].id, -1));
    });
    qsa("[data-qplus]", list).forEach((btn, idx) => {
      btn.addEventListener("click", () => cartQty(state.cart[idx].id, +1));
    });
    qsa("[data-remove]", list).forEach((btn, idx) => {
      btn.addEventListener("click", () => cartRemove(state.cart[idx].id));
    });

    const t = totals();
    sum.innerHTML = `
      <div class="sumrow"><span>Subtotal</span><b>${money(t.sub)}</b></div>
      <div class="sumrow"><span>Entrega/Taxa</span><b>${money(t.fee)}</b></div>
      ${t.disc ? `<div class="sumrow"><span>Desconto (${state.coupon})</span><b>− ${money(t.disc)}</b></div>` : ""}
      <div class="sumrow total"><span>Total</span><b>${money(t.total)}</b></div>
    `;
  }

  function bindUI() {
    // Drawer cart
    const openBtn = qs("[data-open-cart]");
    const closeBtn = qs("[data-close-cart]");
    const drawer = qs("[data-cart-drawer]");
    if (openBtn && drawer) openBtn.addEventListener("click", () => drawer.classList.add("open"));
    if (closeBtn && drawer) closeBtn.addEventListener("click", () => drawer.classList.remove("open"));

    // Mode toggle delivery/pickup
    qsa("[data-mode]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.mode = btn.dataset.mode;
        qsa("[data-mode]").forEach(b=>b.classList.toggle("active", b.dataset.mode===state.mode));
        renderCart();
      });
    });

    // Coupon
    const cupBtn = qs("[data-apply-coupon]");
    if (cupBtn) {
      cupBtn.addEventListener("click", () => {
        const val = (qs("[data-coupon]")?.value || "").trim().toUpperCase();
        if (!val) { state.coupon = null; toast("Cupom removido."); renderCart(); return; }
        if (!window.SITE?.coupons?.[val]) { toast("Cupom inválido."); return; }
        state.coupon = val;
        toast(`Cupom aplicado: ${val} ✅`);
        renderCart();
      });
    }

    // Checkout WhatsApp
    const go = qs("[data-checkout]");
    if (go) go.addEventListener("click", checkoutWhatsApp);
  }

  function checkoutWhatsApp() {
    if (state.cart.length === 0) return toast("Carrinho vazio.");

    const open = isOpenNow();
    if (!open) toast("Estamos fechados agora — mas você pode enviar o pedido mesmo assim.");

    const name = (qs("[data-customer-name]")?.value || "").trim();
    const phone = (qs("[data-customer-phone]")?.value || "").trim();
    const addr = (qs("[data-customer-address]")?.value || "").trim();
    const pay = (qs("[data-payment]")?.value || "Pix").trim();
    const notes = (qs("[data-order-notes]")?.value || "").trim();

    if (!name) return toast("Informe seu nome.");
    if (state.mode === "delivery" && !addr) return toast("Informe o endereço para entrega.");

    const b = window.SITE?.brand;
    const t = totals();

    const lines = state.cart.map((l, i) => {
      const addons = (l.addons||[]).map(a=>a.name).join(", ");
      const syrups = (l.syrups||[]).map(s=>s.name).join(", ");
      const extra = [
        addons ? `Adicionais: ${addons}` : "",
        syrups ? `Calda: ${syrups}` : "",
        l.notes ? `Obs: ${l.notes}` : ""
      ].filter(Boolean).join(" | ");

      return `${i+1}. ${l.qty}x ${l.name} — ${money(lineTotal(l))}${extra ? `\n   (${extra})` : ""}`;
    }).join("\n");

    const msg =
`🍧 *NOVO PEDIDO — ${b?.name || "Loja"}*
${open ? "🟢 *ABERTO AGORA*" : "🟠 *FORA DO HORÁRIO* (vai para fila)"}

👤 *Nome:* ${name}
📞 *Telefone:* ${phone || "-"}
🚚 *Modo:* ${state.mode === "delivery" ? "Entrega" : "Retirada"}
📍 *Endereço:* ${state.mode === "delivery" ? addr : "Retirar na loja"}
💳 *Pagamento:* ${pay}
${state.coupon ? `🏷️ *Cupom:* ${state.coupon}` : ""}

🧾 *Itens:*
${lines}

────────────
Subtotal: ${money(t.sub)}
Taxa: ${money(t.fee)}
${t.disc ? `Desconto: − ${money(t.disc)}` : ""}
✅ *TOTAL: ${money(t.total)}*
────────────
📝 Observações: ${notes || "-"}

${window.SITE?.checkout?.pixKey ? `🔑 Pix: ${window.SITE.checkout.pixKey}` : ""}`.trim();

    const url = `https://wa.me/${b.phoneWhatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  function toast(text) {
    const el = qs("[data-toast]");
    if (!el) return alert(text);
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(()=>el.classList.remove("show"), 2200);
  }

  function cryptoRandomId() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  function escapeHtml(str="") {
    return String(str).replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[s]));
  }

  // Boot
  window.ACAI_APP = {
    render(pageKey) {
      renderHeader();
      renderCatalog(pageKey);
      bindUI();
      renderCart();
    },
    renderHeader,
    renderCart
  };
})();
