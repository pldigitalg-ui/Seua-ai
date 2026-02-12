// js/acai-builder.js
(function () {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const cfg = () => window.APP_CONFIG || { brand:"LP Grill", whatsapp:"" };

  function money(v){
    try { return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v); }
    catch { return `R$ ${Number(v).toFixed(2)}`.replace(".",","); }
  }

  function init(){
    const root = $("#acai-builder");
    if (!root || !window.ACAI_MENU || !window.ACAI_RULES) return;

    const sizeBox = $("#acai-sizes", root);
    const fruitBox = $("#acai-fruits", root);
    const addBox = $("#acai-addons", root);

    const totalEl = $("#acai-total", root);
    const infoEl = $("#acai-info", root);
    const warnEl = $("#acai-warning", root);

    const btnAdd = $("#acai-add-cart", root);
    const btnWhats = $("#acai-whats", root);
    const notes = $("#acai-notes", root);

    // Render sizes as cards
    window.ACAI_MENU.sizes.forEach(s => {
      const el = document.createElement("label");
      el.className = "pick";
      el.innerHTML = `
        <input type="radio" name="acai-size" value="${s.id}" ${s.default ? "checked" : ""}>
        <span class="pick__body">
          <span class="pick__title">${s.label}</span>
          <span class="pick__price">${money(s.price)}</span>
        </span>
      `;
      sizeBox.appendChild(el);
    });

    // Render fruits as selectable tiles
    window.ACAI_MENU.fruits.forEach(f => {
      const el = document.createElement("label");
      el.className = "tile";
      el.innerHTML = `
        <input type="checkbox" data-kind="extra" data-label="${f.label}" value="${f.id}">
        <span class="tile__body">
          <span class="tile__title">${f.label}</span>
        </span>
      `;
      fruitBox.appendChild(el);
    });

    // Render add-ons as selectable tiles
    window.ACAI_MENU.addOns.forEach(a => {
      const el = document.createElement("label");
      el.className = "tile";
      el.innerHTML = `
        <input type="checkbox" data-kind="extra" data-label="${a.label}" value="${a.id}">
        <span class="tile__body">
          <span class="tile__title">${a.label}</span>
        </span>
      `;
      addBox.appendChild(el);
    });

    function getSize(){
      const sel = $('input[name="acai-size"]:checked', root);
      const id = sel ? sel.value : window.ACAI_MENU.sizes[0].id;
      return window.ACAI_MENU.sizes.find(x => x.id === id) || window.ACAI_MENU.sizes[0];
    }

    function getExtras(){
      return $$('input[type="checkbox"][data-kind="extra"]:checked', root).map(i => i.dataset.label);
    }

    function compute(){
      const size = getSize();
      const extras = getExtras();
      const free = window.ACAI_RULES.freeIncluded;
      const extraCount = Math.max(0, extras.length - free);
      const extraFee = extraCount * window.ACAI_RULES.extraFee;
      const total = Number((size.price + extraFee).toFixed(2));
      return { size, extras, extraCount, extraFee, total };
    }

    function update(){
      const { extraCount, total } = compute();
      infoEl.textContent = `✅ Até ${window.ACAI_RULES.freeIncluded} adicionais inclusos • Acima disso: +${money(window.ACAI_RULES.extraFee)} por adicional extra`;
      totalEl.textContent = money(total);

      warnEl.textContent = extraCount > 0
        ? `⚠️ ${extraCount} adicional(is) extra — acréscimo aplicado automaticamente.`
        : "";

      btnAdd.disabled = false;
      btnWhats.disabled = false;
    }

    function addToCart(){
      const { size, extras, total } = compute();
      const id = `acai-${size.id}-${extras.slice().sort().join("-") || "sem"}`;
      const desc = `Adicionais: ${extras.length ? extras.join(", ") : "Nenhum"}`;
      const item = { id, name: `Açaí ${size.label}`, desc, price: total };

      // usa mesma chave do app.js
      const LS_KEY = "lpgrill_cart_v2";
      let cart = [];
      try { cart = JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { cart = []; }

      const found = cart.find(x => x.id === item.id);
      if (found) found.qty += 1; else cart.push({ ...item, qty: 1 });

      localStorage.setItem(LS_KEY, JSON.stringify(cart));

      // atualiza badge se existir
      const badge = document.querySelector("#cart-badge");
      if (badge) badge.textContent = String(cart.reduce((a,b)=>a+(b.qty||0),0));

      // toast se existir
      const t = document.querySelector("#toast");
      if (t){
        t.textContent = "Adicionado ao carrinho ✅";
        t.classList.remove("hidden");
        setTimeout(()=>t.classList.add("hidden"), 1400);
      }
    }

    function sendWhats(){
      const { size, extras, total } = compute();
      const lines = [];
      lines.push(`Olá! Quero montar um açaí no ${cfg().brand}:`);
      lines.push(`Tamanho: ${size.label}`);
      lines.push(`Adicionais: ${extras.length ? extras.join(", ") : "Nenhum"}`);
      if (notes.value.trim()) lines.push(`Obs: ${notes.value.trim()}`);
      lines.push(`Total estimado: ${money(total)}`);
      const url = `https://wa.me/${cfg().whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
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
