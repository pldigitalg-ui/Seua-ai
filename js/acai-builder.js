// js/acai-builder.js
(function () {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const cfg = () => window.APP_CONFIG || { brand:"LP Grill", whatsapp:"", deliveryFee: 0 };

  function money(v){
    try { return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v); }
    catch { return `R$ ${Number(v||0).toFixed(2)}`.replace(".",","); }
  }

  function init(){
    const root = $("#acai-builder");
    if (!root) return;

    // precisa existir o menu
    if (!window.ACAI_MENU || !window.ACAI_MENU.sizes) return;

    // caixas
    const sizeBox = $("#acai-sizes", root);
    const fruitBox = $("#acai-fruits", root);
    const addBox = $("#acai-addons", root);

    // UI
    const totalEl = $("#acai-total", root);
    const infoEl = $("#acai-info", root);
    const warnEl = $("#acai-warning", root);

    const btnAdd = $("#acai-add-cart", root);
    const btnWhats = $("#acai-whats", root);
    const notes = $("#acai-notes", root);

    if (!sizeBox || !fruitBox || !addBox || !totalEl || !infoEl || !warnEl || !btnAdd || !btnWhats || !notes){
      console.warn("Açaí Builder: algum ID do HTML não existe.");
      return;
    }

    // ---------- Normaliza preços (se você esquecer de colocar, vira 0) ----------
    const sizes = (window.ACAI_MENU.sizes || []).map(s => ({
      id: String(s.id),
      label: String(s.label || s.id),
      price: Number(s.price || 0),
      default: !!s.default
    }));

    // FRUTAS E ADICIONAIS: agora cada item pode ter preço
    const fruits = (window.ACAI_MENU.fruits || []).map(a => ({
      id: String(a.id),
      label: String(a.label || a.id),
      price: Number(a.price || 0)
    }));
    const addOns = (window.ACAI_MENU.addOns || []).map(a => ({
      id: String(a.id),
      label: String(a.label || a.id),
      price: Number(a.price || 0)
    }));

    // ---------- Render ----------
    sizeBox.innerHTML = "";
    fruitBox.innerHTML = "";
    addBox.innerHTML = "";

    // Tamanhos (cards com preço)
    sizes.forEach(s => {
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

    // helper pra render tile com preço
    function renderTile(item){
      const hasPrice = Number(item.price) > 0;
      const priceTag = hasPrice ? `<span class="pick__price">${money(item.price)}</span>` : ``;

      const el = document.createElement("label");
      el.className = "tile";
      el.innerHTML = `
        <input type="checkbox" data-kind="extra" data-id="${item.id}" value="${item.id}">
        <span class="tile__body">
          <span class="tile__title">${item.label}${hasPrice ? ` (+${money(item.price)})` : ""}</span>
          ${priceTag}
        </span>
      `;
      return el;
    }

    // Frutas (com preço)
    fruits.forEach(f => fruitBox.appendChild(renderTile(f)));

    // Add-ons (com preço)
    addOns.forEach(a => addBox.appendChild(renderTile(a)));

    // ---------- Seleções ----------
    function getSize(){
      const sel = $('input[name="acai-size"]:checked', root);
      const id = sel ? sel.value : sizes[0]?.id;
      return sizes.find(x => x.id === id) || sizes[0];
    }

    function getSelectedExtras(){
      const ids = $$('input[type="checkbox"][data-kind="extra"]:checked', root).map(i => i.value);
      const all = [...fruits, ...addOns];
      return ids.map(id => all.find(x => x.id === id)).filter(Boolean);
    }

    // ---------- Cálculo: tamanho + soma de TODOS adicionais ----------
    function compute(){
      const size = getSize();
      const extras = getSelectedExtras();

      const extrasTotal = extras.reduce((a,b)=> a + Number(b.price||0), 0);
      const base = Number(size?.price || 0);

      const total = Number((base + extrasTotal).toFixed(2));
      return { size, extras, base, extrasTotal, total };
    }

    function update(){
      const { size, extras, base, extrasTotal, total } = compute();

      // Info limpa e útil
      infoEl.textContent =
        `Tamanho: ${size.label} (${money(base)}) • Adicionais: ${extras.length} (${money(extrasTotal)})`;

      // aviso se não escolheu tamanho (caso extremo)
      warnEl.textContent = !size ? "⚠️ Selecione um tamanho para continuar." : "";

      totalEl.textContent = money(total);

      btnAdd.disabled = !size;
      btnWhats.disabled = !size;
    }

    // ---------- Carrinho (mesma chave do app.js) ----------
    const LS_KEY = "lpgrill_cart_v2";

    function addToCart(){
      const { size, extras, total } = compute();
      if (!size) return;

      // descrição detalhada com preço de cada adicional
      const extrasDesc = extras.length
        ? extras.map(x => `${x.label}${x.price ? ` (${money(x.price)})` : ""}`).join(", ")
        : "Nenhum";

      const id = `acai-${size.id}-${extras.map(x=>x.id).sort().join("-") || "sem"}`;
      const item = {
        id,
        name: `Açaí ${size.label}`,
        desc: `Adicionais: ${extrasDesc}`,
        price: total
      };

      let cart = [];
      try { cart = JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { cart = []; }

      const found = cart.find(x => x.id === item.id);
      if (found) found.qty += 1;
      else cart.push({ ...item, qty: 1 });

      localStorage.setItem(LS_KEY, JSON.stringify(cart));

      // badge se existir
      const badge = document.querySelector("#cart-badge");
      if (badge) badge.textContent = String(cart.reduce((a,b)=>a+(b.qty||0),0));

      // toast (cria se não existir)
      let t = document.querySelector("#toast");
      if (!t){
        t = document.createElement("div");
        t.id = "toast";
        t.className = "toast hidden";
        document.body.appendChild(t);
      }
      t.textContent = "Adicionado ao carrinho ✅";
      t.classList.remove("hidden");
      setTimeout(()=>t.classList.add("hidden"), 1400);
    }

    // ---------- WhatsApp (mensagem premium) ----------
    function sendWhats(){
      const { size, extras, base, extrasTotal, total } = compute();
      if (!size) return;

      const lines = [];
      lines.push(`🧾 *PEDIDO - ${cfg().brand}*`);
      lines.push("");
      lines.push(`🥣 *Açaí Montado*`);
      lines.push(`• Tamanho: ${size.label} — ${money(base)}`);

      if (extras.length){
        lines.push(`• Adicionais:`);
        extras.forEach(x => lines.push(`   - ${x.label}${x.price ? ` — ${money(x.price)}` : ""}`));
      } else {
        lines.push(`• Adicionais: Nenhum`);
      }

      const obs = (notes.value || "").trim();
      if (obs) { lines.push(""); lines.push(`📝 Obs: ${obs}`); }

      lines.push("");
      lines.push(`💰 Adicionais: ${money(extrasTotal)}`);
      lines.push(`💳 Total: *${money(total)}*`);

      const url = `https://wa.me/${cfg().whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(url, "_blank");
    }

    // Eventos
    root.addEventListener("change", update);
    notes.addEventListener("input", update);
    btnAdd.addEventListener("click", addToCart);
    btnWhats.addEventListener("click", sendWhats);

    update();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
