// js/acai-builder.js
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function money(v) {
    try {
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
    } catch {
      return `R$ ${Number(v).toFixed(2)}`.replace(".", ",");
    }
  }

  function init() {
    const root = $("#acai-builder");
    if (!root || !window.ACAI_MENU || !window.ACAI_RULES || !window.APP_CONFIG) return;

    // targets
    const sizesBox = $("#acai-sizes", root);
    const fruitsBox = $("#acai-fruits", root);
    const addonsBox = $("#acai-addons", root);
    const totalEl = $("#acai-total", root);
    const includedEl = $("#acai-included", root);
    const btnAdd = $("#acai-add-cart", root);
    const btnWhats = $("#acai-whats", root);
    const notes = $("#acai-notes", root);

    // render
    window.ACAI_MENU.sizes.forEach(s => {
      const row = document.createElement("label");
      row.className = "opt";
      row.innerHTML = `
        <input type="radio" name="acai-size" value="${s.id}" ${s.default ? "checked" : ""}>
        <span class="opt-title">${s.label}</span>
        <span class="opt-price">${money(s.price)}</span>
      `;
      sizesBox.appendChild(row);
    });

    window.ACAI_MENU.fruits.forEach(f => {
      const row = document.createElement("label");
      row.className = "opt";
      row.innerHTML = `
        <input type="checkbox" data-kind="extra" data-label="${f.label}" value="${f.id}">
        <span class="opt-title">${f.label}</span>
        <span class="opt-price"></span>
      `;
      fruitsBox.appendChild(row);
    });

    window.ACAI_MENU.addOns.forEach(a => {
      const row = document.createElement("label");
      row.className = "opt";
      row.innerHTML = `
        <input type="checkbox" data-kind="extra" data-label="${a.label}" value="${a.id}">
        <span class="opt-title">${a.label}</span>
        <span class="opt-price"></span>
      `;
      addonsBox.appendChild(row);
    });

    function getSize() {
      const sel = $('input[name="acai-size"]:checked', root);
      const id = sel ? sel.value : null;
      return window.ACAI_MENU.sizes.find(s => s.id === id) || window.ACAI_MENU.sizes[0];
    }

    function getExtrasLabels() {
      return $$('input[type="checkbox"][data-kind="extra"]:checked', root)
        .map(i => i.dataset.label);
    }

    function compute() {
      const size = getSize();
      const extras = getExtrasLabels();
      const free = window.ACAI_RULES.freeIncluded;
      const extraCount = Math.max(0, extras.length - free);
      const extraFee = extraCount * window.ACAI_RULES.extraFee;
      const total = size.price + extraFee;
      return { size, extras, extraCount, extraFee, total };
    }

    function update() {
      const { extras, extraCount, total } = compute();
      includedEl.textContent = `✅ Até ${window.ACAI_RULES.freeIncluded} adicionais inclusos • Acima disso: +${money(window.ACAI_RULES.extraFee)} por adicional`;
      totalEl.textContent = money(total);
      btnAdd.disabled = false;
      btnWhats.disabled = false;
      // label warning
      $("#acai-warning", root).textContent =
        extraCount > 0 ? `⚠️ ${extraCount} adicional(is) extra → acréscimo aplicado automaticamente.` : "";
    }

    function buildMessage() {
      const { size, extras, total } = compute();
      const lines = [];
      lines.push(`Olá! Quero montar um açaí no ${window.APP_CONFIG.brand}:`);
      lines.push(`Tamanho: ${size.label}`);
      lines.push(`Adicionais: ${extras.length ? extras.join(", ") : "Nenhum"}`);
      if (notes.value.trim()) lines.push(`Obs: ${notes.value.trim()}`);
      lines.push(`Total estimado: ${money(total)}`);
      return lines.join("\n");
    }

    function addToCart() {
      // Usa o carrinho do app.js (localStorage)
      const { size, extras, total } = compute();

      const id = `acai-${size.id}-${extras.sort().join("-") || "sem"}`;
      const desc = `Adicionais: ${extras.length ? extras.join(", ") : "Nenhum"}`;
      const item = { id, name: `Açaí ${size.label}`, desc, price: Number(total.toFixed(2)) };

      // adiciona no carrinho (mesma chave do app.js)
      try {
        const LS_KEY = "lpgrill_cart_v1";
        const raw = localStorage.getItem(LS_KEY);
        const cart = raw ? JSON.parse(raw) : [];
        const found = cart.find(x => x.id === item.id);
        if (found) found.qty += 1;
        else cart.push({ ...item, qty: 1 });
        localStorage.setItem(LS_KEY, JSON.stringify(cart));
        // força recarregar badge sem depender do app.js (mas funciona quando app.js está na página)
        const badge = document.querySelector("#cart-badge");
        if (badge) {
          const count = cart.reduce((a,b)=>a+(b.qty||0),0);
          badge.textContent = String(count);
        }
        // feedback
        const t = document.querySelector("#toast");
        if (t) { t.textContent = "Adicionado ao carrinho ✅"; t.classList.remove("hidden"); setTimeout(()=>t.classList.add("hidden"),1400); }
        else alert("Adicionado ao carrinho ✅");
      } catch {
        alert("Não foi possível adicionar ao carrinho.");
      }
    }

    function sendWhats() {
      const wa = window.APP_CONFIG.whatsapp;
      const url = `https://wa.me/${wa}?text=${encodeURIComponent(buildMessage())}`;
      window.open(url, "_blank");
    }

    root.addEventListener("change", update);
    notes.addEventListener("input", update);
    btnAdd.addEventListener("click", addToCart);
    btnWhats.addEventListener("click", sendWhats);

    update();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
